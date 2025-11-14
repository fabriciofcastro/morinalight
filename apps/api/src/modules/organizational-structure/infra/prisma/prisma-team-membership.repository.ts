import { getPrisma } from "../../../../infra/database/prisma.service";

import type { OrganizationRole } from "../../../organizations/domain/organization";

const prisma = getPrisma();

export type TeamMembershipData = {
  id: string;
  orgId: string;
  teamId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
};

export interface TeamMembershipRepository {
  adicionar(orgId: string, teamId: string, userId: string, role: OrganizationRole): Promise<TeamMembershipData>;
  remover(orgId: string, teamId: string, userId: string): Promise<void>;
  encontrar(orgId: string, teamId: string, userId: string): Promise<TeamMembershipData | null>;
  listarPorTeam(orgId: string, teamId: string): Promise<TeamMembershipData[]>;
  listarPorUser(orgId: string, userId: string): Promise<TeamMembershipData[]>;
  atualizarRole(orgId: string, teamId: string, userId: string, role: OrganizationRole): Promise<TeamMembershipData>;
  contarPorTeam(orgId: string, teamId: string): Promise<number>;
}

export class PrismaTeamMembershipRepository implements TeamMembershipRepository {
  async adicionar(
    orgId: string,
    teamId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<TeamMembershipData> {
    const membership = await prisma.teamMembership.create({
      data: {
        orgId,
        teamId,
        userId,
        role,
      },
    });

    return {
      id: membership.id,
      orgId: membership.orgId,
      teamId: membership.teamId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async remover(orgId: string, teamId: string, userId: string): Promise<void> {
    await prisma.teamMembership.deleteMany({
      where: {
        orgId,
        teamId,
        userId,
      },
    });
  }

  async encontrar(
    orgId: string,
    teamId: string,
    userId: string,
  ): Promise<TeamMembershipData | null> {
    const membership = await prisma.teamMembership.findUnique({
      where: {
        unique_team_membership: {
          teamId,
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
      teamId: membership.teamId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async listarPorTeam(orgId: string, teamId: string): Promise<TeamMembershipData[]> {
    const memberships = await prisma.teamMembership.findMany({
      where: {
        orgId,
        teamId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return memberships.map((membership) => ({
      id: membership.id,
      orgId: membership.orgId,
      teamId: membership.teamId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async listarPorUser(orgId: string, userId: string): Promise<TeamMembershipData[]> {
    const memberships = await prisma.teamMembership.findMany({
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
      teamId: membership.teamId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async atualizarRole(
    orgId: string,
    teamId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<TeamMembershipData> {
    const membership = await prisma.teamMembership.update({
      where: {
        unique_team_membership: {
          teamId,
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
      teamId: membership.teamId,
      userId: membership.userId,
      role: membership.role as OrganizationRole,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  async contarPorTeam(orgId: string, teamId: string): Promise<number> {
    return prisma.teamMembership.count({
      where: {
        orgId,
        teamId,
      },
    });
  }
}

