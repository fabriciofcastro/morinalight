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

    // Request interceptor - add auth token and organization
    this.client.interceptors.request.use(
      (config) => {
        // Add JWT token if available
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add organization header if available
        const orgId = this.getOrganizationId();
        if (orgId) {
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

        if (error.response?.status === 401 && !isAuthEndpoint) {
          // Token expired or invalid - redirect to login
          this.clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  private getOrganizationId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("current_organization_id");
  }

  private clearAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_organization_id");
    localStorage.removeItem("user_data");
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
