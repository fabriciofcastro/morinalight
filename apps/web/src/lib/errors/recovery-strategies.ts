/**
 * Error Recovery Strategies
 * 
 * Estratégias automáticas de recuperação de erros
 */

import type { AppError } from "./types";
import { ErrorCategory } from "./types";

/**
 * Interface de estratégia de recuperação
 */
export interface RecoveryStrategy {
    name: string;
    canRecover: (error: AppError, context?: any) => boolean;
    recover: (error: AppError, context?: any) => Promise<any>;
    priority: number; // Maior = mais prioritário
}

/**
 * Cache para fallback
 */
class CacheManager {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly TTL = 3600000; // 1 hora

    set(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    get(key: string): any | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        // Verificar TTL
        if (Date.now() - cached.timestamp > this.TTL) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    clear(): void {
        this.cache.clear();
    }
}

const cacheManager = new CacheManager();

/**
 * Estratégia 1: Cache Fallback
 */
export class CacheFallbackStrategy implements RecoveryStrategy {
    name = "CacheFallback";
    priority = 10;

    canRecover(error: AppError, context?: any): boolean {
        // Pode recuperar se for erro de rede e tiver cache
        return (
            error.category === ErrorCategory.NETWORK &&
            context?.cacheKey &&
            cacheManager.has(context.cacheKey)
        );
    }

    async recover(error: AppError, context?: any): Promise<any> {
        const cached = cacheManager.get(context.cacheKey);
        console.log(`[Recovery] Using cached data for ${context.cacheKey}`);
        return { data: cached, fromCache: true, recoveredFrom: error.code };
    }
}

/**
 * Estratégia 2: Degradação Graceful
 */
export class GracefulDegradationStrategy implements RecoveryStrategy {
    name = "GracefulDegradation";
    priority = 5;
    private disabledFeatures = new Set<string>();

    canRecover(error: AppError, context?: any): boolean {
        // Pode degradar features não-críticas
        return context?.feature && context?.critical === false;
    }

    async recover(error: AppError, context?: any): Promise<any> {
        const feature = context.feature;
        this.disabledFeatures.add(feature);
        console.log(`[Recovery] Disabling non-critical feature: ${feature}`);

        return {
            degraded: true,
            disabledFeature: feature,
            message: `Feature "${feature}" temporariamente desabilitada`,
        };
    }

    isFeatureDisabled(feature: string): boolean {
        return this.disabledFeatures.has(feature);
    }

    enableFeature(feature: string): void {
        this.disabledFeatures.delete(feature);
    }
}

/**
 * Estratégia 3: Offline Queue
 */
interface QueuedOperation {
    id: string;
    operation: () => Promise<any>;
    context: any;
    timestamp: number;
    retries: number;
}

export class OfflineQueueStrategy implements RecoveryStrategy {
    name = "OfflineQueue";
    priority = 8;
    private queue: QueuedOperation[] = [];
    private isProcessing = false;

    canRecover(error: AppError, context?: any): boolean {
        // Pode enfileirar operações de escrita em caso de erro de rede
        return (
            error.category === ErrorCategory.NETWORK &&
            context?.method &&
            ["POST", "PUT", "PATCH", "DELETE"].includes(context.method)
        );
    }

    async recover(error: AppError, context?: any): Promise<any> {
        const operation: QueuedOperation = {
            id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            operation: context.operation,
            context,
            timestamp: Date.now(),
            retries: 0,
        };

        this.queue.push(operation);
        console.log(`[Recovery] Queued operation ${operation.id} for later`);

        // Tentar processar fila quando conexão voltar
        this.scheduleProcessing();

        return {
            queued: true,
            operationId: operation.id,
            message: "Operação salva. Será executada quando a conexão voltar.",
        };
    }

    private scheduleProcessing(): void {
        if (this.isProcessing) return;

        // Verificar conexão a cada 10 segundos
        setTimeout(() => {
            if (navigator.onLine) {
                void this.processQueue();
            } else {
                this.scheduleProcessing();
            }
        }, 10000);
    }

    async processQueue(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        console.log(`[Recovery] Processing ${this.queue.length} queued operations`);

        const operations = [...this.queue];
        this.queue = [];

        for (const op of operations) {
            try {
                await op.operation();
                console.log(`[Recovery] Successfully executed queued operation ${op.id}`);
            } catch (error) {
                op.retries++;
                if (op.retries < 3) {
                    this.queue.push(op); // Re-enfileirar
                } else {
                    console.error(`[Recovery] Failed to execute operation ${op.id} after 3 retries`);
                }
            }
        }

        this.isProcessing = false;
    }

    getQueueSize(): number {
        return this.queue.length;
    }

    clearQueue(): void {
        this.queue = [];
    }
}

/**
 * Estratégia 4: Retry com Backoff Customizado
 */
export class CustomRetryStrategy implements RecoveryStrategy {
    name = "CustomRetry";
    priority = 7;

    canRecover(error: AppError, context?: any): boolean {
        // Pode fazer retry em erros temporários
        return error.isRetryable && context?.retryCount < 5;
    }

    async recover(error: AppError, context?: any): Promise<any> {
        const retryCount = (context?.retryCount || 0) + 1;
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

        console.log(`[Recovery] Retrying operation (attempt ${retryCount}) in ${delay}ms`);

        await new Promise((resolve) => setTimeout(resolve, delay));

        return {
            retry: true,
            retryCount,
            delay,
        };
    }
}

/**
 * Estratégia 5: Fallback para Dados Mockados
 */
export class MockDataFallbackStrategy implements RecoveryStrategy {
    name = "MockDataFallback";
    priority = 3;

    canRecover(error: AppError, context?: any): boolean {
        // Usar dados mockados em desenvolvimento ou para demos
        return (
            process.env.NODE_ENV === "development" &&
            context?.mockData !== undefined
        );
    }

    async recover(error: AppError, context?: any): Promise<any> {
        console.log(`[Recovery] Using mock data for ${context.endpoint}`);
        return {
            data: context.mockData,
            fromMock: true,
            message: "Usando dados de demonstração",
        };
    }
}

/**
 * Gerenciador de Recovery Strategies
 */
export class RecoveryManager {
    private strategies: RecoveryStrategy[] = [];

    constructor() {
        // Registrar estratégias padrão
        this.registerStrategy(new CacheFallbackStrategy());
        this.registerStrategy(new GracefulDegradationStrategy());
        this.registerStrategy(new OfflineQueueStrategy());
        this.registerStrategy(new CustomRetryStrategy());
        this.registerStrategy(new MockDataFallbackStrategy());
    }

    registerStrategy(strategy: RecoveryStrategy): void {
        this.strategies.push(strategy);
        // Ordenar por prioridade
        this.strategies.sort((a, b) => b.priority - a.priority);
    }

    async attemptRecovery(error: AppError, context?: any): Promise<any> {
        for (const strategy of this.strategies) {
            if (strategy.canRecover(error, context)) {
                try {
                    console.log(`[Recovery] Attempting recovery with ${strategy.name}`);
                    const result = await strategy.recover(error, context);
                    return { recovered: true, strategy: strategy.name, result };
                } catch (recoveryError) {
                    console.error(`[Recovery] Strategy ${strategy.name} failed:`, recoveryError);
                }
            }
        }

        return { recovered: false };
    }

    getStrategies(): RecoveryStrategy[] {
        return [...this.strategies];
    }
}

/**
 * Instância global do gerenciador
 */
export const recoveryManager = new RecoveryManager();

/**
 * Helper para salvar dados no cache
 */
export function cacheResponse(key: string, data: any): void {
    cacheManager.set(key, data);
}

/**
 * Hook React para recovery
 */
export function useRecovery() {
    const [isRecovering, setIsRecovering] = React.useState(false);
    const [recoveryResult, setRecoveryResult] = React.useState<any>(null);

    const attemptRecovery = React.useCallback(
        async (error: AppError, context?: any) => {
            setIsRecovering(true);
            try {
                const result = await recoveryManager.attemptRecovery(error, context);
                setRecoveryResult(result);
                return result;
            } finally {
                setIsRecovering(false);
            }
        },
        [],
    );

    return { attemptRecovery, isRecovering, recoveryResult };
}

import React from "react";
