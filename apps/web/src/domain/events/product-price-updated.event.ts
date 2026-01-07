import { BaseDomainEvent } from './base-domain-event';

/**
 * ProductPriceUpdatedEvent
 * 
 * Evento disparado quando o preço de um produto é atualizado.
 */
export class ProductPriceUpdatedEvent extends BaseDomainEvent {
  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly previousPrice: number,
    public readonly newPrice: number,
    public readonly priceType: 'cost' | 'selling'
  ) {
    super();
  }

  getEventName(): string {
    return 'product.price.updated';
  }

  getPayload(): Record<string, unknown> {
    return {
      productId: this.productId,
      sku: this.sku,
      previousPrice: this.previousPrice,
      newPrice: this.newPrice,
      priceType: this.priceType,
      change: this.newPrice - this.previousPrice,
      changePercentage: ((this.newPrice - this.previousPrice) / this.previousPrice) * 100,
    };
  }
}
