/**
 * Sistema de Notificação de Erros Críticos
 * 
 * Notifica sobre erros críticos através de múltiplos canais
 * (email, Slack, webhook, etc.)
 */

import type { AppError } from "./app-error";
import { isCriticalError, type ErrorCode } from "./error-codes";
import type { ErrorCorrelationContext } from "./error-correlation";
import { env } from "../config/env";

/**
 * Canal de notificação
 */
export enum NotificationChannel {
  EMAIL = "email",
  SLACK = "slack",
  WEBHOOK = "webhook",
  LOG = "log",
}

/**
 * Configuração de notificação
 */
export interface NotificationConfig {
  channels: NotificationChannel[];
  emailRecipients?: string[];
  slackWebhookUrl?: string;
  webhookUrl?: string;
  minSeverity?: "low" | "medium" | "high" | "critical";
  rateLimit?: {
    maxNotifications: number;
    windowMs: number;
  };
}

/**
 * Severidade do erro
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Determinar severidade do erro
 */
function determineSeverity(error: AppError, code: ErrorCode): ErrorSeverity {
  if (isCriticalError(code)) {
    return ErrorSeverity.CRITICAL;
  }

  if (error.statusCode >= 500) {
    return ErrorSeverity.HIGH;
  }

  if (error.statusCode >= 400 && error.statusCode < 500) {
    return ErrorSeverity.MEDIUM;
  }

  return ErrorSeverity.LOW;
}

/**
 * Verificar se deve notificar baseado na severidade
 */
function shouldNotify(
  severity: ErrorSeverity,
  minSeverity: NotificationConfig["minSeverity"] = "high",
): boolean {
  const severityOrder: ErrorSeverity[] = [
    ErrorSeverity.LOW,
    ErrorSeverity.MEDIUM,
    ErrorSeverity.HIGH,
    ErrorSeverity.CRITICAL,
  ];

  const minSeverityOrder: ErrorSeverity[] = {
    low: ErrorSeverity.LOW,
    medium: ErrorSeverity.MEDIUM,
    high: ErrorSeverity.HIGH,
    critical: ErrorSeverity.CRITICAL,
  };

  const severityIndex = severityOrder.indexOf(severity);
  const minIndex = severityOrder.indexOf(minSeverityOrder[minSeverity]);

  return severityIndex >= minIndex;
}

/**
 * Rate limiter simples em memória
 */
class RateLimiter {
  private notifications: Map<string, number[]> = new Map();

  isAllowed(key: string, max: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.notifications.get(key) || [];

    // Remover timestamps fora da janela
    const validTimestamps = timestamps.filter(
      (ts) => now - ts < windowMs,
    );

    if (validTimestamps.length >= max) {
      return false;
    }

    validTimestamps.push(now);
    this.notifications.set(key, validTimestamps);
    return true;
  }

  reset(): void {
    this.notifications.clear();
  }
}

const rateLimiter = new RateLimiter();

/**
 * Formatar mensagem de notificação
 */
function formatNotificationMessage(
  error: AppError,
  context: ErrorCorrelationContext,
  severity: ErrorSeverity,
): string {
  const lines = [
    `🚨 Erro ${severity.toUpperCase()} Detectado`,
    "",
    `**Código:** ${error.code}`,
    `**Mensagem:** ${error.message}`,
    `**Status:** ${error.statusCode}`,
    `**Operacional:** ${error.isOperational ? "Sim" : "Não"}`,
    "",
    "**Contexto:**",
    `- Correlation ID: ${context.correlationId}`,
    `- Trace ID: ${context.traceId}`,
    `- Request ID: ${context.requestId}`,
    `- Service: ${context.service}`,
    `- Environment: ${context.environment}`,
    `- Timestamp: ${new Date(context.timestamp).toISOString()}`,
  ];

  if (context.userId) {
    lines.push(`- User ID: ${context.userId}`);
  }

  if (context.orgId) {
    lines.push(`- Organization ID: ${context.orgId}`);
  }

  if (error.context) {
    lines.push("");
    lines.push("**Contexto Adicional:**");
    lines.push("```json");
    lines.push(JSON.stringify(error.context, null, 2));
    lines.push("```");
  }

  if (error.stack) {
    lines.push("");
    lines.push("**Stack Trace:**");
    lines.push("```");
    lines.push(error.stack);
    lines.push("```");
  }

  return lines.join("\n");
}

/**
 * Gerenciador de notificações de erro
 */
export class ErrorNotificationManager {
  private static config: NotificationConfig = {
    channels: [NotificationChannel.LOG],
    minSeverity: "high",
    rateLimit: {
      maxNotifications: 10,
      windowMs: 60000, // 1 minuto
    },
  };

  /**
   * Configurar notificações
   */
  static configure(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Notificar sobre um erro
   */
  static async notify(
    error: AppError,
    context: ErrorCorrelationContext,
  ): Promise<void> {
    const code = error.code as ErrorCode;
    const severity = determineSeverity(error, code);

    // Verificar se deve notificar
    if (!shouldNotify(severity, this.config.minSeverity)) {
      return;
    }

    // Verificar rate limit
    const rateLimitKey = `${code}:${context.service}`;
    if (this.config.rateLimit) {
      const { maxNotifications, windowMs } = this.config.rateLimit;
      if (
        !rateLimiter.isAllowed(rateLimitKey, maxNotifications, windowMs)
      ) {
        // Rate limit excedido, não notificar
        return;
      }
    }

    const message = formatNotificationMessage(error, context, severity);

    // Enviar para cada canal configurado
    for (const channel of this.config.channels) {
      try {
        switch (channel) {
          case NotificationChannel.LOG:
            await this.notifyLog(error, context, severity, message);
            break;
          case NotificationChannel.EMAIL:
            await this.notifyEmail(message);
            break;
          case NotificationChannel.SLACK:
            await this.notifySlack(message);
            break;
          case NotificationChannel.WEBHOOK:
            await this.notifyWebhook(error, context, message);
            break;
        }
      } catch (notificationError) {
        // Não falhar se a notificação falhar
        console.error(
          `Failed to send notification via ${channel}:`,
          notificationError,
        );
      }
    }
  }

  /**
   * Notificar via log
   */
  private static async notifyLog(
    error: AppError,
    context: ErrorCorrelationContext,
    severity: ErrorSeverity,
    message: string,
  ): Promise<void> {
    const logLevel =
      severity === ErrorSeverity.CRITICAL
        ? "error"
        : severity === ErrorSeverity.HIGH
          ? "warn"
          : "info";

    console[logLevel]({
      type: "error_notification",
      severity,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      },
      context: {
        correlationId: context.correlationId,
        traceId: context.traceId,
        requestId: context.requestId,
        service: context.service,
        environment: context.environment,
      },
      message,
    });
  }

  /**
   * Notificar via email
   */
  private static async notifyEmail(message: string): Promise<void> {
    if (!this.config.emailRecipients || this.config.emailRecipients.length === 0) {
      return;
    }

    // TODO: Implementar envio de email
    // Por enquanto, apenas log
    console.log("Email notification (not implemented):", {
      recipients: this.config.emailRecipients,
      message,
    });
  }

  /**
   * Notificar via Slack
   */
  private static async notifySlack(message: string): Promise<void> {
    if (!this.config.slackWebhookUrl) {
      return;
    }

    try {
      const response = await fetch(this.config.slackWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message,
          username: "Morina Error Monitor",
          icon_emoji: ":rotating_light:",
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook returned ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to send Slack notification:", error);
      throw error;
    }
  }

  /**
   * Notificar via webhook
   */
  private static async notifyWebhook(
    error: AppError,
    context: ErrorCorrelationContext,
    message: string,
  ): Promise<void> {
    if (!this.config.webhookUrl) {
      return;
    }

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            isOperational: error.isOperational,
            context: error.context,
          },
          correlation: context,
          message,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to send webhook notification:", error);
      throw error;
    }
  }

  /**
   * Resetar rate limiter (útil para testes)
   */
  static resetRateLimiter(): void {
    rateLimiter.reset();
  }
}

// Configurar notificações baseado em variáveis de ambiente
if (env.NODE_ENV === "production") {
  const config: Partial<NotificationConfig> = {
    channels: [NotificationChannel.LOG],
    minSeverity: "high",
  };

  if (process.env.ERROR_NOTIFICATION_EMAIL_RECIPIENTS) {
    config.channels?.push(NotificationChannel.EMAIL);
    config.emailRecipients = process.env.ERROR_NOTIFICATION_EMAIL_RECIPIENTS.split(
      ",",
    );
  }

  if (process.env.ERROR_NOTIFICATION_SLACK_WEBHOOK) {
    config.channels?.push(NotificationChannel.SLACK);
    config.slackWebhookUrl = process.env.ERROR_NOTIFICATION_SLACK_WEBHOOK;
  }

  if (process.env.ERROR_NOTIFICATION_WEBHOOK_URL) {
    config.channels?.push(NotificationChannel.WEBHOOK);
    config.webhookUrl = process.env.ERROR_NOTIFICATION_WEBHOOK_URL;
  }

  ErrorNotificationManager.configure(config);
}



