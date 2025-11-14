import type {
  PositionListaFiltro,
  PositionListaPagina,
  PositionProps,
  PositionRepository,
  PositionStatus,
} from "../../domain/repositories/position-repository";
import { Position } from "../../domain/entities/position";
import { getPrisma } from "../../../../infra/database/prisma.service";

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
        metadata: dados.metadata,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
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
        metadata: dados.metadata,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
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
      where: { orgId, code },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(orgId: string, filtro: PositionListaFiltro = {}): Promise<PositionListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters = [];
    if (filtro.status) {
      andFilters.push({ status: filtro.status });
    }
    if (filtro.sectorId) {
      andFilters.push({ sectorId: filtro.sectorId });
    }
    if (filtro.busca) {
      andFilters.push({
        OR: [
          { name: { contains: filtro.busca, mode: "insensitive" } },
          { code: { contains: filtro.busca, mode: "insensitive" } },
          { description: { contains: filtro.busca, mode: "insensitive" } },
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

    const where = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
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
        ...(status && { status }),
      },
    });
  }

  async deletar(orgId: string, positionId: string): Promise<void> {
    await prisma.position.delete({
      where: { id: positionId, orgId },
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

