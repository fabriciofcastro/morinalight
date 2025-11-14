export type UserInviteRecord = {
  inviteId: string;
  organizationId: string;
  email: string;
  role: string;
  token: string;
  status: string;
  expiresAt: Date | null;
  invitedById: string;
  acceptedAt: Date | null;
  acceptedUserId: string | null;
  createdAt: Date;
};

export interface UserInviteRepository {
  findByToken(token: string): Promise<UserInviteRecord | null>;
  findById(inviteId: string): Promise<UserInviteRecord | null>;
  markAccepted(inviteId: string, userId: string, acceptedAt: Date): Promise<void>;
  cancel(inviteId: string): Promise<void>;
  listByOrganization(
    organizationId: string,
    filters?: { status?: string[] },
  ): Promise<UserInviteRecord[]>;
  findPendingByEmail?(organizationId: string, email: string): Promise<UserInviteRecord | null>;
  create?(input: {
    inviteId: string;
    organizationId: string;
    email: string;
    role: string;
    token: string;
    invitedById: string;
    expiresAt?: Date | null;
  }): Promise<UserInviteRecord>;
}
