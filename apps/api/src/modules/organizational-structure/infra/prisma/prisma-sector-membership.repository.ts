import type { OrganizationRole } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

export type SectorMembershipData = {
  id: string;
  orgId: string;
  sectorId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
};

export interface SectorMembershipRepository {
  adicionar(
    orgId: string,
    sectorId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<SectorMembershipData>;
  remover(orgId: string, sectorId: string, userId: string): Promise<void>;
  encontrar(
    orgId: string,
    sectorId: string,
    userId: string,
  ): Promise<SectorMembershipData | null>;
  listarPorSector(orgId: string, sectorId: string): Promise<SectorMembershipData[]>;
  listarPorUser(orgId: string, userId: string): Promise<SectorMembershipData[]>;
  atualizarRole(
    orgId: string,
    sectorId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<SectorMembershipData>;
  contarPorSector(orgId: string, sectorId: string): Promise<number>;
}

export class PrismaSectorMembershipRepository implements SectorMembershipRepository {
  async adicionar(
    orgId: string,
    sectorId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<SectorMembershipData> {
    const membership = await prisma.sectorMembership.upsert({
      where: {
        unique_sector_membership: {
          sectorId,
          userId,
        },
      },
      create: {
        orgId,
        sectorId,
        userId,
        role,
      },
      update: {
        role,
      },
    });

    return {
      id: membership.id,
      orgId: membership.orgId,
      sectorId: membership.sectorId,
      userId: membership.userId,
      role: membership.role,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async remover(orgId: string, sectorId: string, userId: string): Promise<void> {
    await prisma.sectorMembership.deleteMany({
      where: {
        orgId,
        sectorId,
        userId,
      },
    });
  }

  async encontrar(
    orgId: string,
    sectorId: string,
    userId: string,
  ): Promise<SectorMembershipData | null> {
    const membership = await prisma.sectorMembership.findUnique({
      where: {
        unique_sector_membership: {
          sectorId,
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
      sectorId: membership.sectorId,
      userId: membership.userId,
      role: membership.role,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async listarPorSector(orgId: string, sectorId: string): Promise<SectorMembershipData[]> {
    const memberships = await prisma.sectorMembership.findMany({
      where: {
        orgId,
        sectorId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return memberships.map((membership) => ({
      id: membership.id,
      orgId: membership.orgId,
      sectorId: membership.sectorId,
      userId: membership.userId,
      role: membership.role,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async listarPorUser(orgId: string, userId: string): Promise<SectorMembershipData[]> {
    const memberships = await prisma.sectorMembership.findMany({
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
      sectorId: membership.sectorId,
      userId: membership.userId,
      role: membership.role,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async atualizarRole(
    orgId: string,
    sectorId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<SectorMembershipData> {
    const membership = await prisma.sectorMembership.update({
      where: {
        unique_sector_membership: {
          sectorId,
          userId,
        },
      },
      data: {
        role,
      },
    });

    if (membership.orgId !== orgId) {
      throw new Error("Membership não encontrado");
    }

    return {
      id: membership.id,
      orgId: membership.orgId,
      sectorId: membership.sectorId,
      userId: membership.userId,
      role: membership.role,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async contarPorSector(orgId: string, sectorId: string): Promise<number> {
    return prisma.sectorMembership.count({
      where: {
        orgId,
        sectorId,
      },
    });
  }
}

