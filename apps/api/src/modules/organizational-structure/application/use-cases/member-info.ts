import type { OrganizationRole } from "@prisma/client";

export type MemberInfo = {
  membershipId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
  user: {
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    status: string;
  };
};
