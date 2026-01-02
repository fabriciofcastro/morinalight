/**
 * Parser de Erros da API
 * 
 * Converte respostas de erro da API em objetos AppError
 * padronizados para uso no frontend.
 */

import type { AxiosError } from "axios";
import { AppError, type ApiErrorResponse } from "./types";
// Force absolute path to fix cache issue
import { ErrorCode } from "@/lib/errors/error-codes";

/**
 * Verificar se é uma resposta de erro da API
 */
function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "object" &&
    (data as { error: { code?: unknown } }).error !== null &&
    "code" in (data as { error: Record<string, unknown> }).error &&
    "message" in (data as { error: Record<string, unknown> }).error
  );
}

/**
 * Extrair headers de correlação
 */
function extractCorrelationHeaders(headers: Record<string, unknown>): {
  correlationId?: string;
  traceId?: string;
  requestId?: string;
} {
  return {
    correlationId: headers["x-correlation-id"] as string | undefined,
    traceId: headers["x-trace-id"] as string | undefined,
    requestId: headers["x-request-id"] as string | undefined,
  };
}

/**
 * Parsear erro do Axios
 */
export function parseAxiosError(error: AxiosError<ApiErrorResponse>): AppError {
  const statusCode = error.response?.status || 0;
  const headers = error.response?.headers || {};
  const correlation = extractCorrelationHeaders(headers);

  // Erro de rede (sem resposta)
  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return new AppError(
        ErrorCode.TIMEOUT,
        "A requisição demorou muito para responder",
        statusCode || 504,
        {
          correlationId: correlation.correlationId,
          traceId: correlation.traceId,
          requestId: correlation.requestId,
        },
      );
    }

    if (error.message.includes("Network Error")) {
      return new AppError(
        ErrorCode.NETWORK_ERROR,
        "Erro de conexão com o servidor",
        statusCode || 0,
        {
          correlationId: correlation.correlationId,
          traceId: correlation.traceId,
          requestId: correlation.requestId,
        },
      );
    }

    return new AppError(
      ErrorCode.NETWORK_ERROR,
      error.message || "Erro de conexão",
      statusCode || 0,
      {
        correlationId: correlation.correlationId,
        traceId: correlation.traceId,
        requestId: correlation.requestId,
      },
    );
  }

  // Erro com resposta da API
  const responseData = error.response.data;

  if (isApiErrorResponse(responseData)) {
    const errorData = responseData.error;
    const retryAfter = error.response.headers["retry-after"]
      ? Number(error.response.headers["retry-after"])
      : errorData.retryAfter;

    return new AppError(
      errorData.code,
      errorData.message,
      statusCode,
      {
        fields: errorData.fields,
        context: errorData.context,
        correlationId:
          errorData.correlation?.correlationId || correlation.correlationId,
        traceId: errorData.correlation?.traceId || correlation.traceId,
        requestId: errorData.correlation?.requestId || correlation.requestId,
        retryAfter,
      },
    );
  }

  // Erro HTTP genérico sem formato padronizado
  const message =
    typeof responseData === "string"
      ? responseData
      : (responseData as { message?: string })?.message ||
      error.message ||
      `Erro HTTP ${statusCode}`;

  return new AppError(
    `HTTP_${statusCode}`,
    message,
    statusCode,
    {
      correlationId: correlation.correlationId,
      traceId: correlation.traceId,
      requestId: correlation.requestId,
    },
  );
}

/**
 * Parsear erro genérico
 * 
 * @param error - Erro a ser parseado
 * @param autoTrack - Se true, rastreia o erro automaticamente (padrão: true)
 */
export function parseError(error: unknown, autoTrack = true): AppError {
  // Já é um AppError
  if (error instanceof AppError) {
    // Rastrear erro se habilitado
    if (autoTrack && typeof window !== "undefined") {
      // Importação dinâmica para evitar dependência circular
      import("./error-tracking").then(({ errorTracking }) => {
        errorTracking.trackError(error).catch(console.error);
      }).catch(console.error);
    }
    return error;
  }

  // Erro do Axios
  if (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as { isAxiosError: boolean }).isAxiosError
  ) {
    const appError = parseAxiosError(error as AxiosError<ApiErrorResponse>);

    // Rastrear erro se habilitado
    if (autoTrack && typeof window !== "undefined") {
      import("./error-tracking").then(({ errorTracking }) => {
        errorTracking.trackError(appError).catch(console.error);
      }).catch(console.error);
    }

    return appError;
  }

  // Erro padrão do JavaScript
  if (error instanceof Error) {
    const appError = new AppError(
      ErrorCode.INTERNAL_ERROR,
      error.message,
      500,
      {
        context: {
          originalError: error.name,
          stack: error.stack,
        },
      },
    );

    // Rastrear erro se habilitado
    if (autoTrack && typeof window !== "undefined") {
      import("./error-tracking").then(({ errorTracking }) => {
        errorTracking.trackError(appError).catch(console.error);
      }).catch(console.error);
    }

    return appError;
  }

  // Erro desconhecido
  const appError = new AppError(
    ErrorCode.INTERNAL_ERROR,
    String(error) || "Erro desconhecido",
    500,
  );

  // Rastrear erro se habilitado
  if (autoTrack && typeof window !== "undefined") {
    import("./error-tracking").then(({ errorTracking }) => {
      errorTracking.trackError(appError).catch(console.error);
    }).catch(console.error);
  }

  return appError;
}

/**
 * Verificar se erro é retryable
 */
export function isRetryableError(error: unknown): boolean {
  const appError = parseError(error);
  return appError.isRetryable;
}

/**
 * Obter tempo de retry (em ms)
 */
export function getRetryDelay(error: unknown, attempt: number): number {
  const appError = parseError(error);

  // Se tem retryAfter, usar ele
  if (appError.retryAfter) {
    return appError.retryAfter * 1000; // Converter segundos para ms
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 30s)
  const baseDelay = 1000;
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  return Math.min(exponentialDelay, 30000);
}









