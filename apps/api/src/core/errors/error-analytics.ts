/**
 * Sistema de Analytics e Agrupamento de Erros
 * 
 * Análise avançada, agrupamento e deduplicação de erros.
 */

import type { AppError } from "./app-error";
import type { ErrorCorrelationContext } from "./error-correlation";
import { getErrorCategory, type ErrorCode } from "./error-codes";

/**
 * Agrupamento de erros similares
 */
export interface ErrorGroup {
  id: string;
  code: ErrorCode | string;
  message: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  severity: "low" | "medium" | "high" | "critical";
  affectedUsers: Set<string>;
  affectedOrgs: Set<string>;
  sampleErrors: AppError[];
  stackTraceHash?: string;
  contextPattern?: Record<string, unknown>;
}

/**
 * Estatísticas de erro
 */
export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsByCode: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByHour: Array<{ hour: number; count: number }>;
  topErrors: ErrorGroup[];
  errorRate: number;
  recoveryRate: number;
  avgResolutionTime: number;
}

/**
 * Fingerprint de erro para agrupamento
 */
function getErrorFingerprint(error: AppError): string {
  const parts = [
    error.code,
    error.message,
    error.statusCode,
    // Hash do stack trace (primeiras 3 linhas)
    error.stack?.split("\n").slice(0, 3).join("|"),
  ].filter(Boolean);

  return parts.join("::");
}

/**
 * Gerenciador de analytics de erros
 */
export class ErrorAnalyticsManager {
  private static groups = new Map<string, ErrorGroup>();
  private static errorHistory: Array<{
    error: AppError;
    context: ErrorCorrelationContext;
    timestamp: number;
  }> = [];
  private static readonly MAX_HISTORY = 10000;
  private static readonly MAX_GROUPS = 1000;

  /**
   * Registrar erro para analytics
   */
  static recordError(
    error: AppError,
    context: ErrorCorrelationContext,
  ): void {
    const fingerprint = getErrorFingerprint(error);
    const now = Date.now();

    // Adicionar ao histórico
    this.errorHistory.push({ error, context, timestamp: now });
    if (this.errorHistory.length > this.MAX_HISTORY) {
      this.errorHistory.shift();
    }

    // Agrupar erros similares
    let group = this.groups.get(fingerprint);
    if (!group) {
      group = {
        id: fingerprint,
        code: error.code as ErrorCode,
        message: error.message,
        count: 0,
        firstSeen: now,
        lastSeen: now,
        severity: error.statusCode >= 500 ? "critical" : error.statusCode >= 400 ? "high" : "medium",
        affectedUsers: new Set(),
        affectedOrgs: new Set(),
        sampleErrors: [],
      };

      // Limitar número de grupos
      if (this.groups.size >= this.MAX_GROUPS) {
        const oldestGroup = Array.from(this.groups.values()).sort(
          (a, b) => a.lastSeen - b.lastSeen,
        )[0];
        this.groups.delete(oldestGroup.id);
      }

      this.groups.set(fingerprint, group);
    }

    // Atualizar grupo
    group.count++;
    group.lastSeen = now;
    if (context.userId) {
      group.affectedUsers.add(context.userId);
    }
    if (context.orgId) {
      group.affectedOrgs.add(context.orgId);
    }
    if (group.sampleErrors.length < 5) {
      group.sampleErrors.push(error);
    }
  }

  /**
   * Obter estatísticas
   */
  static getStats(timeWindow: number = 3600000): ErrorStats {
    const now = Date.now();
    const windowStart = now - timeWindow;

    const recentErrors = this.errorHistory.filter(
      (e) => e.timestamp >= windowStart,
    );

    const errorsByCategory: Record<string, number> = {};
    const errorsByCode: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const errorsByHour: Array<{ hour: number; count: number }> = Array.from(
      { length: 24 },
      (_, i) => ({ hour: i, count: 0 }),
    );

    recentErrors.forEach(({ error, timestamp }) => {
      const category = getErrorCategory(error.code as ErrorCode);
      errorsByCategory[category] = (errorsByCategory[category] || 0) + 1;
      errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1;

      const severity =
        error.statusCode >= 500
          ? "critical"
          : error.statusCode >= 400
            ? "high"
            : "medium";
      errorsBySeverity[severity] = (errorsBySeverity[severity] || 0) + 1;

      const hour = new Date(timestamp).getHours();
      errorsByHour[hour].count++;
    });

    const topErrors = Array.from(this.groups.values())
      .filter((g) => g.lastSeen >= windowStart)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalErrors = recentErrors.length;
    const errorRate = totalErrors / (timeWindow / 3600000); // Erros por hora

    return {
      totalErrors,
      errorsByCategory,
      errorsByCode,
      errorsBySeverity,
      errorsByHour,
      topErrors,
      errorRate,
      recoveryRate: 0, // TODO: Calcular taxa de recuperação
      avgResolutionTime: 0, // TODO: Calcular tempo médio de resolução
    };
  }

  /**
   * Obter grupo de erro
   */
  static getErrorGroup(fingerprint: string): ErrorGroup | undefined {
    return this.groups.get(fingerprint);
  }

  /**
   * Obter grupos similares
   */
  static getSimilarGroups(error: AppError, limit: number = 5): ErrorGroup[] {
    const fingerprint = getErrorFingerprint(error);
    const group = this.groups.get(fingerprint);

    if (!group) return [];

    // Buscar grupos com mesmo código ou categoria
    const category = getErrorCategory(error.code as ErrorCode);
    return Array.from(this.groups.values())
      .filter(
        (g) =>
          g.id !== fingerprint &&
          (g.code === error.code ||
            getErrorCategory(g.code as ErrorCode) === category),
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Limpar histórico antigo
   */
  static cleanup(maxAge: number = 86400000): void {
    const now = Date.now();
    const cutoff = now - maxAge;

    // Limpar histórico
    this.errorHistory = this.errorHistory.filter((e) => e.timestamp >= cutoff);

    // Limpar grupos antigos
    for (const [id, group] of this.groups.entries()) {
      if (group.lastSeen < cutoff) {
        this.groups.delete(id);
      }
    }
  }

  /**
   * Resetar analytics
   */
  static reset(): void {
    this.groups.clear();
    this.errorHistory = [];
  }
}


