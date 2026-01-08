import type { Prisma, UserStatus } from "@prisma/client";
import { UnifiedAuditService } from "../../../../core/security/unified-audit.service";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  AuditContext,
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

  async create(input: CreateUserInput, context?: AuditContext): Promise<UserRecord> {
    const user = await prisma.user.create({
      data: {
        id: input.userId,
        email: input.email.toLowerCase(),
        displayName: input.displayName ?? null,
        passwordHash: input.passwordHash,
        status: (input.status ?? "active") as UserStatus,
        avatarUrl: input.avatarUrl ?? null,
        cpf: input.cpf ?? null,
        phone: input.phone ?? null,
        birthDate: input.birthDate ?? null,
        admissionDate: input.admissionDate ?? null,
        observations: input.observations ?? null,
        mustChangePassword: input.mustChangePassword ?? false,
      },
    });

    if (context) {
      await UnifiedAuditService.log("CREATE", {
        entityType: "User",
        entityId: user.id,
        newValue: user,
        context: {
          ...context,
          userId: context.actorId,
        },
      });
    }

    return mapUser(user);
  }

  async setLastLogin(userId: string, date: Date, context?: AuditContext): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: date,
      },
    });
  }

  async update(input: UpdateUserInput, context?: AuditContext): Promise<UserRecord | null> {
    // 1. Obter estado anterior (Immutable Traceability)
    const oldUser = await prisma.user.findUnique({ where: { id: input.userId } });

    const updateData: Prisma.UserUpdateInput = {};

    if (input.email !== undefined) updateData.email = input.email.toLowerCase();
    if (input.displayName !== undefined) updateData.displayName = input.displayName;
    if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;
    if (input.status !== undefined) updateData.status = input.status as UserStatus;
    if (input.passwordHash !== undefined) updateData.passwordHash = input.passwordHash;
    if (input.cpf !== undefined) updateData.cpf = input.cpf;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.birthDate !== undefined) updateData.birthDate = input.birthDate;
    if (input.admissionDate !== undefined) updateData.admissionDate = input.admissionDate;
    if (input.observations !== undefined) updateData.observations = input.observations;
    if (input.mustChangePassword !== undefined)
      updateData.mustChangePassword = input.mustChangePassword;

    const user = await prisma.user.update({
      where: { id: input.userId },
      data: updateData,
    });

    // 2. Logar Auditoria com Diffs (Zero Mocks)
    if (context) {
      await UnifiedAuditService.log("UPDATE", {
        entityType: "User",
        entityId: user.id,
        oldValue: oldUser,
        newValue: user,
        context: {
          ...context,
          userId: context.actorId,
        },
      });
    }

    return mapUser(user);
  }

  async delete(userId: string, context?: AuditContext): Promise<void> {
    // 1. Snapshot antes de deletar
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });

    // 2. Deletar memberships e usuário
    await prisma.organizationMembership.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    // 3. Auditoria
    if (context && oldUser) {
      await UnifiedAuditService.log("DELETE", {
        entityType: "User",
        entityId: userId,
        oldValue: oldUser,
        context: {
          ...context,
          userId: context.actorId,
        },
      });
    }
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
  cpf: string | null;
  phone: string | null;
  birthDate: Date | null;
  admissionDate: Date | null;
  observations: string | null;
  mustChangePassword?: boolean;
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
    cpf: user.cpf ?? undefined,
    phone: user.phone ?? undefined,
    birthDate: user.birthDate ?? undefined,
    admissionDate: user.admissionDate ?? undefined,
    observations: user.observations ?? undefined,
    mustChangePassword: user.mustChangePassword ?? false,
    branchId: user.branchId,
    positionId: user.positionId,
  };
}
