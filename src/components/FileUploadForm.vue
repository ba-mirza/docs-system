<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useParserStore } from "../stores/parser.store";

const store = useParserStore();
const { uploadFiles, isLoading } = storeToRefs(store);
const { setUploadFiles, parsePdf } = store;

const isDragging = ref(false);

const pdfFileName = computed(() => uploadFiles.value.pdf?.name || "");
const bomFileName = computed(() => uploadFiles.value.bom?.name || "");
const managerFileName = computed(() => uploadFiles.value.manager?.name || "");

const canParse = computed(() => {
    return (
        uploadFiles.value.pdf &&
        uploadFiles.value.bom &&
        uploadFiles.value.manager &&
        !isLoading.value
    );
});

const handlePdfUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && file.type === "application/pdf") {
        setUploadFiles({ pdf: file });
    } else {
        alert("Please upload a PDF file");
    }
};

const handleBomUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && isExcelFile(file)) {
        setUploadFiles({ bom: file });
    } else {
        alert("Please upload an Excel file (.xlsx)");
    }
};

const handleManagerUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && isExcelFile(file)) {
        setUploadFiles({ manager: file });
    } else {
        alert("Please upload an Excel file (.xlsx)");
    }
};

const handleSheetIndexChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    setUploadFiles({ bomSheetIndex: parseInt(target.value) });
};

const isExcelFile = (file: File): boolean => {
    return (
        file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx")
    );
};

const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = false;
};

const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
};

const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = false;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
        if (file.type === "application/pdf") {
            setUploadFiles({ pdf: file });
        } else if (isExcelFile(file)) {
            if (!uploadFiles.value.bom) {
                setUploadFiles({ bom: file });
            } else if (!uploadFiles.value.manager) {
                setUploadFiles({ manager: file });
            }
        }
    });
};

const handleParse = () => {
    if (canParse.value) {
        parsePdf();
    }
};

const removeFile = (type: "pdf" | "bom" | "manager") => {
    setUploadFiles({ [type]: null });
};
</script>

<template>
    <div class="upload-form-container">
        <div class="upload-header">
            <h2 class="text-2xl font-bold text-gray-800">📄 Upload Files</h2>
            <p class="text-gray-600 mt-1">
                Drag and drop files or click to browse
            </p>
        </div>

        <div
            class="drop-zone"
            :class="{ 'drop-zone-active': isDragging }"
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
            @dragover="handleDragOver"
            @drop="handleDrop"
        >
            <div class="drop-zone-content">
                <div class="drop-icon">📦</div>
                <p class="drop-text">
                    Drop files here or click upload buttons below
                </p>
            </div>

            <div class="files-grid">
                <div class="file-input-card">
                    <div class="file-input-header">
                        <span class="file-icon">📄</span>
                        <span class="file-label">PDF Schema</span>
                    </div>

                    <input
                        type="file"
                        accept=".pdf"
                        @change="handlePdfUpload"
                        class="hidden"
                        id="pdf-input"
                    />

                    <label
                        v-if="!pdfFileName"
                        for="pdf-input"
                        class="file-input-button"
                    >
                        Choose PDF
                    </label>

                    <div v-else class="file-preview">
                        <span class="file-name">{{ pdfFileName }}</span>
                        <button
                            @click="removeFile('pdf')"
                            class="remove-button"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div class="file-input-card">
                    <div class="file-input-header">
                        <span class="file-icon">📊</span>
                        <span class="file-label">BOM Excel</span>
                    </div>

                    <input
                        type="file"
                        accept=".xlsx"
                        @change="handleBomUpload"
                        class="hidden"
                        id="bom-input"
                    />

                    <label
                        v-if="!bomFileName"
                        for="bom-input"
                        class="file-input-button"
                    >
                        Choose Excel
                    </label>

                    <div v-else class="file-preview">
                        <span class="file-name">{{ bomFileName }}</span>
                        <button
                            @click="removeFile('bom')"
                            class="remove-button"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div class="file-input-card">
                    <div class="file-input-header">
                        <span class="file-icon">📋</span>
                        <span class="file-label">Manager Excel</span>
                    </div>

                    <input
                        type="file"
                        accept=".xlsx"
                        @change="handleManagerUpload"
                        class="hidden"
                        id="manager-input"
                    />

                    <label
                        v-if="!managerFileName"
                        for="manager-input"
                        class="file-input-button"
                    >
                        Choose Excel
                    </label>

                    <div v-else class="file-preview">
                        <span class="file-name">{{ managerFileName }}</span>
                        <button
                            @click="removeFile('manager')"
                            class="remove-button"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>

            <div class="sheet-selector">
                <label for="sheet-select" class="sheet-label">
                    BOM Sheet Index(Foglio):
                </label>
                <select
                    id="sheet-select"
                    :value="uploadFiles.bomSheetIndex"
                    @change="handleSheetIndexChange"
                    class="sheet-select"
                >
                    <option v-for="i in 14" :key="i" :value="i - 1">
                        Sheet {{ i }} (Index: {{ i - 1 }})
                    </option>
                </select>
            </div>

            <button
                @click="handleParse"
                :disabled="!canParse"
                class="parse-button"
                :class="{ 'parse-button-disabled': !canParse }"
            >
                <span v-if="!isLoading">Parse Files</span>
                <span v-else>Parsing...</span>
            </button>
        </div>
    </div>
</template>
