import type {
  Prisma,
  PermissionChangeRequest as PrismaPermissionChangeRequest,
} from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  PermissionChangeRequest,
  PermissionChangeRequestFilter,
  PermissionChangeRequestPage,
  PermissionChangeRequestRepository,
} from "../../domain/repositories/permission-change-request-repository";

const prisma = getPrisma();

function toDomain(record: PrismaPermissionChangeRequest): PermissionChangeRequest {
  return {
    id: record.id,
    orgId: record.orgId,
    entityType: record.entityType,
    entityId: record.entityId,
    permissionId: record.permissionId,
    granted: record.granted,
    reason: record.reason,
    status: record.status,
    requestedBy: record.requestedBy,
    decidedBy: record.decidedBy,
    decidedAt: record.decidedAt,
    decisionReason: record.decisionReason,
    slaDueAt: record.slaDueAt ?? null,
    slaNotifiedAt: record.slaNotifiedAt ?? null,
    slaBreachedAt: record.slaBreachedAt ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function encodeCursor(cursor: { createdAt: Date; id: string }) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } {
  const raw = JSON.parse(Buffer.from(cursor, "base64").toString("utf8")) as {
    createdAt: string;
    id: string;
  };
  return { createdAt: new Date(raw.createdAt), id: raw.id };
}

export class PrismaPermissionChangeRequestRepository implements PermissionChangeRequestRepository {
  async criar(req: PermissionChangeRequest): Promise<void> {
    await prisma.permissionChangeRequest.create({
      data: {
        id: req.id,
        orgId: req.orgId,
        entityType: req.entityType,
        entityId: req.entityId,
        permissionId: req.permissionId,
        granted: req.granted,
        reason: req.reason,
        status: req.status,
        requestedBy: req.requestedBy,
        decidedBy: req.decidedBy,
        decidedAt: req.decidedAt,
        decisionReason: req.decisionReason,
        slaDueAt: req.slaDueAt,
        slaNotifiedAt: req.slaNotifiedAt,
        slaBreachedAt: req.slaBreachedAt,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      },
    });
  }

  async encontrarPorId(orgId: string, id: string): Promise<PermissionChangeRequest | null> {
    const record = await prisma.permissionChangeRequest.findFirst({ where: { id, orgId } });
    return record ? toDomain(record) : null;
  }

  async listar(
    orgId: string,
    filtro: PermissionChangeRequestFilter = {},
  ): Promise<PermissionChangeRequestPage> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);
    const andFilters: Prisma.PermissionChangeRequestWhereInput[] = [];

    if (filtro.status) andFilters.push({ status: filtro.status });
    if (filtro.entityType) andFilters.push({ entityType: filtro.entityType });
    if (filtro.entityId) andFilters.push({ entityId: filtro.entityId });
    if (filtro.permissionId) andFilters.push({ permissionId: filtro.permissionId });
    if (filtro.requestedBy) andFilters.push({ requestedBy: filtro.requestedBy });

    if (filtro.cursor) {
      const cursor = decodeCursor(filtro.cursor);
      andFilters.push({
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          { AND: [{ createdAt: cursor.createdAt }, { id: { lt: cursor.id } }] },
        ],
      });
    }

    const where: Prisma.PermissionChangeRequestWhereInput = {
      orgId,
      AND: andFilters.length > 0 ? andFilters : undefined,
    };

    const records = await prisma.permissionChangeRequest.findMany({
      where,
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const itens = records.map(toDomain);
    const last = itens[itens.length - 1];
    const proximoCursor = last
      ? encodeCursor({ createdAt: last.createdAt, id: last.id })
      : undefined;

    return { itens, proximoCursor };
  }

  async salvar(req: PermissionChangeRequest): Promise<void> {
    await prisma.permissionChangeRequest.update({
      where: { id: req.id },
      data: {
        status: req.status,
        decidedBy: req.decidedBy,
        decidedAt: req.decidedAt,
        decisionReason: req.decisionReason,
        slaDueAt: req.slaDueAt,
        slaNotifiedAt: req.slaNotifiedAt,
        slaBreachedAt: req.slaBreachedAt,
        updatedAt: req.updatedAt,
      },
    });
  }
}
