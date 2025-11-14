export type OrganizationMember = {
  organizationId: string;
  userId: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  createdAt: string;
  user?: {
    email: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    status: "pending" | "active" | "suspended" | string;
  };
};

export type OrganizationMemberResponse = {
  itens: OrganizationMember[];
};

export type OrganizationInviteStatus = "pending" | "accepted" | "cancelled";

export type OrganizationInvite = {
  inviteId: string;
  organizationId: string;
  email: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  status: OrganizationInviteStatus;
  expiresAt: string | null;
  invitedById: string;
  createdAt: string;
};

export type OrganizationInviteResponse = {
  itens: OrganizationInvite[];
};

