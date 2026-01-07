import { UserEntity } from '@/domain/entities';
import { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaUserRepository } from '../prisma-user.repository';

describe('PrismaUserRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaUserRepository;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        upsert: vi.fn(),
      },
    } as unknown as PrismaClient;
    repository = new PrismaUserRepository(prisma);
  });

  it('should find a user by email', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test', role: 'user', status: 'active' };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    const result = await repository.findByEmail({ getValue: () => 'test@example.com' } as any);

    expect(result).not.toBeNull();
    expect(prisma.user.findUnique).toHaveBeenCalled();
  });

  it('should save a user', async () => {
    const user = UserEntity.create({
      id: '2',
      email: 'new@example.com',
      name: 'New',
    });
    vi.mocked(prisma.user.upsert).mockResolvedValue({} as any);

    await repository.save(user);

    expect(prisma.user.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: '2' },
    }));
  });
});
