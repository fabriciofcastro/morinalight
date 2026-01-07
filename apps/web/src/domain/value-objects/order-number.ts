import { ValidationError } from '../errors';

/**
 * OrderNumber Value Object
 * 
 * Representa um número de pedido com formato validado.
 * Exemplo: ORD-2026-0001
 */
export class OrderNumber {
    private constructor(private readonly value: string) {}

    static create(value: string): OrderNumber {
        if (!value || value.trim().length === 0) {
            throw new ValidationError('Order number cannot be empty', 'orderNumber');
        }

        const trimmed = value.trim().toUpperCase();
        
        // Formato simples: letras, números e hífens
        const pattern = /^[A-Z0-9\-]+$/;
        if (!pattern.test(trimmed)) {
            throw new ValidationError('Invalid order number format', 'orderNumber', value);
        }

        return new OrderNumber(trimmed);
    }

    static generate(): OrderNumber {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9000) + 1000;
        return new OrderNumber(`ORD-${year}-${random}`);
    }

    getValue(): string {
        return this.value;
    }

    toString(): string {
        return this.value;
    }

    equals(other: OrderNumber): boolean {
        return this.value === other.value;
    }
    
    toJSON(): string {
        return this.value;
    }
}
