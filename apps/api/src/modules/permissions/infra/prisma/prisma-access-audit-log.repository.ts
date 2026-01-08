/**
 * Prisma Access Audit Log Repository Implementation
 */

import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../infra/prisma/client";
import type {
  AccessAuditLog,
  AccessAuditLogFilter,
  AccessAuditLogPage,
  AccessAuditLogRepository,
} from "../../domain/repositories/access-audit-log.repository";

function toDomain(record: {
  id: string;
  orgId: string;
  userId: string;
  permission: string;
  granted: boolean;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  resource: string | null;
  endpoint: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
}): AccessAuditLog {
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    permission: record.permission,
    granted: record.granted,
    reason: record.reason,
    ipAddress: record.ipAddress,
    userAgent: record.userAgent,
    resource: record.resource,
    endpoint: record.endpoint,
    metadata: record.metadata as Record<string, unknown> | null,
    createdAt: record.createdAt,
  };
}

export class PrismaAccessAuditLogRepository implements AccessAuditLogRepository {
  async registrar(log: Omit<AccessAuditLog, "id" | "createdAt">): Promise<AccessAuditLog> {
    const record = await prisma.accessAuditLog.create({
      data: {
        id: randomUUID(),
        orgId: log.orgId,
        userId: log.userId,
        permission: log.permission,
        granted: log.granted,
        reason: log.reason ?? null,
        ipAddress: log.ipAddress ?? null,
        userAgent: log.userAgent ?? null,
        resource: log.resource ?? null,
        endpoint: log.endpoint ?? null,
        metadata: log.metadata ? (log.metadata as Prisma.InputJsonValue) : null,
        createdAt: new Date(),
      },
    });

    return toDomain(record);
  }

  async listar(filtro: AccessAuditLogFilter): Promise<AccessAuditLogPage> {
    const where: Prisma.AccessAuditLogWhereInput = {
      orgId: filtro.orgId,
    };

    if (filtro.userId) {
      where.userId = filtro.userId;
    }

    if (filtro.permission) {
      where.permission = filtro.permission;
    }

    if (filtro.granted !== undefined) {
      where.granted = filtro.granted;
    }

    if (filtro.ipAddress) {
      where.ipAddress = filtro.ipAddress;
    }

    if (filtro.startDate || filtro.endDate) {
      where.createdAt = {};
      if (filtro.startDate) {
        where.createdAt.gte = filtro.startDate;
      }
      if (filtro.endDate) {
        where.createdAt.lte = filtro.endDate;
      }
    }

    const limit = filtro.limit ?? 50;
    const cursor = filtro.cursor ? { id: filtro.cursor } : undefined;

    const records = await prisma.accessAuditLog.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor.id } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const hasMore = records.length > limit;
    const itens = (hasMore ? records.slice(0, limit) : records).map(toDomain);
    const nextCursor = hasMore && itens.length > 0 ? itens[itens.length - 1].id : null;

    return {
      itens,
      nextCursor,
      hasMore,
    };
  }

  async contarAcessosNegados(
    orgId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return prisma.accessAuditLog.count({
      where: {
        orgId,
        userId,
        granted: false,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async contarAcessosPorPermissao(
    orgId: string,
    permission: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return prisma.accessAuditLog.count({
      where: {
        orgId,
        permission,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async listarIpsSuspeitos(
    orgId: string,
    threshold: number,
    startDate: Date,
  ): Promise<Array<{ ipAddress: string; count: number }>> {
    const results = await prisma.accessAuditLog.groupBy({
      by: ["ipAddress"],
      where: {
        orgId,
        granted: false,
        ipAddress: { not: null },
        createdAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: threshold,
          },
        },
      },
    });

    return results
      .filter((r) => r.ipAddress)
      .map((r) => ({
        ipAddress: r.ipAddress!,
        count: r._count.id,
      }))
      .sort((a, b) => b.count - a.count);
  }
}
