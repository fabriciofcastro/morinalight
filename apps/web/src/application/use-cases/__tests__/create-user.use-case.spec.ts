import { BusinessRuleError, ValidationError } from '@/domain/errors';
import { None, Some } from '@/shared/kernel/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IEventBus, ILogger, IUserRepository } from '../../ports';
import { CreateUserUseCase } from '../create-user.use-case';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: IUserRepository;
  let mockEventBus: IEventBus;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockUserRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findByEmail: vi.fn().mockResolvedValue(None()),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByRole: vi.fn(),
      delete: vi.fn(),
      existsByEmail: vi.fn(),
    };

    mockEventBus = {
      publish: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(),
    } as any;

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as any;

    useCase = new CreateUserUseCase(mockUserRepository, mockEventBus, mockLogger);
  });

  const validDto = {
    email: 'test@morina.com',
    name: 'Test User',
    password: 'Password123',
    role: 'user' as const,
  };

  it('should successfully create a user', async () => {
    const result = await useCase.execute(validDto);

    if (!result.success) {
      console.error('Failure:', result.error);
    }
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.email).toBe(validDto.email);
      expect(result.value.name).toBe(validDto.name);
      expect(result.value.role).toBe(validDto.role);
    }
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalled();
  });

  it('should return ValidationError if email is invalid', async () => {
    const result = await useCase.execute({ ...validDto, email: 'invalid-email' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it('should return ValidationError if name is too short', async () => {
    const result = await useCase.execute({ ...validDto, name: 'ab' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('at least 3 characters');
    }
  });

  it('should return ValidationError if password is weak', async () => {
    const result = await useCase.execute({ ...validDto, password: '123' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it('should return BusinessRuleError if email already exists', async () => {
    mockUserRepository.findByEmail = vi.fn().mockResolvedValue(Some({ id: '1' } as any));

    const result = await useCase.execute(validDto);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(BusinessRuleError);
      expect(result.error.message).toBe('Email já está em uso');
    }
  });

  it('should return BusinessRuleError if domain is blocked', async () => {
    const result = await useCase.execute({ ...validDto, email: 'test@tempmail.com' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(BusinessRuleError);
      expect(result.error.message).toContain('not allowed for registration');
    }
  });

  it('should handle repository failures gracefully', async () => {
    mockUserRepository.save = vi.fn().mockRejectedValue(new Error('DB Error'));

    const result = await useCase.execute(validDto);

    expect(result.success).toBe(false);
    // Success path within execute should log, performanceMonitor also logs
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
