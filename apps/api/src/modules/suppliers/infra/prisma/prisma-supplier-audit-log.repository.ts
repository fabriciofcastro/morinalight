import type { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  AuditoriaSupplierFilter,
  AuditoriaSupplierPage,
  AuditoriaSupplierRecord,
  AuditoriaSupplierRepository,
  CreateAuditoriaSupplierInput,
} from "../../repositories/supplier-audit-log.repository";

const prisma = getPrisma();

function encodeCursor(record: { id: string; createdAt: Date }) {
  const data = JSON.stringify({ id: record.id, createdAt: record.createdAt.toISOString() });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string): { id: string; createdAt: Date } {
  const data = Buffer.from(cursor, "base64url").toString("utf-8");
  const parsed = JSON.parse(data);
  return {
    id: parsed.id,
    createdAt: new Date(parsed.createdAt),
  };
}

export class PrismaSupplierAuditLogRepository implements AuditoriaSupplierRepository {
  async create(input: CreateAuditoriaSupplierInput): Promise<AuditoriaSupplierRecord> {
    const record = await prisma.auditoriaSupplier.create({
      data: {
        supplierId: input.supplierId,
        orgId: input.orgId,
        acao: input.acao,
        campo: input.campo,
        estadoAnterior: input.estadoAnterior ? (input.estadoAnterior as Prisma.InputJsonValue) : Prisma.JsonNull,
        estadoNovo: input.estadoNovo ? (input.estadoNovo as Prisma.InputJsonValue) : Prisma.JsonNull,
        actorId: input.actorId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        justificativa: input.justificativa,
        metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });

    return this.mapToRecord(record);
  }

  async findBySupplierId(
    supplierId: string,
    filtro: AuditoriaSupplierFilter = {},
  ): Promise<AuditoriaSupplierPage> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 100);

    const andFilters: Prisma.AuditoriaSupplierWhereInput[] = [{ supplierId }];

    if (filtro.orgId) {
      andFilters.push({ orgId: filtro.orgId });
    }

    if (filtro.actorId) {
      andFilters.push({ actorId: filtro.actorId });
    }

    if (filtro.acao) {
      andFilters.push({ acao: filtro.acao });
    }

    if (filtro.dataInicio || filtro.dataFim) {
      andFilters.push({
        createdAt: {
          ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
          ...(filtro.dataFim ? { lte: filtro.dataFim } : {}),
        },
      });
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

    const records = await prisma.auditoriaSupplier.findMany({
      where: { AND: andFilters },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });

    const hasMore = records.length > limit;
    const pageItems = hasMore ? records.slice(0, limit) : records;
    const last = pageItems.at(-1);

    return {
      itens: pageItems.map(this.mapToRecord),
      proximoCursor: last ? encodeCursor(last) : undefined,
    };
  }

  async findByOrgId(orgId: string, filtro: AuditoriaSupplierFilter = {}): Promise<AuditoriaSupplierPage> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 100);

    const andFilters: Prisma.AuditoriaSupplierWhereInput[] = [{ orgId }];

    if (filtro.supplierId) {
      andFilters.push({ supplierId: filtro.supplierId });
    }

    if (filtro.actorId) {
      andFilters.push({ actorId: filtro.actorId });
    }

    if (filtro.acao) {
      andFilters.push({ acao: filtro.acao });
    }

    if (filtro.dataInicio || filtro.dataFim) {
      andFilters.push({
        createdAt: {
          ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
          ...(filtro.dataFim ? { lte: filtro.dataFim } : {}),
        },
      });
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

    const records = await prisma.auditoriaSupplier.findMany({
      where: { AND: andFilters },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });

    const hasMore = records.length > limit;
    const pageItems = hasMore ? records.slice(0, limit) : records;
    const last = pageItems.at(-1);

    return {
      itens: pageItems.map(this.mapToRecord),
      proximoCursor: last ? encodeCursor(last) : undefined,
    };
  }

  private mapToRecord(record: {
    id: string;
    supplierId: string;
    orgId: string;
    acao: string;
    campo: string | null;
    estadoAnterior: unknown;
    estadoNovo: unknown;
    actorId: string;
    ipAddress: string | null;
    userAgent: string | null;
    justificativa: string | null;
    metadata: unknown;
    createdAt: Date;
  }): AuditoriaSupplierRecord {
    return {
      id: record.id,
      supplierId: record.supplierId,
      orgId: record.orgId,
      acao: record.acao,
      campo: record.campo,
      estadoAnterior: record.estadoAnterior,
      estadoNovo: record.estadoNovo,
      actorId: record.actorId,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      justificativa: record.justificativa,
      metadata: record.metadata,
      createdAt: record.createdAt,
    };
  }
}





