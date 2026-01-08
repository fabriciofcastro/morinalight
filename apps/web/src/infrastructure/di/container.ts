import { GetUserByIdQuery, ListOrdersQuery, ListUsersQuery } from '@/application/queries';
import { UserEventHandlers } from '@/application/services/user-event-handlers';
import { CancelOrderUseCase, CreateOrderUseCase, CreateProductUseCase, CreateUserUseCase, DeleteProductUseCase, LoginUseCase, LogoutUseCase, UpdateProductUseCase, UpdateUserUseCase } from '@/application/use-cases';
import { InventoryService, OrderPricingService } from '@/domain/services';
import { NextAuthService } from '@/infrastructure/auth/next-auth.service';
import {
  PrismaOrderRepository,
  PrismaOutboxRepository,
  PrismaProductRepository,
  PrismaUnitOfWork,
  PrismaUserRepository
} from '@/infrastructure/database';
import { InMemoryEventBus, OutboxWorker } from '@/infrastructure/events';
import { ConsoleLogger } from '@/infrastructure/logger';
import { PrismaClient } from '@prisma/client';

export class DIContainer {
  private services = new Map<string, unknown>();

  register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service not found in DI container: ${key}`);
    }
    return service as T;
  }

  has(key: string): boolean {
    return this.services.has(key);
  }
}

let containerInstance: DIContainer | null = null;

export function getContainer(): DIContainer {
  if (containerInstance) return containerInstance;

  const container = new DIContainer();

  // Infrastructure
  const prisma = new PrismaClient();
  const eventBus = new InMemoryEventBus();
  const logger = new ConsoleLogger();
  const userRepository = new PrismaUserRepository(prisma);
  const productRepository = new PrismaProductRepository(prisma);
  const orderRepository = new PrismaOrderRepository(prisma);
  const unitOfWork = new PrismaUnitOfWork(prisma);
  const outboxRepository = new PrismaOutboxRepository(prisma);
  const outboxWorker = new OutboxWorker(outboxRepository, eventBus, logger);

  // Services
  const inventoryService = new InventoryService();
  const pricingService = new OrderPricingService();

  // Use Cases
  const createUserUseCase = new CreateUserUseCase(userRepository, eventBus, logger);
  const createProductUseCase = new CreateProductUseCase(productRepository, unitOfWork, eventBus, logger);
  const updateProductUseCase = new UpdateProductUseCase(productRepository, eventBus, logger);
  const deleteProductUseCase = new DeleteProductUseCase(productRepository, eventBus, logger);

  // ... existing code ...

  container.register('CreateUserUseCase', createUserUseCase);
  container.register('CreateProductUseCase', createProductUseCase);
  container.register('UpdateProductUseCase', updateProductUseCase);
  container.register('DeleteProductUseCase', deleteProductUseCase);
  
  const updateUserUseCase = new UpdateUserUseCase(userRepository, eventBus, logger);
  container.register('UpdateUserUseCase', updateUserUseCase);
  const createOrderUseCase = new CreateOrderUseCase(
    orderRepository,
    productRepository,
    inventoryService,
    pricingService,
    unitOfWork,
    eventBus,
    logger
  );
  const cancelOrderUseCase = new CancelOrderUseCase(orderRepository, eventBus, logger);

  // Queries
  const getUserByIdQuery = new GetUserByIdQuery(userRepository);

  // ... existing code ...

  container.register('CreateOrderUseCase', createOrderUseCase);
  container.register('CancelOrderUseCase', cancelOrderUseCase);
  container.register('GetUserByIdQuery', getUserByIdQuery);
  const listUsersQuery = new ListUsersQuery(userRepository);

  // Auth
  const authService = new NextAuthService(); // Note: NextAuthService (client/server stub) doesn't need deps here if using global NextAuth
  const loginUseCase = new LoginUseCase(authService, logger);
  const logoutUseCase = new LogoutUseCase(authService, logger);

  // Registration
  container.register('AuthService', authService);
  container.register('LoginUseCase', loginUseCase);
  container.register('LogoutUseCase', logoutUseCase);

  // Registration
  container.register('Prisma', prisma);
  container.register('EventBus', eventBus);
  container.register('Logger', logger);
  container.register('UserRepository', userRepository);
  container.register('ProductRepository', productRepository);
  container.register('OrderRepository', orderRepository);
  container.register('UnitOfWork', unitOfWork);
  container.register('OutboxRepository', outboxRepository);
  container.register('OutboxWorker', outboxWorker);
  container.register('InventoryService', inventoryService);
  container.register('OrderPricingService', pricingService);
  container.register('CreateUserUseCase', createUserUseCase);
  container.register('CreateProductUseCase', createProductUseCase);
  container.register('CreateOrderUseCase', createOrderUseCase);
  container.register('GetUserByIdQuery', getUserByIdQuery);
  container.register('ListUsersQuery', listUsersQuery);
  
  const listOrdersQuery = new ListOrdersQuery(orderRepository);
  container.register('ListOrdersQuery', listOrdersQuery);

  // Start Background Workers
  if (typeof window === 'undefined') {
    outboxWorker.start();
    const userEventHandlers = new UserEventHandlers(eventBus, logger);
    userEventHandlers.register();
  }

  containerInstance = container;
  return container;
}
