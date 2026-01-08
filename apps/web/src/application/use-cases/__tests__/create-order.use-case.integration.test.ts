import type { CreateOrderDTO } from '@/application/dto';
import { InventoryService } from '@/domain/services/inventory.service';
import { OrderPricingService } from '@/domain/services/order-pricing.service';
import { PrismaOrderRepository } from '@/infrastructure/database/prisma-order.repository';
import { PrismaProductRepository } from '@/infrastructure/database/prisma-product.repository';
import { PrismaUnitOfWork } from '@/infrastructure/database/prisma-unit-of-work';
import { InMemoryEventBus } from '@/infrastructure/events/in-memory-event-bus';
import { ConsoleLogger } from '@/infrastructure/logger/console-logger';
import { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CreateOrderUseCase } from '../create-order.use-case';

describe('CreateOrderUseCase Integration', () => {
  let prisma: PrismaClient;
  let orderRepository: PrismaOrderRepository;
  let productRepository: PrismaProductRepository;
  let uow: PrismaUnitOfWork;
  let eventBus: InMemoryEventBus;
  let logger: ConsoleLogger;
  let inventoryService: InventoryService;
  let pricingService: OrderPricingService;
  let useCase: CreateOrderUseCase;

  beforeEach(() => {
    prisma = new PrismaClient();
    orderRepository = new PrismaOrderRepository(prisma);
    productRepository = new PrismaProductRepository(prisma);
    uow = new PrismaUnitOfWork(prisma);
    eventBus = new InMemoryEventBus();
    logger = new ConsoleLogger();
    inventoryService = new InventoryService();
    pricingService = new OrderPricingService();
    useCase = new CreateOrderUseCase(
      orderRepository,
      productRepository,
      inventoryService,
      pricingService,
      uow,
      eventBus,
      logger
    );
  });

  afterEach(async () => {
    // Cleanup
    await prisma.order.deleteMany({
      where: {
        customerEmail: {
          contains: '@test-order.com'
        }
      }
    });
    await prisma.$disconnect();
  });

  it('should create order successfully', async () => {
    // Arrange
    const dto: CreateOrderDTO = {
      customerId: 'test-customer',
      customerName: 'Test Customer',
      customerEmail: `test-${Date.now()}@test-order.com`,
      paymentMethod: 'credit_card',
      shippingAddress: {
        street: 'Main St',
        number: '123',
        neighborhood: 'Downtown',
        city: 'Gotham',
        state: 'NY',
        zipCode: '12345678',
        country: 'USA'
      },
      billingAddress: {
        street: 'Main St',
        number: '123',
        neighborhood: 'Downtown',
        city: 'Gotham',
        state: 'NY',
        zipCode: '12345678',
        country: 'USA'
      },
      items: []
    };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.id).toBeDefined();
      expect(result.value.customerEmail).toBe(dto.customerEmail);
    }
  });

  it('should validate customer email', async () => {
    // Arrange
    const dto: CreateOrderDTO = {
      customerId: 'test',
      customerName: 'Test',
      customerEmail: 'invalid-email',
      paymentMethod: 'credit_card',
      shippingAddress: {
        street: 'Main St',
        number: '123',
        neighborhood: 'Downtown',
        city: 'Gotham',
        state: 'NY',
        zipCode: '12345678',
        country: 'USA'
      },
      billingAddress: {
        street: 'Main St',
        number: '123',
        neighborhood: 'Downtown',
        city: 'Gotham',
        state: 'NY',
        zipCode: '12345678',
        country: 'USA'
      },
      items: []
    };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(false);
  });
});
