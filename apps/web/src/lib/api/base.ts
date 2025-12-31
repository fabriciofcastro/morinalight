import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
// Force recompile
import { parseAxiosError, type AppError } from "@/lib/errors";

// Helper para gerar UUID no browser
function randomUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para browsers antigos
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
}

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

    // Request interceptor - add organization header and correlation IDs
    this.client.interceptors.request.use(
      (config) => {
        // Add organization header if available
        const orgId = this.getOrgId();
        if (orgId) {
          // Backend espera x-org-id. Mantemos x-organization-id por compatibilidade.
          config.headers["x-org-id"] = orgId;
          config.headers["x-organization-id"] = orgId;
        }

        // Add correlation IDs for distributed tracing
        const correlationId = randomUUID();
        const traceId = randomUUID();
        const spanId = randomUUID();

        config.headers["x-correlation-id"] = correlationId;
        config.headers["x-trace-id"] = traceId;
        config.headers["x-span-id"] = spanId;

        // Preserve parent span ID if available
        if (config.headers["x-parent-span-id"]) {
          config.headers["x-parent-span-id"] = config.headers["x-parent-span-id"];
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle errors with new error system
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Parse error using new error system
        const appError = parseAxiosError(error);

        // Don't redirect to login if we're already on login/register endpoints
        const isAuthEndpoint =
          error.config?.url?.includes("/auth/login") ||
          error.config?.url?.includes("/auth/register");

        // Handle authentication errors
        if (appError.statusCode === 401 && !isAuthEndpoint && typeof window !== "undefined") {
          window.location.href = "/login";
        }

        // Reject with parsed error
        return Promise.reject(appError);
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
    // Se responseType é 'text', retornar response.data diretamente
    if (config?.responseType === "text") {
      return response.data as T;
    }
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

/**
 * Retorna headers com o tenant (organization ID) e headers de correlação
 * para requisições fetch no lado cliente
 */
export function getAuthHeadersWithTenant(): Record<string, string> {
  const headers: Record<string, string> = {};

  if (typeof window !== "undefined") {
    const orgId =
      localStorage.getItem("selected_org_id") ??
      localStorage.getItem("current_organization_id") ??
      null;

    if (orgId) {
      headers["x-org-id"] = orgId;
      headers["x-organization-id"] = orgId;
    }

    // Add correlation IDs
    headers["x-correlation-id"] = randomUUID();
    headers["x-trace-id"] = randomUUID();
    headers["x-span-id"] = randomUUID();
  }

  return headers;
}
