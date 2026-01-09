// ============================================
// ОБНОВЛЕНО: Новая структура данных
// Material теперь всегда строка из PDF (истина!)
// ============================================

export interface Component {
  pos?: string;
  description: string;
  material: string; // ← ИЗМЕНЕНО: теперь строка (из PDF)
  bom_material?: string | null; // ← НОВОЕ: материал из BOM
  order_material?: string | null; // ← НОВОЕ: материал из Order
  quantity?: number | null; // ← ИЗМЕНЕНО: просто число (из BOM)
  manager_quantity?: number | null; // ← НОВОЕ: количество из Order
  status: "equal" | "notEqual" | "new"; // ← НОВОЕ: статус сравнения
  note?: string;
}

export interface Table1Field {
  field: string;
  value: string;
}

export interface Table3Field {
  [key: string]: string;
}

export interface ParsedData {
  table1: Table1Field[];
  table2: Component[];
  table3: Table3Field[];
}

export interface ValidationInfo {
  bom_validation: {
    valid: boolean;
    errors: string[];
  };
  bom_valid: boolean;
  bom_sheet: number;
  bom_components: number;
  manager_found: boolean;
  manager_row?: number;
  manager_materials?: number;
}

export interface ParseResponse {
  success: boolean;
  data?: ParsedData;
  validation?: ValidationInfo;
  error?: string;
}

export interface UploadFiles {
  pdf: File | null;
  bom: File | null;
  manager: File | null;
  bomSheetIndex: number;
}

export interface Statistics {
  total: number;
  equal: number;
  notEqual: number;
  newItems: number;
}

export interface EditableComponent extends Component {
  id: string;
  isEditing?: boolean;
  isSelected?: boolean;
}

// ============================================
// LEGACY SUPPORT (для обратной совместимости)
// ============================================
// Если backend вернет старую структуру - автоматически конвертируем

export interface LegacyMaterialInfo {
  value: string | null;
  isEqual: boolean | null;
  from_manager_data?: string | null;
  new_item: boolean;
}

export interface LegacyQuantityInfo {
  value: number;
  from_bom: boolean;
}

export interface LegacyComponent {
  pos?: string;
  description: string;
  material: LegacyMaterialInfo;
  quantity?: LegacyQuantityInfo;
  note?: string;
}

// Конвертер из старой структуры в новую
export function convertLegacyComponent(legacy: LegacyComponent): Component {
  const materialObj = legacy.material;

  // Определяем статус
  let status: "equal" | "notEqual" | "new" = "new";
  if (materialObj.new_item) {
    status = "new";
  } else if (materialObj.isEqual === false) {
    status = "notEqual";
  } else if (materialObj.isEqual === true) {
    status = "equal";
  }

  return {
    pos: legacy.pos,
    description: legacy.description,
    material: materialObj.value || "",
    bom_material: null,
    order_material: materialObj.from_manager_data || null,
    quantity: legacy.quantity?.value || null,
    manager_quantity: null,
    status: status,
    note: legacy.note,
  };
}

// Проверка: это legacy структура?
export function isLegacyComponent(comp: any): comp is LegacyComponent {
  return (
    comp.material &&
    typeof comp.material === "object" &&
    "value" in comp.material
  );
}
