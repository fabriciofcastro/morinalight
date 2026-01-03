/**
 * Serviço de Rastreamento de Erros
 * 
 * Envia erros para o backend analytics de forma assíncrona
 * para análise e monitoramento centralizado.
 */

import type { AppError } from "./types";

/**
 * Payload enviado para o backend
 */
interface ErrorTrackingPayload {
    code: string;
    message: string;
    statusCode: number;
    category: string;
    severity: string;
    correlationId?: string;
    traceId?: string;
    requestId?: string;
    context?: Record<string, unknown>;
    userContext?: {
        userId?: string;
        orgId?: string;
        userAgent?: string;
        url?: string;
        timestamp?: string;
    };
    timestamp: string;
}

/**
 * Serviço de rastreamento de erros
 */
class ErrorTrackingService {
    private queue: ErrorTrackingPayload[] = [];
    private isProcessing = false;
    private readonly BATCH_SIZE = 10;
    private readonly FLUSH_INTERVAL = 5000; // 5 segundos
    private flushTimer: NodeJS.Timeout | null = null;

    constructor() {
        // Iniciar timer de flush automático
        if (typeof window !== "undefined") {
            this.startFlushTimer();

            // Flush ao sair da página
            window.addEventListener("beforeunload", () => {
                void this.flush();
            });
        }
    }

    /**
     * Rastrear um erro
     */
    async trackError(
        error: AppError,
        context?: Record<string, unknown>,
    ): Promise<void> {
        // Não rastrear em ambiente de desenvolvimento se desejado
        if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_TRACK_ERRORS_IN_DEV) {
            console.debug("Error tracking (dev mode):", error, context);
            return;
        }

        const payload = this.createPayload(error, context);
        this.queue.push(payload);

        // Flush se atingiu o tamanho do batch
        if (this.queue.length >= this.BATCH_SIZE) {
            await this.flush();
        }
    }

    /**
     * Criar payload de rastreamento
     */
    private createPayload(
        error: AppError,
        context?: Record<string, unknown>,
    ): ErrorTrackingPayload {
        const userContext = this.getUserContext();

        return {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            category: error.category,
            severity: error.severity,
            correlationId: error.correlationId,
            traceId: error.traceId,
            requestId: error.requestId,
            context: {
                ...error.context,
                ...context,
                stack: error.stack,
            },
            userContext,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Obter contexto do usuário
     */
    private getUserContext(): ErrorTrackingPayload["userContext"] {
        if (typeof window === "undefined") {
            return undefined;
        }

        try {
            const orgId = localStorage.getItem("selected_org_id") || undefined;
            const userId = localStorage.getItem("user_id") || undefined;

            return {
                userId,
                orgId,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString(),
            };
        } catch (e) {
            // Ignorar erros ao acessar localStorage
            return undefined;
        }
    }

    /**
     * Enviar erros em lote para o backend
     */
    async flush(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;

        try {
            const batch = this.queue.splice(0, this.BATCH_SIZE);
            await this.sendBatch(batch);
        } catch (error) {
            console.error("Erro ao enviar batch de erros:", error);
            // Não re-adicionar à fila para evitar loop infinito
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Enviar batch para o backend
     */
    private async sendBatch(batch: ErrorTrackingPayload[]): Promise<void> {
        try {
            const response = await fetch("/api/errors/track", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ errors: batch }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            // Log mas não propagar erro para não criar loop
            console.error("Falha ao enviar erros para analytics:", error);
        }
    }

    /**
     * Iniciar timer de flush automático
     */
    private startFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        this.flushTimer = setInterval(() => {
            void this.flush();
        }, this.FLUSH_INTERVAL);
    }

    /**
     * Parar timer de flush
     */
    stopFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }
}

/**
 * Instância singleton do serviço de rastreamento
 */
export const errorTracking = new ErrorTrackingService();
