import type { CompanySettingsFormData } from "@/schemas/company-settings-advanced";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export interface CompanySettingsResponse {
  data: CompanySettingsFormData;
}

export interface UploadFileResponse {
  url: string;
  storageKey: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  size: number;
  description?: string | null;
  uploadedAt: string;
  uploadedBy: string;
}

class CompanySettingsAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro desconhecido" }));
      throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getSettings(): Promise<CompanySettingsFormData> {
    const response = await this.request<CompanySettingsResponse>("/company-settings");
    return response.data || response;
  }

  async updateSettings(data: Partial<CompanySettingsFormData>): Promise<CompanySettingsFormData> {
    const response = await this.request<CompanySettingsFormData>("/company-settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  }

  async uploadFile(
    file: File,
    fileType: "logo" | "certificate" | "document" | "favicon" | "banner",
    description?: string,
  ): Promise<UploadFileResponse> {
    // Converter arquivo para base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await this.request<UploadFileResponse>("/company-settings/upload", {
      method: "POST",
      body: JSON.stringify({
        fileType,
        fileName: file.name,
        fileBase64: base64,
        mimeType: file.type,
        description: description || null,
      }),
    });

    return response;
  }

  async uploadFileMultipart(
    file: File,
    fileType: "logo" | "certificate" | "document" | "favicon" | "banner",
    description?: string,
  ): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append("file", file);
    
    const headers: Record<string, string> = {
      "x-file-type": fileType,
    };
    
    if (description) {
      headers["x-description"] = description;
    }

    const url = `${API_BASE_URL}/company-settings/upload`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro desconhecido" }));
      throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

export const companySettingsAPI = new CompanySettingsAPI();









