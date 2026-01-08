import { randomUUID } from "node:crypto";

import type {
  AuditContext,
  CreateUserInput,
  UpdateUserInput,
  UserRecord,
  UserRepository,
} from "../../repositories/user.repository";

export class InMemoryUserRepository implements UserRepository {
  public readonly users: Map<string, UserRecord> = new Map();

  async findByEmail(email: string): Promise<UserRecord | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return { ...user };
      }
    }
    return null;
  }

  async findById(userId: string): Promise<UserRecord | null> {
    const user = this.users.get(userId);
    return user ? { ...user } : null;
  }

  async findManyByIds(userIds: string[]): Promise<UserRecord[]> {
    if (!userIds.length) return [];
    const set = new Set(userIds);
    return Array.from(this.users.values())
      .filter((user) => set.has(user.userId))
      .map((user) => ({ ...user }));
  }

  async create(input: CreateUserInput, context?: AuditContext): Promise<UserRecord> {
    const now = new Date();
    const record: UserRecord = {
      userId: input.userId ?? randomUUID(),
      email: input.email,
      displayName: input.displayName ?? null,
      avatarUrl: null,
      passwordHash: input.passwordHash,
      status: input.status ?? "active",
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(record.userId, record);
    return { ...record };
  }

  async setLastLogin(userId: string, date: Date, context?: AuditContext): Promise<void> {
    const existing = this.users.get(userId);
    if (existing) {
      this.users.set(userId, { ...existing, lastLoginAt: date, updatedAt: date });
    }
  }

  async update(input: UpdateUserInput, context?: AuditContext): Promise<UserRecord | null> {
    const existing = this.users.get(input.userId);
    if (!existing) return null;

    const updated: UserRecord = {
      ...existing,
      updatedAt: new Date(),
    };

    if (input.email !== undefined) updated.email = input.email.toLowerCase();
    if (input.displayName !== undefined) updated.displayName = input.displayName;
    if (input.avatarUrl !== undefined) updated.avatarUrl = input.avatarUrl;
    if (input.status !== undefined) updated.status = input.status;
    if (input.passwordHash !== undefined) updated.passwordHash = input.passwordHash;
    if (input.cpf !== undefined) updated.cpf = input.cpf;
    if (input.phone !== undefined) updated.phone = input.phone;
    if (input.birthDate !== undefined) updated.birthDate = input.birthDate;
    if (input.admissionDate !== undefined) updated.admissionDate = input.admissionDate;
    if (input.observations !== undefined) updated.observations = input.observations;

    this.users.set(input.userId, updated);
    return { ...updated };
  }

  async delete(userId: string, context?: AuditContext): Promise<void> {
    this.users.delete(userId);
  }
}
