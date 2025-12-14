import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  UserPermission,
  UserPermissionRepository,
} from "../../domain/repositories/user-permission-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  userId: string;
  permissionId: string;
  granted: boolean;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}): UserPermission {
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    permissionId: record.permissionId,
    granted: record.granted,
    reason: record.reason,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
  };
}

export class PrismaUserPermissionRepository implements UserPermissionRepository {
  async salvar(permission: UserPermission): Promise<void> {
    await prisma.userPermission.upsert({
      where: {
        unique_user_permission: {
          orgId: permission.orgId,
          userId: permission.userId,
          permissionId: permission.permissionId,
        },
      },
      create: {
        id: permission.id,
        orgId: permission.orgId,
        userId: permission.userId,
        permissionId: permission.permissionId,
        granted: permission.granted,
        reason: permission.reason,
        createdBy: permission.createdBy,
        updatedBy: permission.updatedBy,
      },
      update: {
        granted: permission.granted,
        reason: permission.reason,
        updatedBy: permission.updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  async encontrarPorUserEPermission(
    orgId: string,
    userId: string,
    permissionId: string,
  ): Promise<UserPermission | null> {
    const record = await prisma.userPermission.findUnique({
      where: {
        unique_user_permission: {
          orgId,
          userId,
          permissionId,
        },
      },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorUser(orgId: string, userId: string): Promise<UserPermission[]> {
    const records = await prisma.userPermission.findMany({
      where: { orgId, userId },
      orderBy: { createdAt: "desc" },
    });
    return records.map(toDomain);
  }

  async deletarPorUserEPermission(
    orgId: string,
    userId: string,
    permissionId: string,
  ): Promise<void> {
    await prisma.userPermission.deleteMany({
      where: { orgId, userId, permissionId },
    });
  }
}


