import { Credentials } from '@/domain/value-objects/credentials';
import { Email } from '@/domain/value-objects/email';
import { describe, expect, it, vi } from 'vitest';
import { CustomAuthService } from '../custom-auth.service';

// Mock authApi
vi.mock('@/lib/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn()
  }
}));

import { authApi } from '@/lib/api/auth';

describe('CustomAuthService', () => {
  let service: CustomAuthService;

  beforeEach(() => {
    service = new CustomAuthService();
    vi.clearAllMocks();
  });

  it('should login successfully', async () => {
    // Arrange
    const email = Email.create('test@example.com');
    const credentials = Credentials.create('test@example.com', 'password123');
    
    vi.mocked(authApi.login).mockResolvedValue({
      user: {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user'
      },
      requiresTwoFactor: false
    });

    // Act
    const result = await service.login(credentials);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.email).toBe('test@example.com');
      expect(result.value.name).toBe('Test User');
    }
  });

  it('should handle login errors', async () => {
    // Arrange
    const credentials = Credentials.create('test@example.com', 'wrongpassword');
    
    vi.mocked(authApi.login).mockRejectedValue({
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    });

    // Act
    const result = await service.login(credentials);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Invalid credentials');
    }
  });

  it('should logout successfully', async () => {
    // Arrange
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    // Act
    const result = await service.logout();

    // Assert
    expect(result.success).toBe(true);
    expect(authApi.logout).toHaveBeenCalled();
  });
});
