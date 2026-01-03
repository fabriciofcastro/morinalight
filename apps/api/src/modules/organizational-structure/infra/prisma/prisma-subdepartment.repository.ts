import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import { Subdepartment } from "../../domain/entities/subdepartment";
import type { SubdepartmentStatus, SubdepartmentProps } from "../../domain/entities/subdepartment";
import type {
  SubdepartmentListaFiltro,
  SubdepartmentListaPagina,
  SubdepartmentRepository,
} from "../../domain/repositories/subdepartment-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  branchId: string | null;
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
  const props: SubdepartmentProps = {
    orgId: record.orgId,
    branchId: record.branchId,
    departmentId: record.departmentId,
    name: record.name,
    code: record.code,
    description: record.description,
    parentId: record.parentId,
    status: record.status as SubdepartmentStatus,
    ordem: record.ordem,
    metadata: (record.metadata as Record<string, unknown>) ?? null,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    deletedBy: record.deletedBy,
  };

  return Subdepartment.restaurar(props, record.id);
}

export class PrismaSubdepartmentRepository implements SubdepartmentRepository {
  async salvar(subdepartment: Subdepartment) {
    const dados = subdepartment.dados;

    await prisma.subdepartment.upsert({
      where: { id: subdepartment.subdepartmentId },
      create: {
        id: subdepartment.subdepartmentId,
        orgId: dados.orgId,
        branchId: dados.branchId,
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
        branchId: dados.branchId,
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

  async encontrarPorId(orgId: string, subdepartmentId: string) {
    const record = await prisma.subdepartment.findUnique({ where: { id: subdepartmentId } });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorCode(orgId: string, code: string) {
    const record = await prisma.subdepartment.findFirst({
      where: { orgId, code, status: "ativo", deletedAt: null },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(
    orgId: string,
    filtro: SubdepartmentListaFiltro = {},
  ): Promise<SubdepartmentListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters = [];
    andFilters.push({ status: filtro.status ?? "ativo" });
    andFilters.push({ deletedAt: null });
    if (filtro.branchId !== undefined) {
      andFilters.push({ branchId: filtro.branchId });
    }
    if (filtro.departmentId !== undefined) {
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

    const where: Prisma.SubdepartmentWhereInput = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters as Prisma.SubdepartmentWhereInput[] } : {}),
    };

    const records = await prisma.subdepartment.findMany({
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

  async contarPorOrg(orgId: string, status?: SubdepartmentStatus): Promise<number> {
    return prisma.subdepartment.count({
      where: {
        orgId,
        status: status ?? "ativo",
        deletedAt: null,
      },
    });
  }

  async deletar(orgId: string, subdepartmentId: string): Promise<void> {
    await prisma.subdepartment.updateMany({
      where: { id: subdepartmentId, orgId },
      data: { status: "arquivado", deletedAt: new Date(), deletedBy: null },
    });
  }
}

function encodeCursor(subdepartment: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: subdepartment.id,
    updatedAt: subdepartment.updatedAt.toISOString(),
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

