import type { OrganizationRole } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

export type DepartmentMembershipData = {
  id: string;
  orgId: string;
  departmentId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
};

export interface DepartmentMembershipRepository {
  adicionar(
    orgId: string,
    departmentId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<DepartmentMembershipData>;
  remover(orgId: string, departmentId: string, userId: string): Promise<void>;
  encontrar(
    orgId: string,
    departmentId: string,
    userId: string,
  ): Promise<DepartmentMembershipData | null>;
  listarPorDepartment(orgId: string, departmentId: string): Promise<DepartmentMembershipData[]>;
  listarPorUser(orgId: string, userId: string): Promise<DepartmentMembershipData[]>;
  atualizarRole(
    orgId: string,
    departmentId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<DepartmentMembershipData>;
  contarPorDepartment(orgId: string, departmentId: string): Promise<number>;
}

export class PrismaDepartmentMembershipRepository implements DepartmentMembershipRepository {
  async adicionar(
    orgId: string,
    departmentId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<DepartmentMembershipData> {
    const membership = await prisma.departmentMembership.create({
      data: {
        orgId,
        departmentId,
        userId,
        role,
      },
    });

    return {
      id: membership.id,
      orgId: membership.orgId,
      departmentId: membership.departmentId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async remover(orgId: string, departmentId: string, userId: string): Promise<void> {
    await prisma.departmentMembership.deleteMany({
      where: {
        orgId,
        departmentId,
        userId,
      },
    });
  }

  async encontrar(
    orgId: string,
    departmentId: string,
    userId: string,
  ): Promise<DepartmentMembershipData | null> {
    const membership = await prisma.departmentMembership.findUnique({
      where: {
        unique_department_membership: {
          departmentId,
          userId,
        },
      },
    });

    if (!membership || membership.orgId !== orgId) {
      return null;
    }

    return {
      id: membership.id,
      orgId: membership.orgId,
      departmentId: membership.departmentId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async listarPorDepartment(
    orgId: string,
    departmentId: string,
  ): Promise<DepartmentMembershipData[]> {
    const memberships = await prisma.departmentMembership.findMany({
      where: {
        orgId,
        departmentId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return memberships.map((membership) => ({
      id: membership.id,
      orgId: membership.orgId,
      departmentId: membership.departmentId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async listarPorUser(orgId: string, userId: string): Promise<DepartmentMembershipData[]> {
    const memberships = await prisma.departmentMembership.findMany({
      where: {
        orgId,
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return memberships.map((membership) => ({
      id: membership.id,
      orgId: membership.orgId,
      departmentId: membership.departmentId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async atualizarRole(
    _orgId: string,
    departmentId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<DepartmentMembershipData> {
    const membership = await prisma.departmentMembership.update({
      where: {
        unique_department_membership: {
          departmentId,
          userId,
        },
      },
      data: {
        role,
      },
    });

    return {
      id: membership.id,
      orgId: membership.orgId,
      departmentId: membership.departmentId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async contarPorDepartment(orgId: string, departmentId: string): Promise<number> {
    return prisma.departmentMembership.count({
      where: {
        orgId,
        departmentId,
      },
    });
  }
}
