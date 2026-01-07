import { BusinessRuleError, ValidationError } from '../errors';
import { Address, Email, Money, OrderNumber } from '../value-objects';
import { OrderItemEntity } from './order-item.entity';

/**
 * Order Status Enum
 */
export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

/**
 * Order Entity
 * 
 * Aggregate Root para o módulo de Pedidos.
 */
export class OrderEntity {
    constructor(
        public readonly id: string,
        public readonly orderNumber: OrderNumber,
        public readonly customerId: string,
        public readonly customerName: string,
        public readonly customerEmail: Email,
        public readonly status: OrderStatus,
        public readonly paymentStatus: PaymentStatus,
        public readonly paymentMethod: string,
        public readonly items: OrderItemEntity[],
        public readonly subtotal: Money,
        public readonly discount: Money,
        public readonly tax: Money,
        public readonly shipping: Money,
        public readonly total: Money,
        public readonly shippingAddress: Address,
        public readonly billingAddress: Address,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly notes?: string,
        public readonly confirmedAt?: Date,
        public readonly shippedAt?: Date,
        public readonly deliveredAt?: Date
    ) {}

    static create(props: {
        id: string;
        customerId: string;
        customerName: string;
        customerEmail: string;
        paymentMethod: string;
        items: Array<{
            id: string;
            productId: string;
            productName: string;
            sku: string;
            quantity: number;
            unitPrice: number;
            discount?: number;
        }>;
        shippingAddress: any;
        billingAddress: any;
        subtotal?: number;
        shipping?: number;
        tax?: number;
        discount?: number;
        total?: number;
        notes?: string;
    }): OrderEntity {
        if (!props.items || props.items.length === 0) {
            throw new ValidationError('Order must have at least one item', 'items');
        }

        const items = props.items.map(item => OrderItemEntity.create(item));
        const orderNumber = OrderNumber.generate();
        const email = Email.create(props.customerEmail);
        const shippingAddr = Address.create(props.shippingAddress);
        const billingAddr = Address.create(props.billingAddress);

        // Preços podem ser passados via props (calculados por um Domain Service) ou calculados aqui por padrão
        const subtotal = Money.create(props.subtotal ?? items.reduce((sum, item) => sum.add(item.total), Money.create(0)).getValue());
        const shipping = Money.create(props.shipping ?? 0);
        const tax = Money.create(props.tax ?? 0);
        const discount = Money.create(props.discount ?? 0);
        const total = Money.create(props.total ?? subtotal.add(shipping).add(tax).subtract(discount).getValue());

        if (total.getValue() < 0) {
            throw new ValidationError('Order total cannot be negative', 'total');
        }

        return new OrderEntity(
            props.id,
            orderNumber,
            props.customerId,
            props.customerName,
            email,
            OrderStatus.PENDING,
            PaymentStatus.PENDING,
            props.paymentMethod,
            items,
            subtotal,
            discount,
            tax,
            shipping,
            total,
            shippingAddr,
            billingAddr,
            new Date(),
            new Date(),
            props.notes
        );
    }

    /**
     * Transições de Status
     */

    confirm(): OrderEntity {
        if (this.status !== OrderStatus.PENDING) {
            throw new BusinessRuleError('Can only confirm pending orders', 'confirm');
        }

        return this.updateStatus(OrderStatus.CONFIRMED, { confirmedAt: new Date() });
    }

    ship(): OrderEntity {
        if (this.status !== OrderStatus.CONFIRMED && this.status !== OrderStatus.PROCESSING) {
            throw new BusinessRuleError('Order must be confirmed or processing to be shipped', 'ship');
        }

        return this.updateStatus(OrderStatus.SHIPPED, { shippedAt: new Date() });
    }

    deliver(): OrderEntity {
        if (this.status !== OrderStatus.SHIPPED) {
            throw new BusinessRuleError('Order must be shipped to be delivered', 'deliver');
        }

        return this.updateStatus(OrderStatus.DELIVERED, { deliveredAt: new Date() });
    }

    cancel(reason: string): OrderEntity {
        if (this.status === OrderStatus.SHIPPED || this.status === OrderStatus.DELIVERED) {
            throw new BusinessRuleError('Cannot cancel shipped or delivered orders', 'cancel');
        }

        return this.updateStatus(OrderStatus.CANCELLED, { notes: reason ? `${this.notes || ''} [Cancelled: ${reason}]` : this.notes });
    }

    markAsPaid(): OrderEntity {
        if (this.paymentStatus === PaymentStatus.PAID) return this;

        return this.clone({ paymentStatus: PaymentStatus.PAID });
    }

    private updateStatus(status: OrderStatus, extraProps: Partial<OrderEntity> = {}): OrderEntity {
        return this.clone({ status, ...extraProps });
    }

    private clone(overrides: Partial<OrderEntity>): OrderEntity {
        return new OrderEntity(
            overrides.id ?? this.id,
            overrides.orderNumber ?? this.orderNumber,
            overrides.customerId ?? this.customerId,
            overrides.customerName ?? this.customerName,
            overrides.customerEmail ?? this.customerEmail,
            overrides.status ?? this.status,
            overrides.paymentStatus ?? this.paymentStatus,
            overrides.paymentMethod ?? this.paymentMethod,
            overrides.items ?? this.items,
            overrides.subtotal ?? this.subtotal,
            overrides.discount ?? this.discount,
            overrides.tax ?? this.tax,
            overrides.shipping ?? this.shipping,
            overrides.total ?? this.total,
            overrides.shippingAddress ?? this.shippingAddress,
            overrides.billingAddress ?? this.billingAddress,
            this.createdAt,
            new Date(),
            overrides.notes ?? this.notes,
            overrides.confirmedAt ?? this.confirmedAt,
            overrides.shippedAt ?? this.shippedAt,
            overrides.deliveredAt ?? this.deliveredAt
        );
    }
    
    toJSON() {
        return {
            id: this.id,
            orderNumber: this.orderNumber.getValue(),
            customerId: this.customerId,
            customerName: this.customerName,
            customerEmail: this.customerEmail.getValue(),
            status: this.status,
            paymentStatus: this.paymentStatus,
            paymentMethod: this.paymentMethod,
            items: this.items.map(i => i.toJSON()),
            subtotal: this.subtotal.getValue(),
            discount: this.discount.getValue(),
            tax: this.tax.getValue(),
            shipping: this.shipping.getValue(),
            total: this.total.getValue(),
            shippingAddress: this.shippingAddress.toJSON(),
            billingAddress: this.billingAddress.toJSON(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            notes: this.notes,
            confirmedAt: this.confirmedAt?.toISOString(),
            shippedAt: this.shippedAt?.toISOString(),
            deliveredAt: this.deliveredAt?.toISOString(),
        };
    }
}
