import { OrderItemEntity } from '../entities/order-item.entity';
import { Money } from '../value-objects';

/**
 * PricingResult
 * 
 * Resultado dos cálculos de preço efetuados pelo serviço.
 */
export interface PricingResult {
  subtotal: Money;
  discount: Money;
  tax: Money;
  shipping: Money;
  total: Money;
}

/**
 * OrderPricingService
 * 
 * Serviço de domínio para calcular preços, descontos, taxas e frete de um pedido.
 */
export class OrderPricingService {
  /**
   * Calcula o preço final do pedido baseado nos itens e regras de negócio.
   */
  calculatePricing(props: {
    items: OrderItemEntity[];
    shipping?: number;
    tax?: number;
    discount?: number;
  }): PricingResult {
    const subtotal = props.items.reduce(
      (sum, item) => sum.add(item.total),
      Money.create(0)
    );

    const shipping = Money.create(props.shipping ?? 0);
    const tax = Money.create(props.tax ?? 0);
    const discount = Money.create(props.discount ?? 0);

    // Regra de negócio: Frete grátis para pedidos acima de R$ 500
    let finalShipping = shipping;
    if (subtotal.getValue() > 500) {
      finalShipping = Money.create(0);
    }

    const total = subtotal
      .add(finalShipping)
      .add(tax)
      .subtract(discount);

    return {
      subtotal,
      discount,
      tax,
      shipping: finalShipping,
      total: Money.create(Math.max(0, total.getValue())),
    };
  }
}
