import type {
  PositionPermission,
  PositionPermissionFiltro,
  PositionPermissionRepository,
} from "../../domain/repositories/position-permission-repository";
import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  positionId: string;
  permissionId: string;
  granted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}): PositionPermission {
  return {
    id: record.id,
    orgId: record.orgId,
    positionId: record.positionId,
    permissionId: record.permissionId,
    granted: record.granted,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
  };
}

export class PrismaPositionPermissionRepository implements PositionPermissionRepository {
  async salvar(permission: PositionPermission): Promise<void> {
    await prisma.positionPermission.upsert({
      where: {
        unique_position_permission: {
          positionId: permission.positionId,
          permissionId: permission.permissionId,
        },
      },
      create: {
        id: permission.id,
        orgId: permission.orgId,
        positionId: permission.positionId,
        permissionId: permission.permissionId,
        granted: permission.granted,
        createdBy: permission.createdBy,
        updatedBy: permission.updatedBy,
      },
      update: {
        granted: permission.granted,
        updatedBy: permission.updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  async encontrarPorId(orgId: string, id: string): Promise<PositionPermission | null> {
    const record = await prisma.positionPermission.findFirst({
      where: {
        id,
        orgId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async encontrarPorPositionEPermission(
    orgId: string,
    positionId: string,
    permissionId: string,
  ): Promise<PositionPermission | null> {
    const record = await prisma.positionPermission.findUnique({
      where: {
        unique_position_permission: {
          positionId,
          permissionId,
        },
      },
    });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async listarPorOrg(
    orgId: string,
    filtro?: PositionPermissionFiltro,
  ): Promise<PositionPermission[]> {
    const where: {
      orgId: string;
      positionId?: string;
      permissionId?: string;
      granted?: boolean;
    } = {
      orgId,
    };

    if (filtro?.positionId) {
      where.positionId = filtro.positionId;
    }

    if (filtro?.permissionId) {
      where.permissionId = filtro.permissionId;
    }

    if (filtro?.granted !== undefined) {
      where.granted = filtro.granted;
    }

    const records = await prisma.positionPermission.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map(toDomain);
  }

  async listarPorPosition(orgId: string, positionId: string): Promise<PositionPermission[]> {
    const records = await prisma.positionPermission.findMany({
      where: {
        orgId,
        positionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map(toDomain);
  }

  async listarPorPositions(orgId: string, positionIds: string[]): Promise<PositionPermission[]> {
    if (positionIds.length === 0) {
      return [];
    }

    const records = await prisma.positionPermission.findMany({
      where: {
        orgId,
        positionId: {
          in: positionIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map(toDomain);
  }

  async deletar(orgId: string, id: string): Promise<void> {
    await prisma.positionPermission.deleteMany({
      where: {
        id,
        orgId,
      },
    });
  }

  async deletarPorPositionEPermission(
    orgId: string,
    positionId: string,
    permissionId: string,
  ): Promise<void> {
    await prisma.positionPermission.deleteMany({
      where: {
        orgId,
        positionId,
        permissionId,
      },
    });
  }
}

