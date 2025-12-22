import type { ParseResponse } from "../types/parser.types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const getApiKey = (): string => {
  const key = localStorage.getItem("claude_api_key");
  if (!key) {
    throw new Error("API key not configured");
  }
  return key;
};

export class ApiService {
  static async parsePdf(
    pdfFile: File,
    bomFile: File,
    managerFile: File,
    bomSheetIndex: number,
  ): Promise<ParseResponse> {
    const formData = new FormData();
    formData.append("pdf_file", pdfFile);
    formData.append("excel_bom", bomFile);
    formData.append("excel_manager", managerFile);
    formData.append("bom_sheet_index", bomSheetIndex.toString());

    const response = await fetch(`${API_BASE_URL}/api/parse-pdf`, {
      method: "POST",
      body: formData,
      headers: {
        "X-API-Key": getApiKey(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  static async exportToExcel(data: ParseResponse): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/export-excel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  static downloadExcel(blob: Blob, filename: string = "parsing_result.xlsx") {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
