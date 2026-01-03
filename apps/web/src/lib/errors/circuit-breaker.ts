/**
 * Circuit Breaker Pattern
 * 
 * Implementação do padrão Circuit Breaker para prevenir cascata de erros
 * e permitir recuperação automática de serviços.
 */

import type { AppError } from "./types";

/**
 * Estados do Circuit Breaker
 */
export enum CircuitState {
    /**
     * Funcionamento normal - todas as requisições passam
     */
    CLOSED = "CLOSED",
    /**
     * Muitas falhas - rejeita requisições imediatamente
     */
    OPEN = "OPEN",
    /**
     * Testando recuperação - permite algumas requisições
     */
    HALF_OPEN = "HALF_OPEN",
}

/**
 * Configuração do Circuit Breaker
 */
export interface CircuitConfig {
    /**
     * Número de falhas antes de abrir o circuito
     */
    failureThreshold: number;
    /**
     * Número de sucessos para fechar o circuito (em HALF_OPEN)
     */
    successThreshold: number;
    /**
     * Tempo em ms que o circuito fica OPEN antes de ir para HALF_OPEN
     */
    timeout: number;
    /**
     * Volume mínimo de requisições para avaliar
     */
    volumeThreshold: number;
    /**
     * Janela de tempo em ms para calcular taxa de erro
     */
    windowSize: number;
}

/**
 * Erro lançado quando o circuito está aberto
 */
export class CircuitBreakerOpenError extends Error {
    constructor(public readonly circuitName: string) {
        super(`Circuit breaker "${circuitName}" is OPEN`);
        this.name = "CircuitBreakerOpenError";
    }
}

/**
 * Métricas do circuito
 */
interface CircuitMetrics {
    totalRequests: number;
    successCount: number;
    failureCount: number;
    lastFailureTime?: number;
    lastSuccessTime?: number;
    stateChanges: Array<{
        from: CircuitState;
        to: CircuitState;
        timestamp: number;
    }>;
}

/**
 * Circuit Breaker
 */
export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private metrics: CircuitMetrics = {
        totalRequests: 0,
        successCount: 0,
        failureCount: 0,
        stateChanges: [],
    };
    private consecutiveSuccesses = 0;
    private consecutiveFailures = 0;
    private openedAt?: number;

    constructor(
        private readonly name: string,
        private readonly config: CircuitConfig,
    ) { }

    /**
     * Executar função com circuit breaker
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        // Verificar estado do circuito
        this.checkState();

        // Se está OPEN, rejeitar imediatamente
        if (this.state === CircuitState.OPEN) {
            throw new CircuitBreakerOpenError(this.name);
        }

        this.metrics.totalRequests++;

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    /**
     * Verificar e atualizar estado do circuito
     */
    private checkState(): void {
        if (this.state === CircuitState.OPEN) {
            // Verificar se deve ir para HALF_OPEN
            const now = Date.now();
            if (this.openedAt && now - this.openedAt >= this.config.timeout) {
                this.transitionTo(CircuitState.HALF_OPEN);
                this.consecutiveSuccesses = 0;
                this.consecutiveFailures = 0;
            }
        }
    }

    /**
     * Callback de sucesso
     */
    private onSuccess(): void {
        this.metrics.successCount++;
        this.metrics.lastSuccessTime = Date.now();
        this.consecutiveSuccesses++;
        this.consecutiveFailures = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            // Verificar se deve fechar o circuito
            if (this.consecutiveSuccesses >= this.config.successThreshold) {
                this.transitionTo(CircuitState.CLOSED);
                this.resetMetrics();
            }
        }
    }

    /**
     * Callback de falha
     */
    private onFailure(): void {
        this.metrics.failureCount++;
        this.metrics.lastFailureTime = Date.now();
        this.consecutiveFailures++;
        this.consecutiveSuccesses = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            // Uma falha em HALF_OPEN volta para OPEN
            this.transitionTo(CircuitState.OPEN);
            this.openedAt = Date.now();
        } else if (this.state === CircuitState.CLOSED) {
            // Verificar se deve abrir o circuito
            if (this.shouldOpen()) {
                this.transitionTo(CircuitState.OPEN);
                this.openedAt = Date.now();
            }
        }
    }

    /**
     * Verificar se deve abrir o circuito
     */
    private shouldOpen(): boolean {
        // Verificar volume mínimo
        if (this.metrics.totalRequests < this.config.volumeThreshold) {
            return false;
        }

        // Verificar threshold de falhas consecutivas
        return this.consecutiveFailures >= this.config.failureThreshold;
    }

    /**
     * Transição de estado
     */
    private transitionTo(newState: CircuitState): void {
        const oldState = this.state;
        this.state = newState;

        this.metrics.stateChanges.push({
            from: oldState,
            to: newState,
            timestamp: Date.now(),
        });

        console.log(
            `[Circuit Breaker "${this.name}"] State transition: ${oldState} → ${newState}`,
        );
    }

    /**
     * Resetar métricas
     */
    private resetMetrics(): void {
        this.consecutiveSuccesses = 0;
        this.consecutiveFailures = 0;
    }

    /**
     * Obter estado atual
     */
    getState(): CircuitState {
        this.checkState();
        return this.state;
    }

    /**
     * Obter métricas
     */
    getMetrics(): Readonly<CircuitMetrics> {
        return { ...this.metrics };
    }

    /**
     * Forçar abertura do circuito (para testes)
     */
    forceOpen(): void {
        this.transitionTo(CircuitState.OPEN);
        this.openedAt = Date.now();
    }

    /**
     * Forçar fechamento do circuito (para testes)
     */
    forceClose(): void {
        this.transitionTo(CircuitState.CLOSED);
        this.resetMetrics();
    }

    /**
     * Resetar circuito
     */
    reset(): void {
        this.state = CircuitState.CLOSED;
        this.metrics = {
            totalRequests: 0,
            successCount: 0,
            failureCount: 0,
            stateChanges: [],
        };
        this.resetMetrics();
        this.openedAt = undefined;
    }
}

/**
 * Gerenciador de múltiplos circuit breakers
 */
export class CircuitBreakerManager {
    private breakers = new Map<string, CircuitBreaker>();

    /**
     * Obter ou criar circuit breaker
     */
    getOrCreate(name: string, config: CircuitConfig): CircuitBreaker {
        if (!this.breakers.has(name)) {
            this.breakers.set(name, new CircuitBreaker(name, config));
        }
        return this.breakers.get(name)!;
    }

    /**
     * Obter circuit breaker
     */
    get(name: string): CircuitBreaker | undefined {
        return this.breakers.get(name);
    }

    /**
     * Listar todos os circuit breakers
     */
    list(): Array<{ name: string; state: CircuitState; metrics: CircuitMetrics }> {
        return Array.from(this.breakers.entries()).map(([name, breaker]) => ({
            name,
            state: breaker.getState(),
            metrics: breaker.getMetrics(),
        }));
    }

    /**
     * Resetar todos os circuit breakers
     */
    resetAll(): void {
        this.breakers.forEach((breaker) => breaker.reset());
    }
}

/**
 * Instância global do gerenciador
 */
export const circuitBreakerManager = new CircuitBreakerManager();

/**
 * Configurações padrão por tipo de operação
 */
export const CircuitConfigs = {
    /**
     * Para APIs críticas
     */
    critical: {
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 10000,
        volumeThreshold: 5,
        windowSize: 60000,
    },

    /**
     * Para APIs normais
     */
    standard: {
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 30000,
        volumeThreshold: 10,
        windowSize: 60000,
    },

    /**
     * Para operações tolerantes a falhas
     */
    tolerant: {
        failureThreshold: 10,
        successThreshold: 5,
        timeout: 60000,
        volumeThreshold: 20,
        windowSize: 120000,
    },
};
