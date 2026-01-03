import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  SectorPermission,
  SectorPermissionFiltro,
  SectorPermissionRepository,
} from "../../domain/repositories/sector-permission-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  sectorId: string;
  permissionId: string;
  granted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}): SectorPermission {
  return {
    id: record.id,
    orgId: record.orgId,
    sectorId: record.sectorId,
    permissionId: record.permissionId,
    granted: record.granted,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
  };
}

export class PrismaSectorPermissionRepository implements SectorPermissionRepository {
  async salvar(permission: SectorPermission): Promise<void> {
    await prisma.sectorPermission.upsert({
      where: {
        unique_sector_permission: {
          sectorId: permission.sectorId,
          permissionId: permission.permissionId,
        },
      },
      create: {
        id: permission.id,
        orgId: permission.orgId,
        sectorId: permission.sectorId,
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

  async encontrarPorId(orgId: string, id: string): Promise<SectorPermission | null> {
    const record = await prisma.sectorPermission.findFirst({
      where: {
        id,
        orgId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async encontrarPorSectorEPermission(
    orgId: string,
    sectorId: string,
    permissionId: string,
  ): Promise<SectorPermission | null> {
    const record = await prisma.sectorPermission.findUnique({
      where: {
        unique_sector_permission: {
          sectorId,
          permissionId,
        },
      },
    });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async listarPorOrg(orgId: string, filtro?: SectorPermissionFiltro): Promise<SectorPermission[]> {
    const where: {
      orgId: string;
      sectorId?: string;
      permissionId?: string;
      granted?: boolean;
    } = {
      orgId,
    };

    if (filtro?.sectorId) {
      where.sectorId = filtro.sectorId;
    }

    if (filtro?.permissionId) {
      where.permissionId = filtro.permissionId;
    }

    if (filtro?.granted !== undefined) {
      where.granted = filtro.granted;
    }

    const records = await prisma.sectorPermission.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map(toDomain);
  }

  async listarPorSector(orgId: string, sectorId: string): Promise<SectorPermission[]> {
    const records = await prisma.sectorPermission.findMany({
      where: {
        orgId,
        sectorId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map(toDomain);
  }

  async listarPorSectors(orgId: string, sectorIds: string[]): Promise<SectorPermission[]> {
    if (sectorIds.length === 0) {
      return [];
    }

    const records = await prisma.sectorPermission.findMany({
      where: {
        orgId,
        sectorId: {
          in: sectorIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map(toDomain);
  }

  async deletar(orgId: string, id: string): Promise<void> {
    await prisma.sectorPermission.deleteMany({
      where: {
        id,
        orgId,
      },
    });
  }

  async deletarPorSectorEPermission(
    orgId: string,
    sectorId: string,
    permissionId: string,
  ): Promise<void> {
    await prisma.sectorPermission.deleteMany({
      where: {
        orgId,
        sectorId,
        permissionId,
      },
    });
  }
}
