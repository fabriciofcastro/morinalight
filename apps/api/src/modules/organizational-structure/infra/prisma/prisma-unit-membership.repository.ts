import { getPrisma } from "../../../../infra/database/prisma.service";

import type { OrganizationRole } from "../../../organizations/domain/organization";

const prisma = getPrisma();

export type UnitMembershipData = {
  id: string;
  orgId: string;
  unitId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
};

export interface UnitMembershipRepository {
  adicionar(orgId: string, unitId: string, userId: string, role: OrganizationRole): Promise<UnitMembershipData>;
  remover(orgId: string, unitId: string, userId: string): Promise<void>;
  encontrar(orgId: string, unitId: string, userId: string): Promise<UnitMembershipData | null>;
  listarPorUnit(orgId: string, unitId: string): Promise<UnitMembershipData[]>;
  listarPorUser(orgId: string, userId: string): Promise<UnitMembershipData[]>;
  atualizarRole(orgId: string, unitId: string, userId: string, role: OrganizationRole): Promise<UnitMembershipData>;
  contarPorUnit(orgId: string, unitId: string): Promise<number>;
}

export class PrismaUnitMembershipRepository implements UnitMembershipRepository {
  async adicionar(
    orgId: string,
    unitId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<UnitMembershipData> {
    const membership = await prisma.unitMembership.create({
      data: {
        orgId,
        unitId,
        userId,
        role,
      },
    });

    return {
      id: membership.id,
      orgId: membership.orgId,
      unitId: membership.unitId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async remover(orgId: string, unitId: string, userId: string): Promise<void> {
    await prisma.unitMembership.deleteMany({
      where: {
        orgId,
        unitId,
        userId,
      },
    });
  }

  async encontrar(
    orgId: string,
    unitId: string,
    userId: string,
  ): Promise<UnitMembershipData | null> {
    const membership = await prisma.unitMembership.findUnique({
      where: {
        unique_unit_membership: {
          unitId,
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
      unitId: membership.unitId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async listarPorUnit(orgId: string, unitId: string): Promise<UnitMembershipData[]> {
    const memberships = await prisma.unitMembership.findMany({
      where: {
        orgId,
        unitId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return memberships.map((membership) => ({
      id: membership.id,
      orgId: membership.orgId,
      unitId: membership.unitId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async listarPorUser(orgId: string, userId: string): Promise<UnitMembershipData[]> {
    const memberships = await prisma.unitMembership.findMany({
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
      unitId: membership.unitId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async atualizarRole(
    orgId: string,
    unitId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<UnitMembershipData> {
    const membership = await prisma.unitMembership.update({
      where: {
        unique_unit_membership: {
          unitId,
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
      unitId: membership.unitId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async contarPorUnit(orgId: string, unitId: string): Promise<number> {
    return prisma.unitMembership.count({
      where: {
        orgId,
        unitId,
      },
    });
  }
}

