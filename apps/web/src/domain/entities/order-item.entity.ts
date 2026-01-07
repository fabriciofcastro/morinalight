import { ValidationError } from '../errors';
import { Money, ProductName, SKU } from '../value-objects';

/**
 * OrderItem Entity
 * 
 * Representa um item dentro de um pedido.
 */
export class OrderItemEntity {
    private constructor(
        public readonly id: string,
        public readonly productId: string,
        public readonly productName: ProductName,
        public readonly sku: SKU,
        public readonly quantity: number,
        public readonly unitPrice: Money,
        public readonly discount: Money,
        public readonly total: Money
    ) {}

    static create(props: {
        id: string;
        productId: string;
        productName: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        discount?: number;
    }): OrderItemEntity {
        if (!props.id) throw new ValidationError('Item ID is required', 'id');
        if (!props.productId) throw new ValidationError('Product ID is required', 'productId');
        if (props.quantity <= 0) throw new ValidationError('Quantity must be greater than zero', 'quantity');

        const name = ProductName.create(props.productName);
        const sku = SKU.create(props.sku);
        const unitPrice = Money.create(props.unitPrice);
        const discount = Money.create(props.discount ?? 0);
        
        const subtotal = unitPrice.multiply(props.quantity);
        if (discount.isGreaterThan(subtotal)) {
            throw new ValidationError('Discount cannot be greater than subtotal', 'discount');
        }
        
        const total = subtotal.subtract(discount);

        return new OrderItemEntity(
            props.id,
            props.productId,
            name,
            sku,
            props.quantity,
            unitPrice,
            discount,
            total
        );
    }

    equals(other: OrderItemEntity): boolean {
        return this.id === other.id;
    }
    
    toJSON() {
        return {
            id: this.id,
            productId: this.productId,
            productName: this.productName.getValue(),
            sku: this.sku.getValue(),
            quantity: this.quantity,
            unitPrice: this.unitPrice.getValue(),
            discount: this.discount.getValue(),
            total: this.total.getValue(),
        };
    }
}
