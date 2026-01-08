import type { IUserRepository } from '@/application/ports';
import { UserEntity } from '@/domain/entities';
import { Email } from '@/domain/value-objects';
import type { Option } from '@/shared/kernel/types';
import { None, Some, isSome } from '@/shared/kernel/types';
import { PrismaClient } from '@prisma/client';

import { BasePrismaRepository } from './base-prisma.repository';

/**
 * Prisma User Repository
 * 
 * Implementação concreta do IUserRepository usando Prisma.
 * Adapta entre domain entities e Prisma models.
 */

export class PrismaUserRepository extends BasePrismaRepository implements IUserRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async save(user: UserEntity): Promise<void> {
    const data = user.toPersistence();

    await this.client.user.upsert({
      where: { id: user.id },
      create: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        // Campos adicionais que podem existir no Prisma schema
        status: data.isActive ? 'active' : 'inactive',
      },
      update: {
        email: data.email,
        name: data.name,
        role: data.role,
        updatedAt: data.updatedAt,
        status: data.isActive ? 'active' : 'inactive',
      },
    });
  }

  async findById(id: string): Promise<Option<UserEntity>> {
    const data = await this.client.user.findUnique({
      where: { id },
    });

    if (!data) {
      return None();
    }

    return Some(this.toDomain(data));
  }

  async findByEmail(email: Email): Promise<Option<UserEntity>> {
    const data = await this.client.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!data) {
      return None();
    }

    return Some(this.toDomain(data));
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.client.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user: any) => this.toDomain(user));
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    const users = await this.client.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user: any) => this.toDomain(user));
  }

  async delete(id: string): Promise<void> {
    await this.client.user.delete({
      where: { id },
    });
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const user = await this.findByEmail(email);
    return isSome(user);
  }

  /**
   * Converte Prisma model para Domain Entity
   */
  private toDomain(data: any): UserEntity {
    return UserEntity.fromPersistence({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isActive: data.status === 'active',
    });
  }
}
