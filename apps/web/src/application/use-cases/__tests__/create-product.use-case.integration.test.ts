import type { CreateProductDTO } from '@/application/dto';
import { PrismaProductRepository } from '@/infrastructure/database/prisma-product.repository';
import { PrismaUnitOfWork } from '@/infrastructure/database/prisma-unit-of-work';
import { InMemoryEventBus } from '@/infrastructure/events/in-memory-event-bus';
import { ConsoleLogger } from '@/infrastructure/logger/console-logger';
import { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CreateProductUseCase } from '../create-product.use-case';

describe('CreateProductUseCase Integration', () => {
  let prisma: PrismaClient;
  let productRepository: PrismaProductRepository;
  let uow: PrismaUnitOfWork;
  let eventBus: InMemoryEventBus;
  let logger: ConsoleLogger;
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    prisma = new PrismaClient();
    productRepository = new PrismaProductRepository(prisma);
    uow = new PrismaUnitOfWork(prisma);
    eventBus = new InMemoryEventBus();
    logger = new ConsoleLogger();
    useCase = new CreateProductUseCase(productRepository, uow, eventBus, logger);
  });

  afterEach(async () => {
    // Cleanup: delete test products
    await prisma.product.deleteMany({
      where: {
        name: {
          contains: 'Test Product'
        }
      }
    });
    await prisma.$disconnect();
  });

  it('should create product successfully', async () => {
    // Arrange
    const dto: CreateProductDTO = {
      name: `Test Product ${Date.now()}`,
      description: 'Integration test product',
      sellingPrice: 99.99,
      costPrice: 50.00,
      sku: `TEST-SKU-${Date.now()}`,
      unit: 'un',
      categoryId: 'default',
      currentStock: 100
    };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.id).toBeDefined();
      expect(result.value.name).toBe(dto.name);
      expect(result.value.sellingPrice).toBe(dto.sellingPrice);
    }
  });

  it('should validate required fields', async () => {
    // Arrange
    const dto: any = {
      description: 'Missing required fields'
    };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(false);
  });

  it('should validate price is positive', async () => {
    // Arrange
    const dto: CreateProductDTO = {
      name: 'Invalid Price Product',
      sellingPrice: -10,
      costPrice: 5,
      sku: `INVALID-${Date.now()}`,
      unit: 'un',
      categoryId: 'default'
    };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('sellingPrice');
    }
  });
});
