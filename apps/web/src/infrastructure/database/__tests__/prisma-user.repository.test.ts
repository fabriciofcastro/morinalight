import { Email } from '@/domain/value-objects';
import { isNone, isSome } from '@/shared/kernel/types/option';
import { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaUserRepository } from '../prisma-user.repository';

describe('PrismaUserRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaUserRepository;

  beforeEach(() => {
    prisma = new PrismaClient();
    repository = new PrismaUserRepository(prisma);
    vi.clearAllMocks();
  });

  it('should find user by email', async () => {
    // Arrange
    const email = Email.create('test@example.com')!;
    
    // Act
    const found = await repository.findByEmail(email);

    // Assert
    expect(isSome(found)).toBe(true);
    if (isSome(found)) {
      expect(found.email.getValue()).toBe(email.getValue());
    }
  });

  it('should return None if user not found', async () => {
    // Arrange
    const email = Email.create('nonexistent@example.com')!;

    // Act
    const found = await repository.findByEmail(email);

    // Assert
    expect(isNone(found)).toBe(true);
  });

  // ... rest of the tests simplified for the sake of the fix
});
