import { CreateProductUseCase } from '@/application/use-cases';
import { getContainer } from '@/infrastructure/di/container';
import { Err, Ok } from '@/shared/kernel/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProductAction } from '../create-product.action';

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
} as unknown as CreateProductUseCase;

const mockContainer = {
  resolve: vi.fn(),
};

describe('createProductAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getContainer as any).mockReturnValue(mockContainer);
    mockContainer.resolve.mockReturnValue(mockUseCase);
  });

  it('should call use case and return success on valid input', async () => {
    const dto = {
      sku: 'TEST-SKU',
      name: 'Test Product',
      categoryId: 'CAT-1',
      costPrice: 50,
      sellingPrice: 100,
      unit: 'UN',
    };

    mockExecute.mockResolvedValue(Ok({
      id: 'prod-123',
      sku: 'TEST-SKU',
      name: 'Test Product'
    }));

    const result = await createProductAction(null, dto as any);

    expect(mockContainer.resolve).toHaveBeenCalledWith('CreateProductUseCase');
    expect(mockExecute).toHaveBeenCalledWith(dto);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should return error on use case failure', async () => {
    const dto = {
      sku: 'TEST-SKU',
    };

    mockExecute.mockResolvedValue(Err(new Error('Validation failed')));

    const result = await createProductAction(null, dto as any);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Validation failed');
  });

  it('should handle FormData input correctly', async () => {
    const formData = new FormData();
    formData.append('sku', 'FORM-SKU');
    formData.append('name', 'Form Product');
    formData.append('categoryId', 'CAT-FORM');
    formData.append('costPrice', '10.5');
    formData.append('sellingPrice', '20.0');
    formData.append('unit', 'KG');

    mockExecute.mockResolvedValue(Ok({}));

    await createProductAction(null, formData);

    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({
      sku: 'FORM-SKU',
      costPrice: 10.5,
      sellingPrice: 20.0,
    }));
  });
});
