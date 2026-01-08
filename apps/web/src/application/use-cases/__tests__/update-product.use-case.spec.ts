import { UpdateProductDTO } from '@/application/dto';
import { IProductRepository as ProductRepository } from '@/application/ports';
import { ProductEntity, ProductStatus } from '@/domain/entities';
import { Money, ProductName, SKU } from '@/domain/value-objects';
import { InMemoryEventBus } from '@/infrastructure/events';
import { ConsoleLogger } from '@/infrastructure/logger';
import { None, Some, isErr, isOk } from '@/shared/kernel/types';
import { UpdateProductUseCase } from '../update-product.use-case';

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
const mockProductRepository = {
  save: vi.fn(),
  findById: vi.fn(),
} as unknown as ProductRepository;

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let eventBus: InMemoryEventBus;
  let logger: ConsoleLogger;

  // Helper to create a dummy product
  const createProduct = () => new ProductEntity(
    'prod-123',
    SKU.create('SKU-123'),
    ProductName.create('Original Name'),
    'Original Desc',
    'CAT-1',
    'Brand',
    'UN',
    ProductStatus.ACTIVE,
    Money.create(10),
    Money.create(20),
    5,
    100,
    50,
    undefined,
    new Date(),
    new Date()
  );

  beforeEach(() => {
    vi.clearAllMocks();
    eventBus = new InMemoryEventBus();
    logger = new ConsoleLogger();
    useCase = new UpdateProductUseCase(
      mockProductRepository,
      eventBus,
      logger
    );
  });

  it('should update product name successfully', async () => {
    const product = createProduct();
    (mockProductRepository.findById as any).mockResolvedValue(Some(product));

    const dto: UpdateProductDTO = {
      id: 'prod-123',
      name: 'Updated Name'
    };

    const result = await useCase.execute(dto);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.name).toBe('Updated Name');
      // Verify persistence was called with updated entity
      expect(mockProductRepository.save).toHaveBeenCalled();
      const savedProduct = (mockProductRepository.save as any).mock.calls[0][0] as ProductEntity;
      expect(savedProduct.name.getValue()).toBe('Updated Name');
    }
  });

  it('should return error if product not found', async () => {
    (mockProductRepository.findById as any).mockResolvedValue(None());

    const dto: UpdateProductDTO = { id: 'non-existent' };
    const result = await useCase.execute(dto);

    expect(isErr(result)).toBe(true);
    // @ts-ignore
    if (isErr(result)) expect(result.error.message).toContain('not found');
  });

  it('should validate business rules (e.g. selling price < cost price)', async () => {
    const product = createProduct();
    (mockProductRepository.findById as any).mockResolvedValue(Some(product));

    const dto: UpdateProductDTO = {
       id: 'prod-123',
       sellingPrice: 5 // Less than cost price 10
    };

    try {
        await useCase.execute(dto);
    } catch (e) {
        // Should not throw, should return Result.
    }

    const result = await useCase.execute(dto);
    expect(isErr(result)).toBe(true);
    // @ts-ignore
    if (isErr(result)) expect(result.error.message).toContain('Selling price cannot be less than cost price');
  });
});
