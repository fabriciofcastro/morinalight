import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";

export type NotificationType = "success" | "error" | "info" | "warning";

export type NotificationPayload = {
  type: NotificationType;
  title: string;
  message: string;
  action?: {
    label: string;
    url?: string;
  };
  metadata?: Record<string, unknown>;
};

export class NotificationPublisherService {
  constructor(private readonly eventBus: DomainEventBus) {}

  /**
   * Publica uma notificação para uma organização específica
   */
  async publishNotification(
    orgId: string,
    actorId: string,
    notification: NotificationPayload,
  ): Promise<void> {
    await this.eventBus.publish({
      name: "Notification.Created",
      version: "v1",
      metadata: {
        eventId: randomUUID(),
        orgId,
        actorId,
        timestamp: new Date().toISOString(),
      },
      payload: notification,
    });
  }

  /**
   * Publica notificação de sucesso
   */
  async publishSuccess(
    orgId: string,
    actorId: string,
    title: string,
    message: string,
    options?: {
      action?: NotificationPayload["action"];
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    await this.publishNotification(orgId, actorId, {
      type: "success",
      title,
      message,
      action: options?.action,
      metadata: options?.metadata,
    });
  }

  /**
   * Publica notificação de erro
   */
  async publishError(
    orgId: string,
    actorId: string,
    title: string,
    message: string,
    options?: {
      action?: NotificationPayload["action"];
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    await this.publishNotification(orgId, actorId, {
      type: "error",
      title,
      message,
      action: options?.action,
      metadata: options?.metadata,
    });
  }

  /**
   * Publica notificação de informação
   */
  async publishInfo(
    orgId: string,
    actorId: string,
    title: string,
    message: string,
    options?: {
      action?: NotificationPayload["action"];
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    await this.publishNotification(orgId, actorId, {
      type: "info",
      title,
      message,
      action: options?.action,
      metadata: options?.metadata,
    });
  }

  /**
   * Publica notificação de aviso
   */
  async publishWarning(
    orgId: string,
    actorId: string,
    title: string,
    message: string,
    options?: {
      action?: NotificationPayload["action"];
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    await this.publishNotification(orgId, actorId, {
      type: "warning",
      title,
      message,
      action: options?.action,
      metadata: options?.metadata,
    });
  }
}

