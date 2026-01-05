import type { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import { Permission } from "../../domain/entities/permission";
import type {
  PermissionFiltro,
  PermissionRepository,
} from "../../domain/repositories/permission-repository";
import type { SecurityPolicy, ObjectAccessEntry } from "@morina/shared-kernel";

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

  async listarSecurityPolicies(orgId: string): Promise<SecurityPolicy[]> {
    const records = await prisma.securityPolicy.findMany({
      where: { orgId, active: true },
      orderBy: { priority: "desc" },
    });

    return records.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || undefined,
      effect: r.effect as "ALLOW" | "DENY",
      action: r.action.includes(",") ? r.action.split(",").map(a => a.trim()) : r.action,
      subject: r.subject.includes(",") ? r.subject.split(",").map(s => s.trim()) : r.subject,
      conditions: (r.conditions as any) || undefined,
      priority: r.priority,
      orgId: r.orgId,
      active: r.active,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async listarAclEntries(
    orgId: string,
    userId: string,
    role?: string,
  ): Promise<ObjectAccessEntry[]> {
    const records = await prisma.accessControlList.findMany({
      where: {
        orgId,
        OR: [
          { userId },
          ...(role ? [{ roleId: role }] : []),
        ],
      },
    });

    return records.map((r) => ({
      id: r.id,
      subject: r.subject,
      subjectId: r.subjectId,
      userId: r.userId || undefined,
      roleId: r.roleId || undefined,
      action: r.action,
    }));
  }
}
