import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  DepartmentPermission,
  DepartmentPermissionFiltro,
  DepartmentPermissionRepository,
} from "../../domain/repositories/department-permission-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  departmentId: string;
  permissionId: string;
  granted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}): DepartmentPermission {
  return {
    id: record.id,
    orgId: record.orgId,
    departmentId: record.departmentId,
    permissionId: record.permissionId,
    granted: record.granted,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
  };
}

export class PrismaDepartmentPermissionRepository implements DepartmentPermissionRepository {
  async salvar(permission: DepartmentPermission): Promise<void> {
    await prisma.departmentPermission.upsert({
      where: {
        unique_department_permission: {
          departmentId: permission.departmentId,
          permissionId: permission.permissionId,
        },
      },
      create: {
        id: permission.id,
        orgId: permission.orgId,
        departmentId: permission.departmentId,
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

  async encontrarPorId(orgId: string, id: string): Promise<DepartmentPermission | null> {
    const record = await prisma.departmentPermission.findFirst({
      where: {
        id,
        orgId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async encontrarPorDepartmentEPermission(
    orgId: string,
    departmentId: string,
    permissionId: string,
  ): Promise<DepartmentPermission | null> {
    const record = await prisma.departmentPermission.findUnique({
      where: {
        unique_department_permission: {
          departmentId,
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
    filtro?: DepartmentPermissionFiltro,
  ): Promise<DepartmentPermission[]> {
    const where: {
      orgId: string;
      departmentId?: string;
      permissionId?: string;
      granted?: boolean;
    } = {
      orgId,
    };

    if (filtro?.departmentId) {
      where.departmentId = filtro.departmentId;
    }

    if (filtro?.permissionId) {
      where.permissionId = filtro.permissionId;
    }

    if (filtro?.granted !== undefined) {
      where.granted = filtro.granted;
    }

    const records = await prisma.departmentPermission.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map(toDomain);
  }

  async listarPorDepartment(orgId: string, departmentId: string): Promise<DepartmentPermission[]> {
    const records = await prisma.departmentPermission.findMany({
      where: {
        orgId,
        departmentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map(toDomain);
  }

  async listarPorDepartments(
    orgId: string,
    departmentIds: string[],
  ): Promise<DepartmentPermission[]> {
    if (departmentIds.length === 0) {
      return [];
    }

    const records = await prisma.departmentPermission.findMany({
      where: {
        orgId,
        departmentId: {
          in: departmentIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map(toDomain);
  }

  async deletar(orgId: string, id: string): Promise<void> {
    await prisma.departmentPermission.deleteMany({
      where: {
        id,
        orgId,
      },
    });
  }

  async deletarPorDepartmentEPermission(
    orgId: string,
    departmentId: string,
    permissionId: string,
  ): Promise<void> {
    await prisma.departmentPermission.deleteMany({
      where: {
        orgId,
        departmentId,
        permissionId,
      },
    });
  }
}
