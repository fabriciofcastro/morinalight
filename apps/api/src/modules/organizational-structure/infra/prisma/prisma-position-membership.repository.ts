import type { OrganizationRole } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

export type PositionMembershipData = {
  id: string;
  orgId: string;
  positionId: string;
  userId: string;
  role: OrganizationRole;
  dataInicio: Date | null;
  dataFim: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface PositionMembershipRepository {
  adicionar(
    orgId: string,
    positionId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<PositionMembershipData>;
  remover(orgId: string, positionId: string, userId: string): Promise<void>;
  encontrar(orgId: string, positionId: string, userId: string): Promise<PositionMembershipData | null>;
  listarPorPosition(orgId: string, positionId: string): Promise<PositionMembershipData[]>;
  listarPorUser(orgId: string, userId: string): Promise<PositionMembershipData[]>;
  atualizarRole(
    orgId: string,
    positionId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<PositionMembershipData>;
  contarPorPosition(orgId: string, positionId: string): Promise<number>;
}

export class PrismaPositionMembershipRepository implements PositionMembershipRepository {
  async adicionar(
    orgId: string,
    positionId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<PositionMembershipData> {
    const membership = await prisma.positionMembership.upsert({
      where: {
        unique_position_membership: {
          positionId,
          userId,
        },
      },
      create: {
        orgId,
        positionId,
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
      positionId: membership.positionId,
      userId: membership.userId,
      role: membership.role,
      dataInicio: membership.dataInicio,
      dataFim: membership.dataFim,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async remover(orgId: string, positionId: string, userId: string): Promise<void> {
    await prisma.positionMembership.deleteMany({
      where: {
        orgId,
        positionId,
        userId,
      },
    });
  }

  async encontrar(
    orgId: string,
    positionId: string,
    userId: string,
  ): Promise<PositionMembershipData | null> {
    const membership = await prisma.positionMembership.findUnique({
      where: {
        unique_position_membership: {
          positionId,
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
      positionId: membership.positionId,
      userId: membership.userId,
      role: membership.role,
      dataInicio: membership.dataInicio,
      dataFim: membership.dataFim,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async listarPorPosition(orgId: string, positionId: string): Promise<PositionMembershipData[]> {
    const memberships = await prisma.positionMembership.findMany({
      where: {
        orgId,
        positionId,
        dataFim: null, // Apenas membros ativos (sem dataFim)
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return memberships.map((membership) => ({
      id: membership.id,
      orgId: membership.orgId,
      positionId: membership.positionId,
      userId: membership.userId,
      role: membership.role,
      dataInicio: membership.dataInicio,
      dataFim: membership.dataFim,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async listarPorUser(orgId: string, userId: string): Promise<PositionMembershipData[]> {
    const memberships = await prisma.positionMembership.findMany({
      where: {
        orgId,
        userId,
        dataFim: null, // Apenas cargos ativos (sem dataFim)
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return memberships.map((membership) => ({
      id: membership.id,
      orgId: membership.orgId,
      positionId: membership.positionId,
      userId: membership.userId,
      role: membership.role,
      dataInicio: membership.dataInicio,
      dataFim: membership.dataFim,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async atualizarRole(
    orgId: string,
    positionId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<PositionMembershipData> {
    const membership = await prisma.positionMembership.update({
      where: {
        unique_position_membership: {
          positionId,
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
      positionId: membership.positionId,
      userId: membership.userId,
      role: membership.role,
      dataInicio: membership.dataInicio,
      dataFim: membership.dataFim,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async contarPorPosition(orgId: string, positionId: string): Promise<number> {
    return prisma.positionMembership.count({
      where: {
        orgId,
        positionId,
        dataFim: null, // Apenas membros ativos
      },
    });
  }
}

