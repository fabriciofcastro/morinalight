/**
 * Sistema de Prevenção de Erros
 * 
 * Detecção preditiva e prevenção proativa de erros.
 */

import type { AppError } from "./app-error";
import { ErrorCodes, getErrorCategory, type ErrorCode } from "./error-codes";
import { ErrorAnalyticsManager } from "./error-analytics";

/**
 * Padrão de erro para detecção
 */
export interface ErrorPattern {
  code: ErrorCode | string;
  conditions: Array<{
    field: string;
    operator: "equals" | "contains" | "matches" | "greater" | "less";
    value: unknown;
  }>;
  threshold: number; // Número de ocorrências antes de alertar
  timeWindow: number; // Janela de tempo em ms
  action: "alert" | "throttle" | "block" | "degrade";
}

/**
 * Regra de prevenção
 */
export interface PreventionRule {
  id: string;
  name: string;
  pattern: ErrorPattern;
  enabled: boolean;
  lastTriggered?: number;
  triggerCount: number;
}

/**
 * Gerenciador de prevenção de erros
 */
export class ErrorPreventionManager {
  private static rules: Map<string, PreventionRule> = new Map();
  private static errorCounts = new Map<string, Array<{ timestamp: number }>>();

  /**
   * Registrar regra de prevenção
   */
  static registerRule(rule: PreventionRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Verificar se erro deve ser prevenido
   */
  static shouldPrevent(
    error: AppError,
    context: Record<string, unknown>,
  ): {
    prevent: boolean;
    action?: ErrorPattern["action"];
    reason?: string;
  } {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      // Verificar se erro corresponde ao padrão
      if (!this.matchesPattern(error, context, rule.pattern)) {
        continue;
      }

      // Verificar threshold
      const count = this.getErrorCount(rule.pattern, rule.pattern.timeWindow);
      if (count >= rule.pattern.threshold) {
        rule.lastTriggered = Date.now();
        rule.triggerCount++;

        return {
          prevent: true,
          action: rule.pattern.action,
          reason: `Rule "${rule.name}" triggered: ${count} errors in ${rule.pattern.timeWindow}ms`,
        };
      }
    }

    return { prevent: false };
  }

  /**
   * Verificar se erro corresponde ao padrão
   */
  private static matchesPattern(
    error: AppError,
    context: Record<string, unknown>,
    pattern: ErrorPattern,
  ): boolean {
    // Verificar código
    if (pattern.code !== error.code) {
      return false;
    }

    // Verificar condições
    for (const condition of pattern.conditions) {
      const value = context[condition.field];
      if (!this.matchesCondition(value, condition)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verificar condição
   */
  private static matchesCondition(
    value: unknown,
    condition: ErrorPattern["conditions"][0],
  ): boolean {
    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "contains":
        return String(value).includes(String(condition.value));
      case "matches":
        return new RegExp(String(condition.value)).test(String(value));
      case "greater":
        return Number(value) > Number(condition.value);
      case "less":
        return Number(value) < Number(condition.value);
      default:
        return false;
    }
  }

  /**
   * Obter contagem de erros
   */
  private static getErrorCount(
    pattern: ErrorPattern,
    timeWindow: number,
  ): number {
    const key = `${pattern.code}:${JSON.stringify(pattern.conditions)}`;
    const errors = this.errorCounts.get(key) || [];
    const now = Date.now();
    const cutoff = now - timeWindow;

    // Filtrar erros dentro da janela
    const recentErrors = errors.filter((e) => e.timestamp >= cutoff);
    this.errorCounts.set(key, recentErrors);

    return recentErrors.length;
  }

  /**
   * Registrar ocorrência de erro
   */
  static recordErrorOccurrence(
    error: AppError,
    context: Record<string, unknown>,
  ): void {
    const category = getErrorCategory(error.code as ErrorCode);
    const key = `${error.code}:${category}`;

    const errors = this.errorCounts.get(key) || [];
    errors.push({ timestamp: Date.now() });

    // Manter apenas últimas 1000 ocorrências
    if (errors.length > 1000) {
      errors.shift();
    }

    this.errorCounts.set(key, errors);
  }

  /**
   * Obter regras ativas
   */
  static getActiveRules(): PreventionRule[] {
    return Array.from(this.rules.values()).filter((r) => r.enabled);
  }

  /**
   * Limpar contadores antigos
   */
  static cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [key, errors] of this.errorCounts.entries()) {
      const filtered = errors.filter((e) => now - e.timestamp < maxAge);
      if (filtered.length === 0) {
        this.errorCounts.delete(key);
      } else {
        this.errorCounts.set(key, filtered);
      }
    }
  }
}

// Regras padrão de prevenção
ErrorPreventionManager.registerRule({
  id: "rate-limit-protection",
  name: "Proteção contra Rate Limit",
  enabled: true,
  triggerCount: 0,
  pattern: {
    code: ErrorCodes.RATE_LIMIT_EXCEEDED,
    conditions: [],
    threshold: 5,
    timeWindow: 60000, // 1 minuto
    action: "throttle",
  },
});

ErrorPreventionManager.registerRule({
  id: "database-connection-protection",
  name: "Proteção contra Erros de Conexão",
  enabled: true,
  triggerCount: 0,
  pattern: {
    code: ErrorCodes.DATABASE_CONNECTION_ERROR,
    conditions: [],
    threshold: 3,
    timeWindow: 30000, // 30 segundos
    action: "degrade",
  },
});









