import { apiClient } from "./base";

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: Array<{
    index: number;
    data: SupplierImportRow;
    validation: {
      isValid: boolean;
      errors: Array<{ row: number; field: string; message: string }>;
      warnings: Array<{ row: number; field: string; message: string }>;
    };
  }>;
  columnMapping: Record<string, string>;
  detectedHeaders: string[];
}

export interface SupplierImportRow {
  name?: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  ramoAtividade?: string;
  tipoFornecedor?: string;
  prazoPagamento?: number;
  condicaoPagamento?: string;
  limiteCredito?: number;
  contatoPrincipal?: string;
  cargoContato?: string;
  notes?: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export const suppliersImportApi = {
  /**
   * Validate uploaded file
   */
  async validate(file: File, orgId: string, columnMapping?: Record<string, string>): Promise<ImportPreview> {
    // Convert file to base64
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await apiClient.post<{ success: boolean; preview: ImportPreview }>(
      `/suppliers/import/validate`,
      {
        fileName: file.name,
        fileContent,
        columnMapping,
      },
      {
        headers: {
          "x-org-id": orgId,
        },
      }
    );

    return response.data.preview;
  },

  /**
   * Execute import
   */
  async execute(rows: SupplierImportRow[], orgId: string): Promise<ImportResult> {
    const response = await apiClient.post<{ success: boolean; result: ImportResult }>(
      `/suppliers/import/execute`,
      { rows },
      {
        headers: {
          "x-org-id": orgId,
        },
      }
    );

    return response.data.result;
  },

  /**
   * Download template
   */
  async downloadTemplate(): Promise<void> {
    const response = await apiClient.get("/suppliers/import/template", {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_fornecedores.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

