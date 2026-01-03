import type { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import { Permission } from "../../domain/entities/permission";
import type {
  PermissionFiltro,
  PermissionRepository,
} from "../../domain/repositories/permission-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
  level: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return Permission.restaurar({
    id: record.id,
    code: record.code,
    name: record.name,
    description: record.description,
    module: record.module,
    level: record.level,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export class PrismaPermissionRepository implements PermissionRepository {
  async salvar(permission: Permission) {
    const dados = permission.dados;

    await prisma.permission.upsert({
      where: {
        code: dados.code,
      },
      create: {
        id: dados.id,
        code: dados.code,
        name: dados.name,
        description: dados.description,
        module: dados.module,
        level: dados.level,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        name: dados.name,
        description: dados.description,
        module: dados.module,
        level: dados.level,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async encontrarPorId(permissionId: string) {
    const record = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorChave(resource: string, action: string) {
    const code = `${resource}:${action}`;

    const record = await prisma.permission.findUnique({
      where: {
        code,
      },
    });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async listar(filtro?: PermissionFiltro) {
    const where: Prisma.PermissionWhereInput = {};

    if (filtro?.module) {
      where.module = filtro.module;
    }

    // Category removed from schema, mapping to module or ignoring
    // if (filtro?.category) {
    //   where.category = filtro.category;
    // }

    // Resource removed from schema
    // if (filtro?.resource) {
    //   where.resource = filtro.resource;
    // }

    if (filtro?.busca) {
      where.OR = [
        { name: { contains: filtro.busca, mode: "insensitive" } },
        { description: { contains: filtro.busca, mode: "insensitive" } },
        { code: { contains: filtro.busca, mode: "insensitive" } },
      ];
    }

    const records = await prisma.permission.findMany({
      where,
      orderBy: [{ module: "asc" }, { name: "asc" }],
    });

    return records.map(toDomain);
  }

  async encontrarPorIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) {
      return [];
    }

    const records = await prisma.permission.findMany({
      where: {
        id: { in: ids },
      },
    });

    return records.map(toDomain);
  }

  async deletar(permissionId: string): Promise<void> {
    await prisma.permission.delete({
      where: { id: permissionId },
    });
  }
}
