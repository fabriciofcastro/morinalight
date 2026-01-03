/**
 * Error Aggregation System
 * 
 * Deduplica e agrupa erros similares para reduzir ruído
 * e facilitar análise de padrões.
 */

import type { AppError } from "./types";
import { createHash } from "crypto";

/**
 * Grupo de erros
 */
export interface ErrorGroup {
    fingerprint: string;
    code: string;
    message: string;
    count: number;
    firstSeen: number;
    lastSeen: number;
    errors: AppError[];
    stackTrace?: string;
    affectedEndpoints: Set<string>;
    affectedUsers: Set<string>;
}

/**
 * Configuração de aggregation
 */
export interface AggregationConfig {
    /**
     * Máximo de erros por grupo
     */
    maxErrorsPerGroup: number;
    /**
     * Intervalo mínimo entre notificações (ms)
     */
    notificationInterval: number;
    /**
     * Notificar a cada N ocorrências
     */
    notificationThreshold: number;
}

/**
 * Agregador de erros
 */
export class ErrorAggregator {
    private errorGroups = new Map<string, ErrorGroup>();
    private lastNotification = new Map<string, number>();
    private config: AggregationConfig = {
        maxErrorsPerGroup: 10,
        notificationInterval: 60000, // 1 minuto
        notificationThreshold: 10,
    };

    constructor(config?: Partial<AggregationConfig>) {
        if (config) {
            this.config = { ...this.config, ...config };
        }
    }

    /**
     * Gerar fingerprint único para o erro
     */
    generateFingerprint(error: AppError, context?: Record<string, unknown>): string {
        // Componentes do fingerprint
        const components = {
            code: error.code,
            message: this.normalizeMessage(error.message),
            stack: this.extractStackSignature(error.stack),
            endpoint: context?.endpoint as string | undefined,
        };

        // Criar hash
        const str = JSON.stringify(components);

        // Usar hash simples para browser
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        return `err_${Math.abs(hash).toString(36)}`;
    }

    /**
     * Normalizar mensagem removendo valores dinâmicos
     */
    private normalizeMessage(message: string): string {
        return message
            .replace(/\d+/g, "N") // Números
            .replace(/[a-f0-9-]{36}/gi, "UUID") // UUIDs
            .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "EMAIL") // Emails
            .toLowerCase();
    }

    /**
     * Extrair assinatura do stack trace
     */
    private extractStackSignature(stack?: string): string {
        if (!stack) return "";

        // Pegar primeiras 3 linhas do stack
        const lines = stack.split("\n").slice(0, 3);

        // Remover números de linha e caminhos absolutos
        return lines
            .map((line) =>
                line
                    .replace(/:\d+:\d+/g, "") // Remove line:col
                    .replace(/\(.*?\)/g, "") // Remove paths in parentheses
                    .trim(),
            )
            .join("|");
    }

    /**
     * Agregar erro
     */
    aggregate(error: AppError, context?: Record<string, unknown>): void {
        const fingerprint = this.generateFingerprint(error, context);

        if (!this.errorGroups.has(fingerprint)) {
            // Novo grupo
            this.errorGroups.set(fingerprint, {
                fingerprint,
                code: error.code,
                message: error.message,
                count: 1,
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                errors: [error],
                stackTrace: error.stack,
                affectedEndpoints: new Set(context?.endpoint ? [context.endpoint as string] : []),
                affectedUsers: new Set(
                    context?.userId ? [context.userId as string] : [],
                ),
            });
        } else {
            // Grupo existente
            const group = this.errorGroups.get(fingerprint)!;
            group.count++;
            group.lastSeen = Date.now();

            // Adicionar erro (limitado)
            if (group.errors.length < this.config.maxErrorsPerGroup) {
                group.errors.push(error);
            }

            // Rastrear endpoints e usuários afetados
            if (context?.endpoint) {
                group.affectedEndpoints.add(context.endpoint as string);
            }
            if (context?.userId) {
                group.affectedUsers.add(context.userId as string);
            }
        }
    }

    /**
     * Verificar se deve notificar
     */
    shouldNotify(fingerprint: string): boolean {
        const group = this.errorGroups.get(fingerprint);
        if (!group) return false;

        const lastNotif = this.lastNotification.get(fingerprint) || 0;
        const now = Date.now();

        // Primeira ocorrência: sempre notificar
        if (group.count === 1) {
            this.lastNotification.set(fingerprint, now);
            return true;
        }

        // Notificar a cada N ocorrências
        if (group.count % this.config.notificationThreshold === 0) {
            // Mas respeitar intervalo mínimo
            if (now - lastNotif >= this.config.notificationInterval) {
                this.lastNotification.set(fingerprint, now);
                return true;
            }
        }

        return false;
    }

    /**
     * Obter grupo de erro
     */
    getGroup(fingerprint: string): ErrorGroup | undefined {
        return this.errorGroups.get(fingerprint);
    }

    /**
     * Listar todos os grupos
     */
    getAllGroups(): ErrorGroup[] {
        return Array.from(this.errorGroups.values()).sort(
            (a, b) => b.count - a.count,
        );
    }

    /**
     * Obter grupos mais frequentes
     */
    getTopGroups(limit = 10): ErrorGroup[] {
        return this.getAllGroups().slice(0, limit);
    }

    /**
     * Obter grupos recentes
     */
    getRecentGroups(limit = 10): ErrorGroup[] {
        return Array.from(this.errorGroups.values())
            .sort((a, b) => b.lastSeen - a.lastSeen)
            .slice(0, limit);
    }

    /**
     * Limpar grupos antigos
     */
    clearOldGroups(olderThan: number = 86400000): void {
        // Padrão: 24 horas
        const cutoff = Date.now() - olderThan;

        for (const [fingerprint, group] of this.errorGroups.entries()) {
            if (group.lastSeen < cutoff) {
                this.errorGroups.delete(fingerprint);
                this.lastNotification.delete(fingerprint);
            }
        }
    }

    /**
     * Obter estatísticas
     */
    getStats(): {
        totalGroups: number;
        totalErrors: number;
        avgErrorsPerGroup: number;
        topErrorCode: string;
    } {
        const groups = this.getAllGroups();
        const totalErrors = groups.reduce((sum, g) => sum + g.count, 0);

        // Contar por código
        const codeCount = new Map<string, number>();
        groups.forEach((g) => {
            codeCount.set(g.code, (codeCount.get(g.code) || 0) + g.count);
        });

        const topErrorCode =
            Array.from(codeCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
            "NONE";

        return {
            totalGroups: groups.length,
            totalErrors,
            avgErrorsPerGroup: groups.length > 0 ? totalErrors / groups.length : 0,
            topErrorCode,
        };
    }

    /**
     * Resetar agregador
     */
    reset(): void {
        this.errorGroups.clear();
        this.lastNotification.clear();
    }
}

/**
 * Instância global do agregador
 */
export const errorAggregator = new ErrorAggregator();
