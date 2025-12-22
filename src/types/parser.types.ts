export interface MaterialInfo {
  value: string | null;
  isEqual: boolean | null;
  from_manager_data?: string | null;
  new_item: boolean;
}

export interface QuantityInfo {
  value: number;
  from_bom: boolean;
}

export interface Component {
  pos?: string;
  description: string;
  material: MaterialInfo;
  quantity?: QuantityInfo;
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
