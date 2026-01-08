import type { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  PermissionTemplate,
  PermissionTemplateFilter,
  PermissionTemplatePermission,
  PermissionTemplateRepository,
} from "../../domain/repositories/permission-template-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  entityType: string;
  permissions: unknown;
  isDefault: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}): PermissionTemplate {
  return {
    id: record.id,
    orgId: record.orgId,
    name: record.name,
    description: record.description,
    entityType: record.entityType as "position" | "sector" | "department" | "all",
    permissions: (record.permissions as PermissionTemplatePermission[]) || [],
    isDefault: record.isDefault,
    isSystem: record.isSystem,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
  };
}

export class PrismaPermissionTemplateRepository implements PermissionTemplateRepository {
  async salvar(template: PermissionTemplate): Promise<void> {
    await prisma.permissionTemplate.upsert({
      where: {
        unique_template_name_per_entity: {
          orgId: template.orgId,
          name: template.name,
          entityType: template.entityType,
        },
      },
      create: {
        id: template.id,
        orgId: template.orgId,
        name: template.name,
        description: template.description,
        entityType: template.entityType,
        permissions: template.permissions as Prisma.InputJsonValue,
        isDefault: template.isDefault,
        isSystem: template.isSystem,
        createdBy: template.createdBy,
        updatedBy: template.updatedBy,
      },
      update: {
        name: template.name,
        description: template.description,
        entityType: template.entityType,
        permissions: template.permissions as Prisma.InputJsonValue,
        isDefault: template.isDefault,
        updatedBy: template.updatedBy,
        updatedAt: new Date(),
      },
    });

    // Se este template foi marcado como padrão, remover o padrão de outros templates do mesmo tipo
    if (template.isDefault) {
      await prisma.permissionTemplate.updateMany({
        where: {
          orgId: template.orgId,
          entityType: template.entityType,
          isDefault: true,
          id: { not: template.id },
        },
        data: {
          isDefault: false,
        },
      });
    }
  }

  async encontrarPorId(orgId: string, id: string): Promise<PermissionTemplate | null> {
    const record = await prisma.permissionTemplate.findFirst({
      where: {
        id,
        orgId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async encontrarPorNomeEEntityType(
    orgId: string,
    name: string,
    entityType: "position" | "sector" | "department" | "all",
  ): Promise<PermissionTemplate | null> {
    const record = await prisma.permissionTemplate.findUnique({
      where: {
        unique_template_name_per_entity: {
          orgId,
          name,
          entityType,
        },
      },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(
    orgId: string,
    filtro: PermissionTemplateFilter = {},
  ): Promise<PermissionTemplate[]> {
    const where: {
      orgId: string;
      entityType?: string;
      isDefault?: boolean;
      isSystem?: boolean;
    } = {
      orgId,
    };

    if (filtro.entityType) {
      where.entityType = filtro.entityType;
    }

    if (filtro.isDefault !== undefined) {
      where.isDefault = filtro.isDefault;
    }

    if (filtro.isSystem !== undefined) {
      where.isSystem = filtro.isSystem;
    }

    const records = await prisma.permissionTemplate.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { isSystem: "desc" }, { name: "asc" }],
    });

    return records.map(toDomain);
  }

  async encontrarDefaultPorEntityType(
    orgId: string,
    entityType: "position" | "sector" | "department" | "all",
  ): Promise<PermissionTemplate | null> {
    // Primeiro, tentar encontrar template padrão específico
    const defaultTemplate = await prisma.permissionTemplate.findFirst({
      where: {
        orgId,
        entityType,
        isDefault: true,
      },
    });

    if (defaultTemplate) {
      return toDomain(defaultTemplate);
    }

    // Se não encontrar, tentar template "all"
    if (entityType !== "all") {
      const allTemplate = await prisma.permissionTemplate.findFirst({
        where: {
          orgId,
          entityType: "all",
          isDefault: true,
        },
      });

      if (allTemplate) {
        return toDomain(allTemplate);
      }
    }

    return null;
  }

  async deletar(orgId: string, id: string): Promise<void> {
    await prisma.permissionTemplate.deleteMany({
      where: {
        id,
        orgId,
        isSystem: false, // Não permitir deletar templates do sistema
      },
    });
  }

  async contarPorOrg(orgId: string, filtro: PermissionTemplateFilter = {}): Promise<number> {
    const where: {
      orgId: string;
      entityType?: string;
      isDefault?: boolean;
      isSystem?: boolean;
    } = {
      orgId,
    };

    if (filtro.entityType) {
      where.entityType = filtro.entityType;
    }

    if (filtro.isDefault !== undefined) {
      where.isDefault = filtro.isDefault;
    }

    if (filtro.isSystem !== undefined) {
      where.isSystem = filtro.isSystem;
    }

    return prisma.permissionTemplate.count({ where });
  }
}
