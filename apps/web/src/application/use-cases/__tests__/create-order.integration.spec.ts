import { ValidationError } from '@/domain/errors';
import { InventoryService, OrderPricingService } from '@/domain/services';
import { CreateOrderUseCase } from '../create-order.use-case';

// Constants for UUIDs to pass Zod validation
const validProductId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const validCustomerId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const validItemId = 'a9b8c7d6-e5f4-4321-8765-432109876543';

const validAddress = {
  street: 'Main St',
  number: '123',
  neighborhood: 'Downtown',
  city: 'Gotham',
  state: 'NY',
  zipCode: '12345678',
  country: 'USA'
};

const validItems = [
  { 
    id: validItemId,
    productId: validProductId, 
    productName: 'Product 1', 
    sku: 'SKU-001',
    quantity: 2, 
    unitPrice: 100 
  }
];

// Mock Interfaces
const mockOrderRepo = { save: vi.fn().mockResolvedValue(undefined) };
const mockProductRepo = { 
  findById: vi.fn(), 
  save: vi.fn().mockResolvedValue(undefined) 
};
const mockUow = { 
  start: vi.fn((fn) => fn()), 
  saveMessage: vi.fn().mockResolvedValue(undefined) 
};
const mockEventBus = { publish: vi.fn().mockResolvedValue(undefined) };
const mockLogger = { 
  info: vi.fn(), 
  error: vi.fn(), 
  warn: vi.fn(), 
  debug: vi.fn(),
  profile: vi.fn(() => () => {})
};

describe('CreateOrderUseCase Integration', () => {
  let useCase: CreateOrderUseCase;
  let inventoryService: InventoryService;
  let pricingService: OrderPricingService;

  beforeEach(() => {
    vi.clearAllMocks();
    inventoryService = new InventoryService();
    pricingService = new OrderPricingService();
    useCase = new CreateOrderUseCase(
      mockOrderRepo as any,
      mockProductRepo as any,
      inventoryService,
      pricingService,
      mockUow as any,
      mockEventBus as any,
      mockLogger as any
    );
  });

  const getValidDto = () => ({
    customerId: validCustomerId,
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    paymentMethod: 'credit_card',
    shippingAddress: { ...validAddress },
    billingAddress: { ...validAddress },
    items: [...validItems],
    shipping: 10,
    tax: 5,
    discount: 0
  });

  it('should create an order with correct pricing and update stock', async () => {
    const product = {
      id: validProductId,
      name: { getValue: () => 'Product 1' },
      sku: { getValue: () => 'SKU-001' },
      currentStock: 10,
      removeStock: vi.fn().mockReturnThis(),
      toJSON: () => ({ id: validProductId })
    };

    mockProductRepo.findById.mockResolvedValue({ isNone: () => false, value: product });

    const dto = getValidDto();
    const result = await useCase.execute(dto as any);

    if (!result.success) {
      console.error('Test failed with error:', JSON.stringify(result.error, null, 2));
    }

    expect(result.success).toBe(true);
    expect(mockUow.start).toHaveBeenCalled();
    expect(mockProductRepo.save).toHaveBeenCalled();
    expect(mockUow.saveMessage).toHaveBeenCalled();
  });

  it('should fail if stock is insufficient', async () => {
    const product = {
      id: validProductId,
      name: { getValue: () => 'Product 1' },
      sku: { getValue: () => 'SKU-001' },
      currentStock: 1,
      removeStock: vi.fn(),
      toJSON: () => ({ id: validProductId })
    };

    mockProductRepo.findById.mockResolvedValue({ isNone: () => false, value: product });

    const dto = getValidDto();
    dto.items[0].quantity = 5;

    const result = await useCase.execute(dto as any);

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.message).toContain('Insufficient stock');
  });
});
