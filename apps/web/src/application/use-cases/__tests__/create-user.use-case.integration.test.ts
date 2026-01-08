import type { CreateUserDTO } from '@/application/dto';
import { PrismaUserRepository } from '@/infrastructure/database/prisma-user.repository';
import { InMemoryEventBus } from '@/infrastructure/events/in-memory-event-bus';
import { ConsoleLogger } from '@/infrastructure/logger/console-logger';
import { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CreateUserUseCase } from '../create-user.use-case';

describe('CreateUserUseCase Integration', () => {
  let prisma: PrismaClient;
  let userRepository: PrismaUserRepository;
  let eventBus: InMemoryEventBus;
  let logger: ConsoleLogger;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    prisma = new PrismaClient();
    userRepository = new PrismaUserRepository(prisma);
    eventBus = new InMemoryEventBus();
    logger = new ConsoleLogger();
    useCase = new CreateUserUseCase(userRepository, eventBus, logger);
  });

  afterEach(async () => {
    // Cleanup: delete test users
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@test-integration.com'
        }
      }
    });
    await prisma.$disconnect();
  });

  it('should create user successfully and emit UserCreated event', async () => {
    // Arrange
    const dto: CreateUserDTO = {
      name: 'Integration Test User',
      email: `test-${Date.now()}@test-integration.com`,
      password: 'SecurePass123!',
      role: 'user'
    };

    let eventEmitted = false;
    eventBus.subscribe('UserCreated', async () => {
      eventEmitted = true;
    });

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.id).toBeDefined();
      expect(result.value.email).toBe(dto.email);
      expect(result.value.name).toBe(dto.name);
      expect(result.value.role).toBe(dto.role);
    }
    expect(eventEmitted).toBe(true);
  });

  it('should fail when email already exists', async () => {
    // Arrange
    const dto: CreateUserDTO = {
      name: 'Duplicate User',
      email: `duplicate-${Date.now()}@test-integration.com`,
      password: 'SecurePass123!',
      role: 'user'
    };

    // Create first user
    await useCase.execute(dto);

    // Act - try to create duplicate
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('email');
    }
  });

  it('should validate email format', async () => {
    // Arrange
    const dto: CreateUserDTO = {
      name: 'Invalid Email User',
      email: 'not-an-email',
      password: 'SecurePass123!',
      role: 'user'
    };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('email');
    }
  });

  it('should handle repository errors gracefully', async () => {
    // Arrange
    const dto: CreateUserDTO = {
      name: 'Error Test User',
      email: `error-${Date.now()}@test-integration.com`,
      password: 'SecurePass123!',
      role: 'user'
    };

    // Disconnect prisma to force error
    await prisma.$disconnect();

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(false);
  });
});
