import { BaseDomainEvent } from './base-domain-event';

/**
 * ProductCreatedEvent
 * 
 * Evento disparado quando um produto é criado.
 */
export class ProductCreatedEvent extends BaseDomainEvent {
  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly name: string,
    public readonly categoryId: string,
    public readonly sellingPrice: number
  ) {
    super();
  }

  getEventName(): string {
    return 'product.created';
  }

  getPayload(): Record<string, unknown> {
    return {
      productId: this.productId,
      sku: this.sku,
      name: this.name,
      categoryId: this.categoryId,
      sellingPrice: this.sellingPrice,
    };
  }
}
