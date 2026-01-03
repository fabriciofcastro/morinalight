export type NotificationType = "system" | "security" | "approval" | "activity" | "message" | "other";
export type NotificationChannel = "email" | "push" | "inApp";

export type NotificationRecord = {
  id: string;
  orgId: string;
  userId: string | null;
  type: NotificationType;
  category: string;
  title: string;
  message: string;
  read: boolean;
  archived: boolean;
  actionUrl: string | null;
  actionLabel: string | null;
  metadata: Record<string, unknown> | null;
  channels: NotificationChannel[];
  createdAt: Date;
  readAt: Date | null;
  archivedAt: Date | null;
};

export type CreateNotificationInput = {
  orgId: string;
  userId?: string | null;
  type: NotificationType;
  category: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  metadata?: Record<string, unknown> | null;
  channels?: NotificationChannel[];
};

export type UpdateNotificationInput = {
  read?: boolean;
  archived?: boolean;
  readAt?: Date | null;
  archivedAt?: Date | null;
};

export type ListNotificationsInput = {
  orgId: string;
  userId?: string | null;
  type?: NotificationType;
  read?: boolean;
  archived?: boolean;
  limit?: number;
  offset?: number;
  cursor?: string;
};

export type NotificationListResult = {
  itens: NotificationRecord[];
  total: number;
  proximoCursor?: string | null;
};

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<NotificationRecord>;
  findById(id: string): Promise<NotificationRecord | null>;
  update(id: string, input: UpdateNotificationInput): Promise<NotificationRecord | null>;
  delete(id: string): Promise<boolean>;
  list(input: ListNotificationsInput): Promise<NotificationListResult>;
  markAsRead(id: string, userId: string): Promise<NotificationRecord | null>;
  markAsUnread(id: string): Promise<NotificationRecord | null>;
  archive(id: string): Promise<NotificationRecord | null>;
  unarchive(id: string): Promise<NotificationRecord | null>;
  markAllAsRead(orgId: string, userId: string): Promise<number>;
  getStats(orgId: string, userId?: string | null): Promise<{
    total: number;
    unread: number;
    archived: number;
    byType: Record<NotificationType, number>;
  }>;
}



