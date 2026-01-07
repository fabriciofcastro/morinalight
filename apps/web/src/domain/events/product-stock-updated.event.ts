import { BaseDomainEvent } from './base-domain-event';

/**
 * ProductStockUpdatedEvent
 * 
 * Evento disparado quando o estoque de um produto é atualizado.
 */
export class ProductStockUpdatedEvent extends BaseDomainEvent {
  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly previousStock: number,
    public readonly newStock: number,
    public readonly type: 'IN' | 'OUT'
  ) {
    super();
  }

  getEventName(): string {
    return 'product.stock.updated';
  }

  getPayload(): Record<string, unknown> {
    return {
      productId: this.productId,
      sku: this.sku,
      previousStock: this.previousStock,
      newStock: this.newStock,
      type: this.type,
      quantity: Math.abs(this.newStock - this.previousStock),
    };
  }
}
