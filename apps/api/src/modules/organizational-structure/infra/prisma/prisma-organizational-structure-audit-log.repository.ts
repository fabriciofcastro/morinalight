import type {
  OrganizationalStructureAuditLogRepository,
  OrganizationalStructureAuditLog,
  OrganizationalStructureAuditLogFilter,
  OrganizationalStructureAuditLogPage,
} from "../../domain/repositories/organizational-structure-audit-log.repository";
import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  payload: unknown;
  createdAt: Date;
}): OrganizationalStructureAuditLog {
  return {
    id: record.id,
    orgId: record.orgId,
    entityType: record.entityType as "unit" | "department" | "team",
    entityId: record.entityId,
    action: record.action,
    actorId: record.actorId,
    payload: (record.payload as Record<string, unknown>) ?? null,
    createdAt: record.createdAt,
  };
}

export class PrismaOrganizationalStructureAuditLogRepository
  implements OrganizationalStructureAuditLogRepository
{
  async registrar(log: OrganizationalStructureAuditLog): Promise<void> {
    await prisma.organizationalStructureAuditLog.create({
      data: {
        id: log.id,
        orgId: log.orgId,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        actorId: log.actorId,
        payload: log.payload,
        createdAt: log.createdAt,
      },
    });
  }

  async listar(
    orgId: string,
    filtro: OrganizationalStructureAuditLogFilter = {},
  ): Promise<OrganizationalStructureAuditLogPage> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters = [];
    if (filtro.entityType) {
      andFilters.push({ entityType: filtro.entityType });
    }
    if (filtro.entityId) {
      andFilters.push({ entityId: filtro.entityId });
    }
    if (filtro.action) {
      andFilters.push({ action: filtro.action });
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

    const records = await prisma.organizationalStructureAuditLog.findMany({
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

