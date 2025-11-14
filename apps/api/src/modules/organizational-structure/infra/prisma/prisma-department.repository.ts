import { getPrisma } from "../../../../infra/database/prisma.service";
import { Department } from "../../domain/entities/department";
import type {
  DepartmentListaFiltro,
  DepartmentListaPagina,
  DepartmentProps,
  DepartmentRepository,
  DepartmentStatus,
} from "../../domain/repositories/department-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  unitId: string | null;
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
}) {
  const props: DepartmentProps = {
    orgId: record.orgId,
    unitId: record.unitId,
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
        unitId: dados.unitId,
        name: dados.name,
        code: dados.code,
        description: dados.description,
        parentId: dados.parentId,
        status: dados.status,
        ordem: dados.ordem,
        metadata: dados.metadata,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        unitId: dados.unitId,
        name: dados.name,
        code: dados.code,
        description: dados.description,
        parentId: dados.parentId,
        status: dados.status,
        ordem: dados.ordem,
        metadata: dados.metadata,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
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
      where: { orgId, code },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(
    orgId: string,
    filtro: DepartmentListaFiltro = {},
  ): Promise<DepartmentListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters = [];
    if (filtro.status) {
      andFilters.push({ status: filtro.status });
    }
    if (filtro.unitId !== undefined) {
      andFilters.push({ unitId: filtro.unitId });
    }
    if (filtro.parentId !== undefined) {
      andFilters.push({ parentId: filtro.parentId });
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
        ...(status && { status }),
      },
    });
  }

  async deletar(orgId: string, departmentId: string): Promise<void> {
    await prisma.department.delete({
      where: { id: departmentId, orgId },
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
