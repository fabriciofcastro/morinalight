import { randomUUID } from "node:crypto";

import type {
  UserInviteRecord,
  UserInviteRepository,
} from "../../repositories/user-invite.repository";

export class InMemoryUserInviteRepository implements UserInviteRepository {
  readonly invites = new Map<string, UserInviteRecord>();

  async findByToken(token: string): Promise<UserInviteRecord | null> {
    for (const invite of this.invites.values()) {
      if (invite.token === token) {
        return { ...invite };
      }
    }
    return null;
  }

  async findById(inviteId: string): Promise<UserInviteRecord | null> {
    const invite = this.invites.get(inviteId);
    return invite ? { ...invite } : null;
  }

  async markAccepted(inviteId: string, userId: string, acceptedAt: Date): Promise<void> {
    const invite = this.invites.get(inviteId);
    if (!invite) return;
    this.invites.set(inviteId, {
      ...invite,
      status: "accepted",
      acceptedAt,
      acceptedUserId: userId,
    });
  }

  async cancel(inviteId: string): Promise<void> {
    const invite = this.invites.get(inviteId);
    if (!invite) return;
    this.invites.set(inviteId, {
      ...invite,
      status: "cancelled",
    });
  }

  async listByOrganization(
    organizationId: string,
    filters: { status?: string[] } = {},
  ): Promise<UserInviteRecord[]> {
    const statuses = filters.status?.length ? filters.status : undefined;
    const items = Array.from(this.invites.values()).filter(
      (invite) =>
        invite.organizationId === organizationId && (!statuses || statuses.includes(invite.status)),
    );
    return items.map((item) => ({ ...item }));
  }

  async findPendingByEmail(
    organizationId: string,
    email: string,
  ): Promise<UserInviteRecord | null> {
    const normalizedEmail = email.toLowerCase();
    const invite = Array.from(this.invites.values()).find(
      (item) =>
        item.organizationId === organizationId &&
        item.email === normalizedEmail &&
        item.status === "pending",
    );
    return invite ? { ...invite } : null;
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
    const now = new Date();
    const record: UserInviteRecord = {
      inviteId: input.inviteId ?? randomUUID(),
      organizationId: input.organizationId,
      email: input.email.toLowerCase(),
      role: input.role,
      token: input.token,
      invitedById: input.invitedById,
      status: "pending",
      expiresAt: input.expiresAt ?? null,
      acceptedAt: null,
      acceptedUserId: null,
      createdAt: now,
    };
    this.invites.set(record.inviteId, record);
    return { ...record };
  }

  clear() {
    this.invites.clear();
  }
}
