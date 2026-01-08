import type { LoginDTO } from '@/application/dto';
import { CustomAuthService } from '@/infrastructure/auth/custom-auth.service';
import { ConsoleLogger } from '@/infrastructure/logger/console-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { LoginUseCase } from '../login.use-case';

describe('LoginUseCase Integration', () => {
  let authService: CustomAuthService;
  let logger: ConsoleLogger;
  let useCase: LoginUseCase;

  beforeEach(() => {
    authService = new CustomAuthService();
    logger = new ConsoleLogger();
    useCase = new LoginUseCase(authService, logger);
  });

  it('should validate email format', async () => {
    // Arrange
    const dto: LoginDTO = {
      email: 'invalid-email',
      password: 'password123'
    };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('email');
    }
  });

  it('should validate password is provided', async () => {
    // Arrange
    const dto: LoginDTO = {
      email: 'test@example.com',
      password: ''
    };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(false);
  });

  it('should handle authentication errors', async () => {
    // Arrange
    const dto: LoginDTO = {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(false);
  });
});
