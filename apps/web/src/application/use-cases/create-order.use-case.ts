import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { OrderEntity } from '@/domain/entities/order.entity';
import { ValidationError } from '@/domain/errors';
import { InventoryService, OrderPricingService } from '@/domain/services';
import { Err, isNone, Ok, Result } from '@/shared/kernel/types';
import { generateUUID } from '@/shared/kernel/utils';
import { createOrderSchema } from '../contracts';
import type { CreateOrderDTO, OrderResponseDTO } from '../dto';
import type { IEventBus, ILogger, IOrderRepository, IProductRepository, IUnitOfWork } from '../ports';

/**
 * CreateOrderUseCase
 * 
 * Caso de uso para criar um novo pedido.
 */
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
    private readonly inventoryService: InventoryService,
    private readonly pricingService: OrderPricingService,
    private readonly uow: IUnitOfWork,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async execute(dto: CreateOrderDTO): Promise<Result<OrderResponseDTO, Error>> {
    const stopProfile = this.logger.profile('CreateOrderUseCase');
    try {
      // 1. Validar entrada
      const validation = createOrderSchema.safeParse(dto);
      if (!validation.success) {
        return Err(new ValidationError(validation.error.message));
      }

      return await this.uow.start(async () => {
        // 2. Buscar produtos envolvidos
        const products = [];
        for (const item of dto.items) {
          const productOpt = await this.productRepository.findById(item.productId);
          if (isNone(productOpt)) {
            return Err(new ValidationError(`Product ${item.productName} not found`, 'productId', item.productId));
          }
          products.push(productOpt);
        }

        // 3. Validar e Reservar estoque via Domain Service
        const inventoryResult = this.inventoryService.validateAndReserveStock(products, dto.items);
        if (!inventoryResult.success) {
          return Err(inventoryResult.error);
        }

        // 4. Salvar produtos atualizados
        for (const updatedProduct of inventoryResult.value) {
          await this.productRepository.save(updatedProduct);
        }

        // 5. Calcular preços via Domain Service
        const orderItems = dto.items.map(item => OrderItemEntity.create({
          ...item,
          id: generateUUID(),
        }));

        const pricing = this.pricingService.calculatePricing({
          items: orderItems,
          shipping: dto.shipping,
          tax: dto.tax,
          discount: dto.discount
        });

        // 6. Criar entidade de domínio (Aggregate Root) com preços calculados
        const orderId = generateUUID();
        const order = OrderEntity.create({
          ...dto,
          id: orderId,
          subtotal: pricing.subtotal.getValue(),
          shipping: pricing.shipping.getValue(),
          tax: pricing.tax.getValue(),
          discount: pricing.discount.getValue(),
          total: pricing.total.getValue(),
        });

        // 7. Persistir pedido
        await this.orderRepository.save(order);

        // 8. Publicar evento via Outbox (Reliable Messaging)
        await this.uow.saveMessage('order.created', {
          orderId: order.id,
          orderNumber: order.orderNumber.getValue(),
          customerId: order.customerId,
          total: order.total.getValue(),
          items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity }))
        });

        this.logger.info('Order created successfully with Domain Services', { orderId: order.id });
        
        return Ok(order.toJSON() as unknown as OrderResponseDTO);
      });
    } catch (error) {
      this.logger.error('Failed to create order', error as Error);
      return Err(error as Error);
    } finally {
      stopProfile();
    }
  }
}
