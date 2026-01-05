import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
// Force recompile
import { parseAxiosError, type AppError } from "@/lib/errors";
import { RetryManager } from "@/lib/errors/retry-logic";
import { circuitBreakerManager, CircuitConfigs } from "@/lib/errors/circuit-breaker";
import { performanceMonitor } from "@/lib/errors/performance-monitor";
import { setupCSRFInterceptor } from "@/lib/security/csrf";

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

// Helper para gerar UUID no browser
function randomUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const API_BASE_URL = "/api";

export class ApiClient {
  private client: AxiosInstance;
  private retryManager: RetryManager;

  constructor() {
    this.retryManager = new RetryManager();
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Importante para cookies httpOnly
    });

    this.setupInterceptors();

    // Setup CSRF protection
    // TEMPORARY: Disabled CSRF for debugging login issue
    // setupCSRFInterceptor(this.client);
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log("🔷 [AXIOS] Request interceptor:", {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
        });

        // Adicionar organization ID se disponível
        if (typeof window !== "undefined") {
          const orgId = localStorage.getItem("selected_org_id");
          if (orgId) {
            config.headers["X-Organization-ID"] = orgId;
          }
        }

        // Adicionar correlation ID para rastreamento
        const correlationId = randomUUID();
        config.headers["X-Correlation-ID"] = correlationId;

        console.log("🔷 [AXIOS] Request will be sent to:", `${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error("🔴 [AXIOS] Request interceptor error:", error);
        return Promise.reject(error);
      },
    );

    // Response interceptor - handle errors with new error system
    this.client.interceptors.response.use(
      (response) => {
        console.log("🟢 [AXIOS_RESPONSE] Success response:", response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.log("🔴 [AXIOS_RESPONSE] Error interceptor called");
        console.log("🔴 [AXIOS_RESPONSE] Error object:", error);
        console.log("🔴 [AXIOS_RESPONSE] Has response?", !!error.response);
        console.log("🔴 [AXIOS_RESPONSE] Response status:", error.response?.status);
        console.log("🔴 [AXIOS_RESPONSE] Response data:", error.response?.data);
        console.log("🔴 [AXIOS_RESPONSE] Error message:", error.message);
        console.log("🔴 [AXIOS_RESPONSE] Error code:", error.code);
        console.log("🔴 [AXIOS_RESPONSE] Config URL:", error.config?.url);

        // Parse error using new error system (com auto-tracking)
        const appError = parseAxiosError(error);
        console.log("🔴 [AXIOS_RESPONSE] Parsed AppError:", appError);

        // Rastrear erro automaticamente com contexto da requisição
        if (typeof window !== "undefined") {
          try {
            const { errorTracking } = await import("@/lib/errors/error-tracking");
            await errorTracking.trackError(appError, {
              endpoint: error.config?.url,
              method: error.config?.method,
              requestData: error.config?.data,
            });
          } catch (trackError) {
            // Não propagar erro de tracking
            console.error("Failed to track error:", trackError);
          }
        }

        // Don't redirect to login if we're already on login/register endpoints
        const isAuthEndpoint =
          error.config?.url?.includes("/auth/login") ||
          error.config?.url?.includes("/auth/register");



        // Handle authentication errors
        if (
          appError.statusCode === 401 &&
          !isAuthEndpoint &&
          typeof window !== "undefined" &&
          !error.config?.skipAuthRedirect
        ) {
          window.location.href = "/login";
        }

        // Reject with parsed error
        console.log("🔴 [AXIOS_RESPONSE] Rejecting with appError");
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
    const startTime = Date.now();
    const circuitBreaker = circuitBreakerManager.getOrCreate(
      `GET:${url}`,
      CircuitConfigs.standard,
    );

    try {
      const result = await circuitBreaker.execute(async () => {
        return this.retryManager.executeWithRetry(
          async () => {
            const response = await this.client.get<T>(url, config);

            // Track performance
            performanceMonitor.track({
              endpoint: url,
              method: "GET",
              duration: Date.now() - startTime,
              status: response.status,
              timestamp: Date.now(),
              size: JSON.stringify(response.data).length,
            });

            // Se responseType é 'text', retornar response.data diretamente
            if (config?.responseType === "text") {
              return response.data as T;
            }
            return response.data;
          },
          {
            maxAttempts: 3,
            onRetry: (attempt, delay) => {
              console.log(`[API] Retrying GET ${url} (attempt ${attempt}, delay ${delay}ms)`);
            },
          },
        );
      });

      return result;
    } catch (error) {
      // Track failed performance
      performanceMonitor.track({
        endpoint: url,
        method: "GET",
        duration: Date.now() - startTime,
        status: (error as any).response?.status || 0,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    console.log("🟠 [API_CLIENT] post() called", { url, hasData: !!data });
    const startTime = Date.now();
    const circuitBreaker = circuitBreakerManager.getOrCreate(
      `POST:${url}`,
      CircuitConfigs.standard,
    );

    try {
      console.log("🟠 [API_CLIENT] About to execute circuit breaker");
      const result = await circuitBreaker.execute(async () => {
        console.log("🟠 [API_CLIENT] Inside circuit breaker, calling retry manager");
        return this.retryManager.executeWithRetry(
          async () => {
            console.log("🟠 [API_CLIENT] Inside retry manager, calling this.client.post");
            console.log("🟠 [API_CLIENT] Axios baseURL:", this.client.defaults.baseURL);
            console.log("🟠 [API_CLIENT] Full URL will be:", `${this.client.defaults.baseURL}${url}`);
            const response = await this.client.post<T>(url, data, config);
            console.log("🟠 [API_CLIENT] Got response from axios:", response.status);

            performanceMonitor.track({
              endpoint: url,
              method: "POST",
              duration: Date.now() - startTime,
              status: response.status,
              timestamp: Date.now(),
            });

            return response.data;
          },
          {
            maxAttempts: 2, // POST geralmente não deve retry tanto
            retryableErrors: ["NETWORK_ERROR", "TIMEOUT"],
          },
        );
      });

      return result;
    } catch (error) {
      performanceMonitor.track({
        endpoint: url,
        method: "POST",
        duration: Date.now() - startTime,
        status: (error as any).response?.status || 0,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const startTime = Date.now();
    const circuitBreaker = circuitBreakerManager.getOrCreate(
      `PUT:${url}`,
      CircuitConfigs.standard,
    );

    try {
      const result = await circuitBreaker.execute(async () => {
        const response = await this.client.put<T>(url, data, config);

        performanceMonitor.track({
          endpoint: url,
          method: "PUT",
          duration: Date.now() - startTime,
          status: response.status,
          timestamp: Date.now(),
        });

        return response.data;
      });

      return result;
    } catch (error) {
      performanceMonitor.track({
        endpoint: url,
        method: "PUT",
        duration: Date.now() - startTime,
        status: (error as any).response?.status || 0,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const startTime = Date.now();
    const circuitBreaker = circuitBreakerManager.getOrCreate(
      `DELETE:${url}`,
      CircuitConfigs.standard,
    );

    try {
      const result = await circuitBreaker.execute(async () => {
        const response = await this.client.delete<T>(url, config);

        performanceMonitor.track({
          endpoint: url,
          method: "DELETE",
          duration: Date.now() - startTime,
          status: response.status,
          timestamp: Date.now(),
        });

        return response.data;
      });

      return result;
    } catch (error) {
      performanceMonitor.track({
        endpoint: url,
        method: "DELETE",
        duration: Date.now() - startTime,
        status: (error as any).response?.status || 0,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const startTime = Date.now();
    const circuitBreaker = circuitBreakerManager.getOrCreate(
      `PATCH:${url}`,
      CircuitConfigs.standard,
    );

    try {
      const result = await circuitBreaker.execute(async () => {
        const response = await this.client.patch<T>(url, data, config);

        performanceMonitor.track({
          endpoint: url,
          method: "PATCH",
          duration: Date.now() - startTime,
          status: response.status,
          timestamp: Date.now(),
        });

        return response.data;
      });

      return result;
    } catch (error) {
      performanceMonitor.track({
        endpoint: url,
        method: "PATCH",
        duration: Date.now() - startTime,
        status: (error as any).response?.status || 0,
        timestamp: Date.now(),
      });
      throw error;
    }
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
