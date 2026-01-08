import { ProductEntity } from '@/domain/entities';
import { InventoryService, OrderPricingService } from '@/domain/services';
import { Some } from '@/shared/kernel/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateOrderDTO } from '../../dto';
import { IEventBus, ILogger, IOrderRepository, IProductRepository, IUnitOfWork } from '../../ports';
import { CreateOrderUseCase } from '../create-order.use-case';

describe('CreateOrderUseCase Integration (with UoW)', () => {
  let useCase: CreateOrderUseCase;
  let mockOrderRepository: IOrderRepository;
  let mockProductRepository: IProductRepository;
  let mockInventoryService: InventoryService;
  let mockPricingService: OrderPricingService;
  let mockUow: IUnitOfWork;
  let mockEventBus: IEventBus;
  let mockLogger: ILogger;

  const mockProduct = ProductEntity.fromPersistence({
    id: 'prod-1',
    name: 'Test Product',
    sku: 'SKU-001',
    sellingPrice: 100,
    currentStock: 10,
    status: 'ACTIVE',
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  beforeEach(() => {
    mockOrderRepository = { save: vi.fn(), findById: vi.fn() } as any;
    mockProductRepository = { findById: vi.fn().mockResolvedValue(Some(mockProduct)), save: vi.fn() } as any;
    
    // Mock Services
    mockInventoryService = { validateAndReserveStock: vi.fn().mockReturnValue({ success: true, value: [mockProduct] }) } as any;
    mockPricingService = { 
      calculatePricing: vi.fn().mockReturnValue({
        subtotal: { getValue: () => 100 },
        shipping: { getValue: () => 10 },
        tax: { getValue: () => 0 },
        discount: { getValue: () => 0 },
        total: { getValue: () => 110 },
      }) 
    } as any;

    // Real-like UoW Mock that executes the callback
    mockUow = {
      start: vi.fn().mockImplementation(async (callback) => await callback(mockUow)),
      saveMessage: vi.fn(),
      getTransaction: vi.fn(),
    } as any;

    mockEventBus = { publish: vi.fn() } as any;
    mockLogger = { 
      profile: vi.fn().mockReturnValue(() => {}), 
      info: vi.fn(), 
      error: vi.fn() 
    } as any;

    useCase = new CreateOrderUseCase(
      mockOrderRepository,
      mockProductRepository,
      mockInventoryService,
      mockPricingService,
      mockUow,
      mockEventBus,
      mockLogger
    );
  });

  it('should successfully create an order within UoW transaction', async () => {
    const validUuid1 = '123e4567-e89b-12d3-a456-426614174000';
    const validUuid2 = '123e4567-e89b-12d3-a456-426614174001';
    const validUuid3 = '123e4567-e89b-12d3-a456-426614174002';

    const address = {
        street: 'Main St',
        number: '123',
        neighborhood: 'Downtown',
        city: 'Metropolis',
        state: 'SP',
        zipCode: '12345-678',
        country: 'Brazil',
    };

    const dto: CreateOrderDTO = {
      customerId: validUuid1,
      customerName: 'Customer Test',
      customerEmail: 'test@example.com',
      paymentMethod: 'credit_card',
      items: [{ 
          id: validUuid3,
          productId: validUuid2, 
          quantity: 1, 
          productName: 'Test', 
          sku: 'SKU-001',
          unitPrice: 100,
          discount: 0
      }],
      shippingAddress: address,
      billingAddress: address,
      shipping: 10,
      tax: 0,
      discount: 0,
    };

    const result = await useCase.execute(dto);

    if (!result.success) {
        console.error('Test failed with:', JSON.stringify(result.error, null, 2));
    }
    expect(result.success).toBe(true);
    expect(mockUow.start).toHaveBeenCalled();
    expect(mockInventoryService.validateAndReserveStock).toHaveBeenCalled();
    expect(mockProductRepository.save).toHaveBeenCalled();
    expect(mockOrderRepository.save).toHaveBeenCalled();
    expect(mockUow.saveMessage).toHaveBeenCalledWith('order.created', expect.any(Object));
  });

  it('should not commit order if inventory check fails', async () => {
    mockInventoryService.validateAndReserveStock = vi.fn().mockReturnValue({ success: false, error: new Error('Stock error') });

    const validUuid1 = '123e4567-e89b-12d3-a456-426614174000';
    const validUuid2 = '123e4567-e89b-12d3-a456-426614174001';
    const validUuid3 = '123e4567-e89b-12d3-a456-426614174002';
    
    const address = {
        street: 'Main St',
        number: '123',
        neighborhood: 'Downtown',
        city: 'Metropolis',
        state: 'SP',
        zipCode: '12345-678',
        country: 'Brazil',
    };

    const dto: CreateOrderDTO = {
        customerId: validUuid1,
        customerName: 'Customer Test',
        customerEmail: 'test@example.com',
        paymentMethod: 'credit_card',
        items: [{ 
            id: validUuid3,
            productId: validUuid2, 
            quantity: 100, 
            productName: 'Test', 
            sku: 'SKU-001',
            unitPrice: 100 
        }],
        shippingAddress: address,
        billingAddress: address,
        shipping: 0,
        tax: 0,
        discount: 0,
    };

    const result = await useCase.execute(dto);

    expect(result.success).toBe(false);
    expect(mockUow.start).toHaveBeenCalled();
    expect(mockOrderRepository.save).not.toHaveBeenCalled(); 
    expect(mockUow.saveMessage).not.toHaveBeenCalled();
  });
});
