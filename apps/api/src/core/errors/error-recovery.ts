/**
 * Sistema de Recuperação Automática de Erros
 * 
 * Estratégias inteligentes de recuperação e auto-healing.
 */

import type { AppError } from "./app-error";
import { ErrorCode, isRecoverableError, type ErrorCode as ErrorCodeType } from "./error-codes";
import { retry } from "../resilience/retry";

/**
 * Estratégia de recuperação
 */
export enum RecoveryStrategy {
  RETRY = "retry",
  FALLBACK = "fallback",
  CIRCUIT_BREAKER = "circuit_breaker",
  CACHE = "cache",
  QUEUE = "queue",
  SKIP = "skip",
  NOTIFY = "notify",
}

/**
 * Resultado da recuperação
 */
export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  strategy: RecoveryStrategy;
  attempts: number;
  duration: number;
}

/**
 * Configuração de recuperação
 */
export interface RecoveryConfig {
  maxRetries?: number;
  retryDelay?: number;
  fallbackValue?: unknown;
  useCache?: boolean;
  cacheKey?: string;
  queueOperation?: boolean;
  skipOnError?: boolean;
  notifyOnFailure?: boolean;
}

/**
 * Gerenciador de recuperação de erros
 */
export class ErrorRecoveryManager {
  private static cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  /**
   * Tentar recuperar de um erro
   */
  static async recover<T>(
    error: AppError,
    operation: () => Promise<T>,
    config: RecoveryConfig = {},
  ): Promise<RecoveryResult<T>> {
    const startTime = Date.now();
    const code = error.code as ErrorCodeType;

    // Verificar se erro é recuperável
    if (!isRecoverableError(code)) {
      return {
        success: false,
        error,
        strategy: RecoveryStrategy.NOTIFY,
        attempts: 0,
        duration: Date.now() - startTime,
      };
    }

    // Estratégia 1: Retry com exponential backoff
    if (config.maxRetries && config.maxRetries > 0) {
      try {
        const result = await retry(operation, {
          maxAttempts: config.maxRetries + 1,
          initialDelay: config.retryDelay || 1000,
          shouldRetry: (err) => {
            if (err instanceof AppError) {
              return isRecoverableError(err.code as ErrorCodeType);
            }
            return true;
          },
        });

        return {
          success: true,
          data: result,
          strategy: RecoveryStrategy.RETRY,
          attempts: config.maxRetries + 1,
          duration: Date.now() - startTime,
        };
      } catch (retryError) {
        // Se retry falhar, tentar outras estratégias
      }
    }

    // Estratégia 2: Cache (se disponível)
    if (config.useCache && config.cacheKey) {
      const cached = this.getFromCache<T>(config.cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          strategy: RecoveryStrategy.CACHE,
          attempts: 0,
          duration: Date.now() - startTime,
        };
      }
    }

    // Estratégia 3: Fallback value
    if (config.fallbackValue !== undefined) {
      return {
        success: true,
        data: config.fallbackValue as T,
        strategy: RecoveryStrategy.FALLBACK,
        attempts: 0,
        duration: Date.now() - startTime,
      };
    }

    // Estratégia 4: Queue para processamento posterior
    if (config.queueOperation) {
      // TODO: Implementar sistema de fila
      return {
        success: false,
        error,
        strategy: RecoveryStrategy.QUEUE,
        attempts: 0,
        duration: Date.now() - startTime,
      };
    }

    // Estratégia 5: Skip (continuar sem dados)
    if (config.skipOnError) {
      return {
        success: true,
        strategy: RecoveryStrategy.SKIP,
        attempts: 0,
        duration: Date.now() - startTime,
      };
    }

    // Estratégia 6: Notificar e falhar
    return {
      success: false,
      error,
      strategy: RecoveryStrategy.NOTIFY,
      attempts: 0,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Obter do cache
   */
  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Salvar no cache
   */
  static setCache(key: string, data: unknown, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Limpar cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Decorator para recuperação automática
 */
export function withRecovery<T extends Array<unknown>, R>(
  fn: (...args: T) => Promise<R>,
  config: RecoveryConfig = {},
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        const recovery = await ErrorRecoveryManager.recover(
          error,
          () => fn(...args),
          config,
        );

        if (recovery.success && recovery.data !== undefined) {
          return recovery.data as R;
        }

        throw recovery.error || error;
      }
      throw error;
    }
  };
}





