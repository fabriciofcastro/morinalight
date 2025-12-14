import type { Prisma, UserStatus } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserRecord,
  UserRepository,
} from "../../repositories/user.repository";

const prisma = getPrisma();

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return null;
    return mapUser(user);
  }

  async findById(userId: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;
    return mapUser(user);
  }

  async findManyByIds(userIds: string[]): Promise<UserRecord[]> {
    if (userIds.length === 0) return [];
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
    return users.map(mapUser);
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const user = await prisma.user.create({
      data: {
        id: input.userId,
        email: input.email.toLowerCase(),
        displayName: input.displayName ?? null,
        passwordHash: input.passwordHash,
        status: (input.status ?? "active") as UserStatus,
      },
    });
    return mapUser(user);
  }

  async setLastLogin(userId: string, date: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: date,
      },
    });
  }

  async update(input: UpdateUserInput): Promise<UserRecord | null> {
    const updateData: Prisma.UserUpdateInput = {};

    if (input.email !== undefined) updateData.email = input.email.toLowerCase();
    if (input.displayName !== undefined) updateData.displayName = input.displayName;
    if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;
    if (input.status !== undefined) updateData.status = input.status as UserStatus;
    if (input.passwordHash !== undefined) updateData.passwordHash = input.passwordHash;

    const user = await prisma.user.update({
      where: { id: input.userId },
      data: updateData,
    });

    return mapUser(user);
  }

  async delete(userId: string): Promise<void> {
    // Deletar memberships primeiro
    await prisma.organizationMembership.deleteMany({
      where: { userId },
    });

    // Deletar usuário
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}

function mapUser(user: {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  passwordHash: string | null;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  branchId: string | null;
  positionId: string | null;
}): UserRecord {
  if (!user.passwordHash) {
    throw new Error("User passwordHash is required");
  }
  return {
    userId: user.id,
    email: user.email,
    displayName: user.displayName ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    passwordHash: user.passwordHash,
    status: user.status,
    lastLoginAt: user.lastLoginAt ?? undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
