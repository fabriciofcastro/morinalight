import { BusinessRuleError, ValidationError } from '@/domain/errors';
import { isOk, None, Some } from '@/shared/kernel/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IEventBus } from '../../ports/event-bus.port';
import { ILogger } from '../../ports/logger.port';
import { IUserRepository } from '../../ports/user-repository.port';
import { CreateUserUseCase } from '../create-user.use-case';

describe('CreateUserUseCase Integration (Mocked)', () => {
  let userRepository: IUserRepository;
  let eventBus: IEventBus;
  let logger: ILogger;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByRole: vi.fn(),
      delete: vi.fn(),
      existsByEmail: vi.fn(),
    };
    eventBus = {
      publish: vi.fn(),
      subscribe: vi.fn(),
    };
    logger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      profile: vi.fn(() => vi.fn()),
    };
    useCase = new CreateUserUseCase(userRepository, eventBus, logger);
  });

  it('should create a user successfully and publish event', async () => {
    const input = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      password: 'Password123',
    };

    vi.mocked(userRepository.findByEmail).mockResolvedValue(None());
    vi.mocked(userRepository.save).mockResolvedValue();

    const result = await useCase.execute(input);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.email).toBe(input.email);
      expect(userRepository.save).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalled();
    }
  });

  it('should fail if user already exists', async () => {
    const input = {
      email: 'existing@example.com',
      name: 'Existing',
      password: 'Password123',
    };

    vi.mocked(userRepository.findByEmail).mockResolvedValue(Some({ id: '1' } as any));

    const result = await useCase.execute(input);

    expect(isOk(result)).toBe(false);
    if (!isOk(result)) {
      expect(result.error).toBeInstanceOf(BusinessRuleError);
      expect(result.error.message).toBe('A user with this email already exists');
    }
  });

  it('should fail with invalid email format', async () => {
    const input = {
      email: 'invalid-email',
      name: 'Invalid',
      password: 'Password123',
    };

    const result = await useCase.execute(input as any);

    expect(isOk(result)).toBe(false);
    if (!isOk(result)) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe('Invalid email format');
    }
  });

  it('should fail with invalid password', async () => {
    const input = {
      email: 'valid@example.com',
      name: 'Valid Name',
      password: 'short',
    };

    const result = await useCase.execute(input as any);

    expect(isOk(result)).toBe(false);
    if (!isOk(result)) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe('Password must be at least 8 characters');
    }
  });
});
