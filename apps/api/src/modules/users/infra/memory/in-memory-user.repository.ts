import { randomUUID } from "node:crypto";

import type {
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

  async create(input: CreateUserInput): Promise<UserRecord> {
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

  async setLastLogin(userId: string, date: Date): Promise<void> {
    const existing = this.users.get(userId);
    if (existing) {
      this.users.set(userId, { ...existing, lastLoginAt: date, updatedAt: date });
    }
  }

  async update(input: UpdateUserInput): Promise<UserRecord | null> {
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

    this.users.set(input.userId, updated);
    return { ...updated };
  }

  async delete(userId: string): Promise<void> {
    this.users.delete(userId);
  }
}
