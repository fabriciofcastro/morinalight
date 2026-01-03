import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  CreateNotificationInput,
  ListNotificationsInput,
  NotificationListResult,
  NotificationRecord,
  NotificationRepository,
  UpdateNotificationInput,
} from "../../domain/repositories/notification-repository";

const prisma = getPrisma();

function mapNotification(notification: any): NotificationRecord {
  return {
    id: notification.id,
    orgId: notification.orgId,
    userId: notification.userId,
    type: notification.type as NotificationRecord["type"],
    category: notification.category,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    archived: notification.archived,
    actionUrl: notification.actionUrl,
    actionLabel: notification.actionLabel,
    metadata: notification.metadata as Record<string, unknown> | null,
    channels: notification.channels as NotificationRecord["channels"],
    createdAt: notification.createdAt,
    readAt: notification.readAt,
    archivedAt: notification.archivedAt,
  };
}

export class PrismaNotificationRepository implements NotificationRepository {
  async create(input: CreateNotificationInput): Promise<NotificationRecord> {
    const notification = await prisma.notification.create({
      data: {
        orgId: input.orgId,
        userId: input.userId ?? null,
        type: input.type,
        category: input.category,
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl ?? null,
        actionLabel: input.actionLabel ?? null,
        metadata: input.metadata ?? null,
        channels: input.channels ?? ["inApp"],
      },
    });
    return mapNotification(notification);
  }

  async findById(id: string): Promise<NotificationRecord | null> {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) return null;
    return mapNotification(notification);
  }

  async update(id: string, input: UpdateNotificationInput): Promise<NotificationRecord | null> {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        read: input.read,
        archived: input.archived,
        readAt: input.readAt,
        archivedAt: input.archivedAt,
      },
    });
    return mapNotification(notification);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.notification.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async list(input: ListNotificationsInput): Promise<NotificationListResult> {
    const where: any = {
      orgId: input.orgId,
    };

    if (input.userId !== undefined) {
      where.userId = input.userId;
    }

    if (input.type) {
      where.type = input.type;
    }

    if (input.read !== undefined) {
      where.read = input.read;
    }

    if (input.archived !== undefined) {
      where.archived = input.archived;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: input.limit ?? 50,
        skip: input.offset ?? 0,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      itens: notifications.map(mapNotification),
      total,
      proximoCursor: notifications.length === (input.limit ?? 50) ? notifications[notifications.length - 1]?.id : null,
    };
  }

  async markAsRead(id: string, userId: string): Promise<NotificationRecord | null> {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return mapNotification(notification);
  }

  async markAsUnread(id: string): Promise<NotificationRecord | null> {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        read: false,
        readAt: null,
      },
    });
    return mapNotification(notification);
  }

  async archive(id: string): Promise<NotificationRecord | null> {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        archived: true,
        archivedAt: new Date(),
      },
    });
    return mapNotification(notification);
  }

  async unarchive(id: string): Promise<NotificationRecord | null> {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        archived: false,
        archivedAt: null,
      },
    });
    return mapNotification(notification);
  }

  async markAllAsRead(orgId: string, userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        orgId,
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }

  async getStats(orgId: string, userId?: string | null): Promise<{
    total: number;
    unread: number;
    archived: number;
    byType: Record<string, number>;
  }> {
    const where: any = { orgId };
    if (userId !== undefined) {
      where.userId = userId;
    }

    const [total, unread, archived, byType] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, read: false } }),
      prisma.notification.count({ where: { ...where, archived: true } }),
      prisma.notification.groupBy({
        by: ["type"],
        where,
        _count: true,
      }),
    ]);

    const byTypeMap: Record<string, number> = {};
    byType.forEach((item) => {
      byTypeMap[item.type] = item._count;
    });

    return {
      total,
      unread,
      archived,
      byType: byTypeMap,
    };
  }
}



