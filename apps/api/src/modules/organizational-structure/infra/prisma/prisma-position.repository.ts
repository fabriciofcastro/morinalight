import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import { Position } from "../../domain/entities/position";
import type {
  PositionListaFiltro,
  PositionListaPagina,
  PositionProps,
  PositionRepository,
  PositionStatus,
} from "../../domain/repositories/position-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  sectorId: string;
  name: string;
  code: string;
  description: string | null;
  responsabilidades: string | null;
  requisitos: string | null;
  salarioMin: unknown;
  salarioMax: unknown;
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
  const props: PositionProps = {
    orgId: record.orgId,
    sectorId: record.sectorId,
    name: record.name,
    code: record.code,
    description: record.description,
    responsabilidades: record.responsabilidades,
    requisitos: record.requisitos,
    salarioMin: record.salarioMin ? Number(record.salarioMin) : null,
    salarioMax: record.salarioMax ? Number(record.salarioMax) : null,
    status: record.status as PositionStatus,
    ordem: record.ordem,
    metadata: (record.metadata as Record<string, unknown>) ?? null,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    deletedBy: record.deletedBy,
  };

  return Position.restaurar(props, record.id);
}

export class PrismaPositionRepository implements PositionRepository {
  async salvar(position: Position) {
    const dados = position.dados;

    await prisma.position.upsert({
      where: { id: position.positionId },
      create: {
        id: position.positionId,
        orgId: dados.orgId,
        sectorId: dados.sectorId,
        name: dados.name,
        code: dados.code,
        description: dados.description,
        responsabilidades: dados.responsabilidades,
        requisitos: dados.requisitos,
        salarioMin: dados.salarioMin,
        salarioMax: dados.salarioMax,
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
        responsabilidades: dados.responsabilidades,
        requisitos: dados.requisitos,
        salarioMin: dados.salarioMin,
        salarioMax: dados.salarioMax,
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

  async encontrarPorId(orgId: string, positionId: string) {
    const record = await prisma.position.findUnique({ where: { id: positionId } });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorCode(orgId: string, code: string) {
    const record = await prisma.position.findFirst({
      // Por padrão, não considerar cargos inativos/arquivados
      where: { orgId, code, status: "ativo", deletedAt: null },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(
    orgId: string,
    filtro: PositionListaFiltro = {},
  ): Promise<PositionListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters = [];
    // Por padrão, listar apenas itens ativos. Para incluir outros status, passar filtro.status.
    andFilters.push({ status: filtro.status ?? "ativo" });
    // Sempre excluir soft-deletes por padrão
    andFilters.push({ deletedAt: null });
    if (filtro.sectorId) {
      andFilters.push({ sectorId: filtro.sectorId });
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

    const where: Prisma.PositionWhereInput = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters as Prisma.PositionWhereInput[] } : {}),
    };

    const records = await prisma.position.findMany({
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
    return prisma.position.count({
      where: {
        orgId,
        status: status ?? "ativo",
        deletedAt: null,
      },
    });
  }

  async deletar(orgId: string, positionId: string): Promise<void> {
    // Soft delete por padrão: arquivar (mantém histórico)
    await prisma.position.updateMany({
      where: { id: positionId, orgId },
      data: { status: "arquivado", deletedAt: new Date(), deletedBy: null },
    });
  }
}

function encodeCursor(position: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: position.id,
    updatedAt: position.updatedAt.toISOString(),
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
