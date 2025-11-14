import { getPrisma } from "../../../../infra/database/prisma.service";
import { Team } from "../../domain/entities/team";
import type {
  TeamListaFiltro,
  TeamListaPagina,
  TeamProps,
  TeamRepository,
  TeamStatus,
} from "../../domain/repositories/team-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  departmentId: string | null;
  name: string;
  code: string;
  description: string | null;
  status: string;
  ordem: number;
  metadata: unknown;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const props: TeamProps = {
    orgId: record.orgId,
    departmentId: record.departmentId,
    name: record.name,
    code: record.code,
    description: record.description,
    status: record.status as TeamStatus,
    ordem: record.ordem,
    metadata: (record.metadata as Record<string, unknown>) ?? null,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  return Team.restaurar(props, record.id);
}

export class PrismaTeamRepository implements TeamRepository {
  async salvar(team: Team) {
    const dados = team.dados;

    await prisma.team.upsert({
      where: { id: team.teamId },
      create: {
        id: team.teamId,
        orgId: dados.orgId,
        departmentId: dados.departmentId,
        name: dados.name,
        code: dados.code,
        description: dados.description,
        status: dados.status,
        ordem: dados.ordem,
        metadata: dados.metadata,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        departmentId: dados.departmentId,
        name: dados.name,
        code: dados.code,
        description: dados.description,
        status: dados.status,
        ordem: dados.ordem,
        metadata: dados.metadata,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async encontrarPorId(orgId: string, teamId: string) {
    const record = await prisma.team.findUnique({ where: { id: teamId } });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorCode(orgId: string, code: string) {
    const record = await prisma.team.findFirst({
      where: { orgId, code },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(orgId: string, filtro: TeamListaFiltro = {}): Promise<TeamListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters = [];
    if (filtro.status) {
      andFilters.push({ status: filtro.status });
    }
    if (filtro.departmentId !== undefined) {
      andFilters.push({ departmentId: filtro.departmentId });
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

    const records = await prisma.team.findMany({
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

  async contarPorOrg(orgId: string, status?: TeamStatus): Promise<number> {
    return prisma.team.count({
      where: {
        orgId,
        ...(status && { status }),
      },
    });
  }

  async deletar(orgId: string, teamId: string): Promise<void> {
    await prisma.team.delete({
      where: { id: teamId, orgId },
    });
  }
}

function encodeCursor(team: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: team.id,
    updatedAt: team.updatedAt.toISOString(),
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
