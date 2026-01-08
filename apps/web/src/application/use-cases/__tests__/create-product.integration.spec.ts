import { CreateProductDTO } from '@/application/dto';
import { IProductRepository, IUnitOfWork } from '@/application/ports';
import { ProductEntity } from '@/domain/entities';
import { InMemoryEventBus } from '@/infrastructure/events';
import { ConsoleLogger } from '@/infrastructure/logger';
import { isErr, isOk } from '@/shared/kernel/types/result';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateProductUseCase } from '../create-product.use-case';

// Mock mocks
const mockProductRepository = {
  save: vi.fn(),
  findBySku: vi.fn().mockResolvedValue(null),
} as unknown as IProductRepository;

const mockUnitOfWork = {
  start: vi.fn((callback) => callback(mockUnitOfWork)),
  commit: vi.fn(),
  rollback: vi.fn(),
  saveMessage: vi.fn(),
} as unknown as IUnitOfWork;

describe('CreateProductUseCase Integration', () => {
  let useCase: CreateProductUseCase;
  let eventBus: InMemoryEventBus;
  let logger: ConsoleLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    eventBus = new InMemoryEventBus();
    logger = new ConsoleLogger();
    useCase = new CreateProductUseCase(
      mockProductRepository,
      mockUnitOfWork,
      eventBus,
      logger
    );
  });

  it('should create a product successfully', async () => {
    const dto: CreateProductDTO = {
      sku: 'SKU-123',
      name: 'Test Product',
      categoryId: 'CAT-1',
      costPrice: 10,
      sellingPrice: 20,
      unit: 'UN',
      status: 'ACTIVE'
    };

    const result = await useCase.execute(dto);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.sku).toBe(dto.sku);
      expect(result.value.id).toBeDefined();
    }

    expect(mockProductRepository.save).toHaveBeenCalled();
    expect(mockUnitOfWork.saveMessage).toHaveBeenCalledWith(
      'product.created',
      expect.objectContaining({
        sku: dto.sku,
      })
    );
  });

  it('should fail if SKU already exists', async () => {
    vi.mocked(mockProductRepository.findBySku).mockResolvedValueOnce({} as ProductEntity);

    const dto: CreateProductDTO = {
      sku: 'SKU-EXISTING',
      name: 'Test Product',
      categoryId: 'CAT-1',
      costPrice: 10,
      sellingPrice: 20,
      unit: 'UN',
    };

    const result = await useCase.execute(dto);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toContain('already exists');
    }
  });
});
