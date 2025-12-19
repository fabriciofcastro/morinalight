/**
 * Hooks para Tratamento de Erros
 * 
 * Hooks React para facilitar o tratamento de erros em componentes.
 */

import { useCallback, useState, useRef, useEffect } from "react";
import { parseError, isRetryableError, getRetryDelay, type AppError } from "./parser";
import { getUserFriendlyMessage } from "./user-messages";
import { notificationCenter } from "@/components/notifications/notification-center";

/**
 * Opções para useErrorHandler
 */
interface UseErrorHandlerOptions {
  /**
   * Mostrar notificação automática
   */
  showNotification?: boolean;
  /**
   * Nível de log
   */
  logLevel?: "error" | "warn" | "info";
  /**
   * Callback customizado para tratamento
   */
  onError?: (error: AppError) => void;
  /**
   * Callback para erros recuperáveis
   */
  onRetryableError?: (error: AppError) => void;
}

/**
 * Hook para tratamento de erros
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    showNotification = true,
    logLevel = "error",
    onError,
    onRetryableError,
  } = options;

  const handleError = useCallback(
    (error: unknown) => {
      const appError = parseError(error);

      // Log do erro
      console[logLevel]("Error handled:", appError);

      // Callback customizado
      onError?.(appError);

      // Tratamento de erros recuperáveis
      if (appError.isRetryable) {
        onRetryableError?.(appError);
      }

      // Mostrar notificação com mensagem amigável
      if (showNotification) {
        const friendly = getUserFriendlyMessage(appError);
        notificationCenter.add({
          type: friendly.severity === "critical" ? "error" : friendly.severity,
          title: friendly.title,
          message: friendly.message,
          duration: appError.severity === "critical" ? 10000 : 5000,
        });
      }

      return appError;
    },
    [showNotification, logLevel, onError, onRetryableError],
  );

  return { handleError };
}

/**
 * Opções para useAsyncError
 */
interface UseAsyncErrorOptions extends UseErrorHandlerOptions {
  /**
   * Tentar novamente automaticamente em caso de erro recuperável
   */
  autoRetry?: boolean;
  /**
   * Número máximo de tentativas
   */
  maxRetries?: number;
  /**
   * Delay entre tentativas (ms)
   */
  retryDelay?: number;
}

/**
 * Hook para tratamento de erros em operações assíncronas
 */
export function useAsyncError<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncErrorOptions = {},
) {
  const {
    showNotification = true,
    autoRetry = false,
    maxRetries = 3,
    retryDelay,
    ...errorHandlerOptions
  } = options;

  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { handleError } = useErrorHandler(errorHandlerOptions);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setRetryCount(0);
      return result;
    } catch (err) {
      const appError = handleError(err);
      setError(appError);

      // Retry automático se habilitado e erro for recuperável
      if (
        autoRetry &&
        appError.isRetryable &&
        retryCount < maxRetries
      ) {
        const delay = retryDelay || getRetryDelay(appError, retryCount + 1);

        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          void execute();
        }, delay);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, handleError, autoRetry, maxRetries, retryCount, retryDelay]);

  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    return execute();
  }, [execute]);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    execute,
    retry,
    error,
    loading,
    retryCount,
  };
}

/**
 * Hook para rastreamento de erros
 */
export function useErrorTracking() {
  const trackError = useCallback((error: unknown, context?: Record<string, unknown>) => {
    const appError = parseError(error);

    // Log estruturado
    console.error("Error tracked:", {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      category: appError.category,
      severity: appError.severity,
      correlationId: appError.correlationId,
      traceId: appError.traceId,
      requestId: appError.requestId,
      context,
    });

    // TODO: Enviar para serviço de monitoramento (ex: Sentry, LogRocket)
    // Exemplo:
    // Sentry.captureException(error, {
    //   tags: {
    //     code: appError.code,
    //     category: appError.category,
    //   },
    //   extra: {
    //     ...context,
    //     correlationId: appError.correlationId,
    //   },
    // });
  }, []);

  return { trackError };
}

