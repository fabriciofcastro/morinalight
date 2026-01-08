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

  async updateSettings(data: Partial<CompanySettingsFormData>, options?: { isDraft?: boolean }): Promise<CompanySettingsFormData> {
    let endpoint = "/company-settings";
    if (options?.isDraft) {
      endpoint += "?draft=true";
    }

    const response = await this.request<CompanySettingsFormData>(endpoint, {
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
        if (base64Data) {
          resolve(base64Data);
        } else {
          reject(new Error("Failed to extract base64 data"));
        }
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
  async extractCompanyData(file: File): Promise<{ rawText: string; extracted: Partial<CompanySettingsFormData> }> {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${API_BASE_URL}/intelligence/extract-company-data`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro desconhecido" }));
      throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
  async sendChatMessage(message: string, agentSlug: string, context?: any) {
    const response = await this.request<{ text: string, agent: string }>("/intelligence/chat", {
      method: "POST",
      body: JSON.stringify({ message, agentSlug, context }),
    });
    return response;
  }

  // ============================================================================
  // INTEGRATIONS (Phase 4)
  // ============================================================================

  async listApiKeys() {
    return this.request<any[]>("/integrations/api-keys");
  }

  async createApiKey(name: string) {
    return this.request<{ apiKey: any, secret: string }>("/integrations/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async revokeApiKey(id: string) {
    return this.request(`/integrations/api-keys/${id}`, {
      method: "DELETE",
    });
  }

  // ============================================================================
  // CONNECTORS (Phase 4.2)
  // ============================================================================

  async getAvailableConnectors() {
    return this.request<any[]>("/integrations/connectors/available");
  }

  async listConnections() {
    return this.request<any[]>("/integrations/connectors/connections");
  }

  async createConnection(data: { connectorType: string; name: string; credentials: any; config?: any }) {
    return this.request("/integrations/connectors/connections", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async testConnection(id: string) {
    return this.request<{ success: boolean }>(`/integrations/connectors/connections/${id}/test`, {
      method: "POST",
    });
  }

  async syncConnection(id: string, syncType: 'products' | 'orders' | 'customers') {
    return this.request(`/integrations/connectors/connections/${id}/sync`, {
      method: "POST",
      body: JSON.stringify({ syncType }),
    });
  }

  async deleteConnection(id: string) {
    return this.request(`/integrations/connectors/connections/${id}`, {
      method: "DELETE",
    });
  }

  // ============================================================================
  // ANALYTICS (Phase 5)
  // ============================================================================

  async getMetrics(metricType?: string) {
    const params = metricType ? `?type=${metricType}` : '';
    return this.request<any[]>(`/analytics/metrics${params}`);
  }

  async getBenchmark(metricType: string) {
    return this.request<any>(`/analytics/benchmark/${metricType}`);
  }

  async logUsage(action: string, resource: string, metadata?: any) {
    return this.request("/analytics/log", {
      method: "POST",
      body: JSON.stringify({ action, resource, metadata }),
    });
  }
}

export const companySettingsAPI = new CompanySettingsAPI();










