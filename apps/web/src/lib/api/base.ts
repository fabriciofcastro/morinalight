import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

const API_BASE_URL = "/api";

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor - add organization header (token é cookie httpOnly)
    this.client.interceptors.request.use(
      (config) => {
        // Add organization header if available
        const orgId = this.getOrgId();
        if (orgId) {
          // Backend espera x-org-id. Mantemos x-organization-id por compatibilidade.
          config.headers["x-org-id"] = orgId;
          config.headers["x-organization-id"] = orgId;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Don't redirect to login if we're already on login/register endpoints
        const isAuthEndpoint =
          error.config?.url?.includes("/auth/login") ||
          error.config?.url?.includes("/auth/register");

        if (error.response?.status === 401 && !isAuthEndpoint && typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  private getOrgId(): string | null {
    if (typeof window === "undefined") return null;
    // Padrão do app: selected_org_id. Mantemos fallback para chaves antigas.
    return (
      localStorage.getItem("selected_org_id") ??
      localStorage.getItem("current_organization_id") ??
      localStorage.getItem("current_organization_id".toUpperCase()) ??
      null
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
