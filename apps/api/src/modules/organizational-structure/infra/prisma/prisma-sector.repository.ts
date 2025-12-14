import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import { Sector } from "../../domain/entities/sector";
import type {
  SectorListaFiltro,
  SectorListaPagina,
  SectorProps,
  SectorRepository,
  SectorStatus,
} from "../../domain/repositories/sector-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  departmentId: string;
  name: string;
  code: string;
  description: string | null;
  parentId: string | null;
  status: string;
  ordem: number;
  metadata: unknown;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedBy: string | null;
}) {
  const props: SectorProps = {
    orgId: record.orgId,
    departmentId: record.departmentId,
    name: record.name,
    code: record.code,
    description: record.description,
    parentId: record.parentId,
    status: record.status as SectorStatus,
    ordem: record.ordem,
    metadata: (record.metadata as Record<string, unknown>) ?? null,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    deletedBy: record.deletedBy,
  };

  return Sector.restaurar(props, record.id);
}

export class PrismaSectorRepository implements SectorRepository {
  async salvar(sector: Sector) {
    const dados = sector.dados;

    await prisma.sector.upsert({
      where: { id: sector.sectorId },
      create: {
        id: sector.sectorId,
        orgId: dados.orgId,
        departmentId: dados.departmentId,
        name: dados.name,
        code: dados.code,
        description: dados.description,
        parentId: dados.parentId,
        status: dados.status,
        ordem: dados.ordem,
        metadata: dados.metadata ? (dados.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
        deletedAt: dados.deletedAt,
        deletedBy: dados.deletedBy,
      },
      update: {
        name: dados.name,
        code: dados.code,
        description: dados.description,
        parentId: dados.parentId,
        status: dados.status,
        ordem: dados.ordem,
        metadata: dados.metadata ? (dados.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
        deletedAt: dados.deletedAt,
        deletedBy: dados.deletedBy,
      },
    });
  }

  async encontrarPorId(orgId: string, sectorId: string) {
    const record = await prisma.sector.findUnique({ where: { id: sectorId } });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorCode(orgId: string, code: string) {
    const record = await prisma.sector.findFirst({
      // Por padrão, não considerar setores inativos/arquivados
      where: { orgId, code, status: "ativo", deletedAt: null },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(orgId: string, filtro: SectorListaFiltro = {}): Promise<SectorListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters = [];
    // Por padrão, listar apenas itens ativos. Para incluir outros status, passar filtro.status.
    andFilters.push({ status: filtro.status ?? "ativo" });
    // Sempre excluir soft-deletes por padrão
    andFilters.push({ deletedAt: null });
    if (filtro.departmentId) {
      andFilters.push({ departmentId: filtro.departmentId });
    }
    if (filtro.parentId !== undefined) {
      andFilters.push({ parentId: filtro.parentId });
    }
    if (filtro.busca) {
      andFilters.push({
        OR: [
          { name: { contains: filtro.busca, mode: Prisma.QueryMode.insensitive } },
          { code: { contains: filtro.busca, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: filtro.busca, mode: Prisma.QueryMode.insensitive } },
        ],
      });
    }
    if (filtro.cursor) {
      const cursor = decodeCursor(filtro.cursor);
      andFilters.push({
        OR: [
          { updatedAt: { lt: cursor.updatedAt } },
          {
            AND: [{ updatedAt: cursor.updatedAt }, { id: { lt: cursor.id } }],
          },
        ],
      });
    }

    const where: Prisma.SectorWhereInput = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters as Prisma.SectorWhereInput[] } : {}),
    };

    const records = await prisma.sector.findMany({
      where,
      take: limit + 1,
      orderBy: [{ ordem: "asc" }, { updatedAt: "desc" }, { id: "desc" }],
    });

    const hasMore = records.length > limit;
    const itens = hasMore ? records.slice(0, limit) : records;
    const last = itens.at(-1);

    return {
      itens: itens.map(toDomain),
      proximoCursor: hasMore && last ? encodeCursor(last) : undefined,
    };
  }

  async contarPorOrg(orgId: string, status?: "ativo" | "inativo" | "arquivado"): Promise<number> {
    return prisma.sector.count({
      where: {
        orgId,
        status: status ?? "ativo",
        deletedAt: null,
      },
    });
  }

  async deletar(orgId: string, sectorId: string): Promise<void> {
    // Soft delete por padrão: arquivar (mantém histórico)
    await prisma.sector.updateMany({
      where: { id: sectorId, orgId },
      data: { status: "arquivado", deletedAt: new Date(), deletedBy: null },
    });
  }
}

function encodeCursor(sector: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: sector.id,
    updatedAt: sector.updatedAt.toISOString(),
  });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as {
      id: string;
      updatedAt: string;
    };
    return {
      id: parsed.id,
      updatedAt: new Date(parsed.updatedAt),
    };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}
