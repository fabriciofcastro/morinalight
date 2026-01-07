import { BaseDomainEvent } from './base-domain-event';

/**
 * OrderCreatedEvent
 * 
 * Evento disparado quando um pedido é criado.
 */
export class OrderCreatedEvent extends BaseDomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly total: number,
    public readonly items: Array<{ productId: string; quantity: number }>
  ) {
    super();
  }

  getEventName(): string {
    return 'order.created';
  }

  getPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId,
      orderNumber: this.orderNumber,
      customerId: this.customerId,
      total: this.total,
      items: this.items,
    };
  }
}
