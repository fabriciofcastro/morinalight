/**
 * Retry Logic System
 * 
 * Sistema inteligente de retry com exponential backoff e jitter
 * para evitar thundering herd problem.
 */

import type { AppError } from "./types";
import { ErrorCode } from "./error-codes";

/**
 * Configuração de retry
 */
export interface RetryConfig {
    /**
     * Número máximo de tentativas (incluindo a primeira)
     */
    maxAttempts: number;
    /**
     * Delay base em ms
     */
    baseDelay: number;
    /**
     * Delay máximo em ms
     */
    maxDelay: number;
    /**
     * Base exponencial (padrão: 2)
     */
    exponentialBase: number;
    /**
     * Adicionar jitter aleatório
     */
    jitter: boolean;
    /**
     * Códigos de erro que permitem retry
     */
    retryableErrors: string[];
    /**
     * Callback antes de cada retry
     */
    onRetry?: (attempt: number, delay: number, error: Error) => void;
}

/**
 * Configuração padrão
 */
const DEFAULT_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    exponentialBase: 2,
    jitter: true,
    retryableErrors: [
        ErrorCode.NETWORK_ERROR,
        ErrorCode.TIMEOUT,
        ErrorCode.SERVICE_UNAVAILABLE,
        "ERR_NETWORK",
        "ECONNABORTED",
        "GATEWAY_TIMEOUT",
        "HTTP_502",
        "HTTP_503",
        "HTTP_504",
    ],
};

/**
 * Gerenciador de retry
 */
export class RetryManager {
    private config: RetryConfig;

    constructor(config: Partial<RetryConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Executar função com retry automático
     */
    async executeWithRetry<T>(
        fn: () => Promise<T>,
        customConfig?: Partial<RetryConfig>,
    ): Promise<T> {
        const config = { ...this.config, ...customConfig };
        let lastError: Error | undefined;

        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;

                // Verificar se deve fazer retry
                if (!this.shouldRetry(error, attempt, config)) {
                    throw error;
                }

                // Calcular delay
                const delay = this.calculateDelay(attempt, config);

                // Callback antes do retry
                config.onRetry?.(attempt, delay, lastError);

                // Log do retry
                console.warn(
                    `[Retry] Attempt ${attempt}/${config.maxAttempts} failed. Retrying in ${delay}ms...`,
                    { error: lastError },
                );

                // Aguardar antes de tentar novamente
                await this.sleep(delay);
            }
        }

        // Todas as tentativas falharam
        throw lastError;
    }

    /**
     * Verificar se deve fazer retry
     */
    private shouldRetry(
        error: unknown,
        attempt: number,
        config: RetryConfig,
    ): boolean {
        // Última tentativa, não retry
        if (attempt >= config.maxAttempts) {
            return false;
        }

        // Verificar se é um erro retryable
        const errorCode = this.getErrorCode(error);
        return config.retryableErrors.includes(errorCode);
    }

    /**
     * Extrair código do erro
     */
    private getErrorCode(error: unknown): string {
        if (typeof error === "object" && error !== null) {
            const err = error as any;
            return err.code || err.name || "UNKNOWN";
        }
        return "UNKNOWN";
    }

    /**
     * Calcular delay com exponential backoff e jitter
     */
    private calculateDelay(attempt: number, config: RetryConfig): number {
        // Exponential backoff: delay = baseDelay * exponentialBase^(attempt - 1)
        const exponentialDelay =
            config.baseDelay * Math.pow(config.exponentialBase, attempt - 1);

        // Limitar ao máximo
        let delay = Math.min(exponentialDelay, config.maxDelay);

        // Adicionar jitter (0-10% do delay)
        if (config.jitter) {
            const jitterAmount = delay * 0.1;
            const randomJitter = Math.random() * jitterAmount;
            delay += randomJitter;
        }

        return Math.floor(delay);
    }

    /**
     * Sleep helper
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Criar retry policy customizado
     */
    static createPolicy(config: Partial<RetryConfig>): RetryManager {
        return new RetryManager(config);
    }
}

/**
 * Políticas de retry pré-configuradas
 */
export const RetryPolicies = {
    /**
     * Política agressiva: retry rápido
     */
    aggressive: new RetryManager({
        maxAttempts: 5,
        baseDelay: 500,
        maxDelay: 10000,
        exponentialBase: 1.5,
    }),

    /**
     * Política conservadora: retry lento
     */
    conservative: new RetryManager({
        maxAttempts: 3,
        baseDelay: 2000,
        maxDelay: 60000,
        exponentialBase: 3,
    }),

    /**
     * Política para operações críticas
     */
    critical: new RetryManager({
        maxAttempts: 10,
        baseDelay: 1000,
        maxDelay: 30000,
        exponentialBase: 2,
        jitter: true,
    }),

    /**
     * Política para operações em background
     */
    background: new RetryManager({
        maxAttempts: 3,
        baseDelay: 5000,
        maxDelay: 120000,
        exponentialBase: 2,
        jitter: true,
    }),
};

/**
 * Decorator para adicionar retry a funções
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    config?: Partial<RetryConfig>,
): T {
    const retryManager = new RetryManager(config);

    return (async (...args: Parameters<T>) => {
        return retryManager.executeWithRetry(() => fn(...args));
    }) as T;
}

/**
 * Hook React para retry
 */
export function useRetry(config?: Partial<RetryConfig>) {
    const retryManager = new RetryManager(config);

    return {
        executeWithRetry: retryManager.executeWithRetry.bind(retryManager),
    };
}
