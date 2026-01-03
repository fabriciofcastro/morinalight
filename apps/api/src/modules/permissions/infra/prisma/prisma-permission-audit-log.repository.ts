import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  PermissionAuditLog,
  PermissionAuditLogFilter,
  PermissionAuditLogPage,
  PermissionAuditLogRepository,
} from "../../domain/repositories/permission-audit-log-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  entityType: string;
  entityId: string;
  permissionId: string;
  action: string;
  granted: boolean | null;
  previousValue: boolean | null;
  actorId: string;
  reason: string | null;
  metadata: unknown;
  createdAt: Date;
}): PermissionAuditLog {
  return {
    id: record.id,
    orgId: record.orgId,
    entityType: record.entityType as "position" | "sector" | "department" | "user",
    entityId: record.entityId,
    permissionId: record.permissionId,
    action: record.action as "granted" | "denied" | "removed",
    granted: record.granted,
    previousValue: record.previousValue,
    actorId: record.actorId,
    reason: record.reason,
    metadata: (record.metadata as Record<string, unknown>) ?? null,
    createdAt: record.createdAt,
  };
}

export class PrismaPermissionAuditLogRepository implements PermissionAuditLogRepository {
  async registrar(log: PermissionAuditLog): Promise<void> {
    await prisma.permissionAuditLog.create({
      data: {
        id: log.id,
        orgId: log.orgId,
        entityType: log.entityType,
        entityId: log.entityId,
        permissionId: log.permissionId,
        action: log.action,
        granted: log.granted,
        previousValue: log.previousValue,
        actorId: log.actorId,
        reason: log.reason,
        metadata: log.metadata ? (log.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        createdAt: log.createdAt,
      },
    });
  }

  async listar(
    orgId: string,
    filtro: PermissionAuditLogFilter = {},
  ): Promise<PermissionAuditLogPage> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters: Array<Record<string, unknown>> = [];

    if (filtro.entityType) {
      andFilters.push({ entityType: filtro.entityType });
    }

    if (filtro.entityId) {
      andFilters.push({ entityId: filtro.entityId });
    }

    if (filtro.permissionId) {
      andFilters.push({ permissionId: filtro.permissionId });
    }

    if (filtro.action) {
      andFilters.push({ action: filtro.action });
    }

    if (filtro.actorId) {
      andFilters.push({ actorId: filtro.actorId });
    }

    if (filtro.search) {
      const s = filtro.search.trim();
      if (s.length > 0) {
        andFilters.push({
          OR: [
            { permissionId: { contains: s, mode: "insensitive" } },
            { reason: { contains: s, mode: "insensitive" } },
            { entityId: { contains: s, mode: "insensitive" } },
            { actorId: { contains: s, mode: "insensitive" } },
          ],
        });
      }
    }

    if (filtro.dataInicio || filtro.dataFim) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (filtro.dataInicio) {
        dateFilter.gte = filtro.dataInicio;
      }
      if (filtro.dataFim) {
        dateFilter.lte = filtro.dataFim;
      }
      andFilters.push({ createdAt: dateFilter });
    }

    if (filtro.cursor) {
      const cursor = decodeCursor(filtro.cursor);
      andFilters.push({
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          {
            AND: [{ createdAt: cursor.createdAt }, { id: { lt: cursor.id } }],
          },
        ],
      });
    }

    const where = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const records = await prisma.permissionAuditLog.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const hasMore = records.length > limit;
    const itens = hasMore ? records.slice(0, limit) : records;
    const last = itens.at(-1);

    return {
      itens: itens.map(toDomain),
      proximoCursor: hasMore && last ? encodeCursor(last) : undefined,
    };
  }

  async contar(orgId: string, filtro: PermissionAuditLogFilter = {}): Promise<number> {
    const andFilters: Array<Record<string, unknown>> = [];

    if (filtro.entityType) {
      andFilters.push({ entityType: filtro.entityType });
    }

    if (filtro.entityId) {
      andFilters.push({ entityId: filtro.entityId });
    }

    if (filtro.permissionId) {
      andFilters.push({ permissionId: filtro.permissionId });
    }

    if (filtro.action) {
      andFilters.push({ action: filtro.action });
    }

    if (filtro.actorId) {
      andFilters.push({ actorId: filtro.actorId });
    }

    if (filtro.dataInicio || filtro.dataFim) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (filtro.dataInicio) {
        dateFilter.gte = filtro.dataInicio;
      }
      if (filtro.dataFim) {
        dateFilter.lte = filtro.dataFim;
      }
      andFilters.push({ createdAt: dateFilter });
    }

    const where = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    return prisma.permissionAuditLog.count({ where });
  }
}

function encodeCursor(log: { id: string; createdAt: Date }) {
  const data = JSON.stringify({
    id: log.id,
    createdAt: log.createdAt.toISOString(),
  });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as {
      id: string;
      createdAt: string;
    };
    return {
      id: parsed.id,
      createdAt: new Date(parsed.createdAt),
    };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}
