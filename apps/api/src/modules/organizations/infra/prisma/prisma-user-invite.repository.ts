import type { OrganizationRole } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  UserInviteRecord,
  UserInviteRepository,
} from "../../repositories/user-invite.repository";

const prisma = getPrisma();

export class PrismaUserInviteRepository implements UserInviteRepository {
  async findByToken(token: string): Promise<UserInviteRecord | null> {
    const invite = await prisma.userInvite.findUnique({ where: { token } });
    if (!invite) return null;
    return mapInvite(invite);
  }

  async findById(inviteId: string): Promise<UserInviteRecord | null> {
    const invite = await prisma.userInvite.findUnique({ where: { id: inviteId } });
    if (!invite) return null;
    return mapInvite(invite);
  }

  async markAccepted(inviteId: string, userId: string, acceptedAt: Date): Promise<void> {
    await prisma.userInvite.update({
      where: { id: inviteId },
      data: {
        status: "accepted",
        acceptedUserId: userId,
        acceptedAt,
      },
    });
  }

  async cancel(inviteId: string): Promise<void> {
    await prisma.userInvite.update({
      where: { id: inviteId },
      data: {
        status: "cancelled",
      },
    });
  }

  async listByOrganization(
    organizationId: string,
    filters: { status?: string[] } = {},
  ): Promise<UserInviteRecord[]> {
    const invites = await prisma.userInvite.findMany({
      where: {
        organizationId,
        ...(filters.status?.length ? { status: { in: filters.status } } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return invites.map(mapInvite);
  }

  async findPendingByEmail(
    organizationId: string,
    email: string,
  ): Promise<UserInviteRecord | null> {
    const invite = await prisma.userInvite.findFirst({
      where: {
        organizationId,
        email: email.toLowerCase(),
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return invite ? mapInvite(invite) : null;
  }

  async create(input: {
    inviteId: string;
    organizationId: string;
    email: string;
    role: string;
    token: string;
    invitedById: string;
    expiresAt?: Date | null;
  }): Promise<UserInviteRecord> {
    const invite = await prisma.userInvite.create({
      data: {
        id: input.inviteId,
        organizationId: input.organizationId,
        email: input.email.toLowerCase(),
        role: input.role as OrganizationRole,
        token: input.token,
        invitedById: input.invitedById,
        expiresAt: input.expiresAt ?? null,
      },
    });
    return mapInvite(invite);
  }
}

function mapInvite(invite: {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  token: string;
  invitedById: string;
  status: string;
  expiresAt: Date | null;
  acceptedAt: Date | null;
  acceptedUserId: string | null;
  createdAt: Date;
}): UserInviteRecord {
  return {
    inviteId: invite.id,
    organizationId: invite.organizationId,
    email: invite.email,
    role: invite.role,
    token: invite.token,
    invitedById: invite.invitedById,
    status: invite.status,
    expiresAt: invite.expiresAt,
    acceptedAt: invite.acceptedAt,
    acceptedUserId: invite.acceptedUserId,
    createdAt: invite.createdAt,
  };
}
