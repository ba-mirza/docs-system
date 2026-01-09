import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  ParseResponse,
  EditableComponent,
  UploadFiles,
  Statistics,
} from "../types/parser.types";
import {
  isLegacyComponent,
  convertLegacyComponent,
} from "../types/parser.types";
import { ApiService } from "../services/api.service";

export const useParserStore = defineStore("parser", () => {
  const uploadFiles = ref<UploadFiles>({
    pdf: null,
    bom: null,
    manager: null,
    bomSheetIndex: 0,
  });

  const parseResult = ref<ParseResponse | null>(null);
  const editableComponents = ref<EditableComponent[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ОБНОВЛЕНО: используем новое поле status
  const statistics = computed<Statistics>(() => {
    const components = editableComponents.value;
    return {
      total: components.length,
      equal: components.filter((c) => c.status === "equal").length,
      notEqual: components.filter((c) => c.status === "notEqual").length,
      newItems: components.filter((c) => c.status === "new").length,
    };
  });

  const technicalParams = computed(() => {
    if (!parseResult.value?.data?.table1) return {};

    const params: Record<string, string> = {};
    parseResult.value.data.table1.forEach((item) => {
      params[item.field] = item.value;
    });
    return params;
  });

  const setUploadFiles = (files: Partial<UploadFiles>) => {
    uploadFiles.value = { ...uploadFiles.value, ...files };
  };

  const parsePdf = async () => {
    if (
      !uploadFiles.value.pdf ||
      !uploadFiles.value.bom ||
      !uploadFiles.value.manager
    ) {
      error.value = "Please upload all required files";
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await ApiService.parsePdf(
        uploadFiles.value.pdf,
        uploadFiles.value.bom,
        uploadFiles.value.manager,
        uploadFiles.value.bomSheetIndex,
      );

      if (!result.success) {
        throw new Error(result.error || "Parsing failed");
      }

      parseResult.value = result;

      // ОБНОВЛЕНО: добавлена поддержка legacy структуры
      editableComponents.value =
        result.data?.table2.map((comp, index) => {
          // Если это старая структура - конвертируем
          const normalizedComp = isLegacyComponent(comp)
            ? convertLegacyComponent(comp)
            : comp;

          return {
            ...normalizedComp,
            id: `comp-${index}-${Date.now()}`,
            isEditing: false,
            isSelected: false,
          } as EditableComponent;
        }) || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Parsing error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateComponent = (id: string, updates: Partial<EditableComponent>) => {
    const index = editableComponents.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      editableComponents.value[index] = {
        ...editableComponents.value[index],
        ...updates,
      };
    }
  };

  // ОБНОВЛЕНО: новая структура данных
  const addNewComponent = () => {
    const newComp: EditableComponent = {
      id: `comp-new-${Date.now()}`,
      pos: "",
      description: "",
      material: "",
      bom_material: null,
      order_material: null,
      quantity: null,
      manager_quantity: null,
      status: "new",
      note: "",
      isEditing: true,
      isSelected: false,
    };
    editableComponents.value.push(newComp);
  };

  const deleteComponent = (id: string) => {
    editableComponents.value = editableComponents.value.filter(
      (c) => c.id !== id,
    );
  };

  const deleteSelected = () => {
    editableComponents.value = editableComponents.value.filter(
      (c) => !c.isSelected,
    );
  };

  const toggleSelection = (id: string) => {
    const comp = editableComponents.value.find((c) => c.id === id);
    if (comp) {
      comp.isSelected = !comp.isSelected;
    }
  };

  const selectAll = (selected: boolean) => {
    editableComponents.value.forEach((c) => {
      c.isSelected = selected;
    });
  };

  const exportToExcel = async () => {
    if (!parseResult.value) {
      error.value = "No data to export";
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const updatedData = {
        ...parseResult.value,
        data: {
          ...parseResult.value.data!,
          table2: editableComponents.value.map((comp) => {
            const { id, isEditing, isSelected, ...cleanComp } = comp;
            return cleanComp;
          }),
        },
      };

      const blob = await ApiService.exportToExcel(updatedData);
      ApiService.downloadExcel(blob, `parsing_result_${Date.now()}.xlsx`);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Export failed";
      console.error("Export error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const saveDraft = () => {
    const draft = {
      parseResult: parseResult.value,
      editableComponents: editableComponents.value,
      timestamp: Date.now(),
    };
    localStorage.setItem("parser-draft", JSON.stringify(draft));
  };

  const loadDraft = () => {
    const saved = localStorage.getItem("parser-draft");
    if (saved) {
      const draft = JSON.parse(saved);
      parseResult.value = draft.parseResult;
      editableComponents.value = draft.editableComponents;
      return true;
    }
    return false;
  };

  const reset = () => {
    uploadFiles.value = {
      pdf: null,
      bom: null,
      manager: null,
      bomSheetIndex: 0,
    };
    parseResult.value = null;
    editableComponents.value = [];
    error.value = null;
    isLoading.value = false;
  };

  return {
    uploadFiles,
    parseResult,
    editableComponents,
    isLoading,
    error,

    statistics,
    technicalParams,

    setUploadFiles,
    parsePdf,
    updateComponent,
    addNewComponent,
    deleteComponent,
    deleteSelected,
    toggleSelection,
    selectAll,
    exportToExcel,
    saveDraft,
    loadDraft,
    reset,
  };
});
