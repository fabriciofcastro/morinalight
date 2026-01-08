import { CreateUserUseCase } from '@/application/use-cases';
import { getContainer } from '@/infrastructure/di/container';
import { Ok } from '@/shared/kernel/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUserAction } from '../create-user.action';

// Mock container and dependencies
vi.mock('@/infrastructure/di/container', () => ({
  getContainer: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

const mockExecute = vi.fn();
const mockUseCase = {
  execute: mockExecute,
} as unknown as CreateUserUseCase;

const mockContainer = {
  resolve: vi.fn(),
};

describe('createUserAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getContainer as any).mockReturnValue(mockContainer);
    mockContainer.resolve.mockReturnValue(mockUseCase);
  });

  it('should call use case and return success', async () => {
    const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
    };

    mockExecute.mockResolvedValue(Ok({
        id: 'user-123',
        email: 'john@example.com'
    }));

    const result = await createUserAction(null, dto as any);

    expect(mockContainer.resolve).toHaveBeenCalledWith('CreateUserUseCase');
    expect(mockExecute).toHaveBeenCalledWith(dto);
    expect(result.success).toBe(true);
  });

  it('should handle FormData', async () => {
    const formData = new FormData();
    formData.append('name', 'Jane Doe');
    formData.append('email', 'jane@example.com');
    formData.append('password', 'secret');
    formData.append('role', 'ADMIN');

    mockExecute.mockResolvedValue(Ok({}));

    await createUserAction(null, formData);

    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'ADMIN',
    }));
  });
});
