import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type { DepartmentProps, DepartmentStatus } from "../../domain/entities/department";
import { Department } from "../../domain/entities/department";
import type {
  DepartmentListaFiltro,
  DepartmentListaPagina,
  DepartmentRepository,
} from "../../domain/repositories/department-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  branchId: string | null;
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
  const props: DepartmentProps = {
    orgId: record.orgId,
    branchId: record.branchId,
    name: record.name,
    code: record.code,
    description: record.description,
    parentId: record.parentId,
    status: record.status as DepartmentStatus,
    ordem: record.ordem,
    metadata: (record.metadata as Record<string, unknown>) ?? null,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    deletedBy: record.deletedBy,
  };

  return Department.restaurar(props, record.id);
}

export class PrismaDepartmentRepository implements DepartmentRepository {
  async salvar(department: Department) {
    const dados = department.dados;

    await prisma.department.upsert({
      where: { id: department.departmentId },
      create: {
        id: department.departmentId,
        orgId: dados.orgId,
        branchId: dados.branchId,
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

  async encontrarPorId(orgId: string, departmentId: string) {
    const record = await prisma.department.findUnique({ where: { id: departmentId } });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorCode(orgId: string, code: string) {
    const record = await prisma.department.findFirst({
      // Por padrão, não considerar departamentos inativos/arquivados
      where: { orgId, code, status: "ativo", deletedAt: null },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(
    orgId: string,
    filtro: DepartmentListaFiltro = {},
  ): Promise<DepartmentListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters = [];
    // Por padrão, listar apenas itens ativos. Para incluir outros status, passar filtro.status.
    andFilters.push({ status: filtro.status ?? "ativo" });
    // Sempre excluir soft-deletes por padrão
    andFilters.push({ deletedAt: null });
    if (filtro.branchId !== undefined) {
      andFilters.push({ branchId: filtro.branchId });
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

    const where: Prisma.DepartmentWhereInput = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters as Prisma.DepartmentWhereInput[] } : {}),
    };

    const records = await prisma.department.findMany({
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

  async contarPorOrg(orgId: string, status?: DepartmentStatus): Promise<number> {
    return prisma.department.count({
      where: {
        orgId,
        status: status ?? "ativo",
        deletedAt: null,
      },
    });
  }

  async deletar(orgId: string, departmentId: string): Promise<void> {
    // Soft delete por padrão: arquivar (mantém histórico)
    await prisma.department.updateMany({
      where: { id: departmentId, orgId },
      data: { status: "arquivado", deletedAt: new Date(), deletedBy: null },
    });
  }
}

function encodeCursor(department: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: department.id,
    updatedAt: department.updatedAt.toISOString(),
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
