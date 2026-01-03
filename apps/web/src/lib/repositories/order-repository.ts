/**
 * Order Repository
 * 
 * Repository para gerenciar pedidos
 */

import { AbstractRepository } from "./base-repository";

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    paymentMethod: string;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
    shippingAddress: Address;
    billingAddress: Address;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
}

export interface Address {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export class OrderRepository extends AbstractRepository<Order> {
    constructor() {
        super("order");
    }
    async findById(id: string): Promise<Order | null> {
        const delegate = await this.getDelegate();
        if (!delegate) return null;
        const result = await delegate.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!result) return null;
        return this.mapToDomain(result);
    }

    async findAll(filters?: any): Promise<Order[]> {
        const delegate = await this.getDelegate();
        if (!delegate) return [];

        const where = this.buildWhereClause(filters);
        const orderBy = this.buildOrderByClause(filters?.orderBy, filters?.order);

        const results = await delegate.findMany({
            where,
            orderBy,
            include: { items: true },
            take: filters?.limit || 50,
            skip: filters?.offset || 0,
        });
        return results.map((r: any) => this.mapToDomain(r));
    }

    private mapToDomain(o: any): Order {
        return {
            ...o,
            subtotal: Number(o.subtotal),
            discount: Number(o.discount),
            tax: Number(o.tax),
            shipping: Number(o.shipping),
            total: Number(o.total),
            items: o.items.map((i: any) => ({
                ...i,
                unitPrice: Number(i.unitPrice),
                discount: Number(i.discount),
                total: Number(i.total),
                quantity: i.quantity, // Int
            })),
        };
    }

    /**
     * Métodos específicos de Order
     */

    async findByOrderNumber(orderNumber: string): Promise<Order | null> {
        const delegate = await this.getDelegate();
        if (!delegate) return null;
        const result = await delegate.findUnique({
            where: { orderNumber },
            include: { items: true },
        });
        if (!result) return null;
        return this.mapToDomain(result);
    }

    async findByCustomer(customerId: string): Promise<Order[]> {
        const delegate = await this.getDelegate();
        if (!delegate) return [];
        const results = await delegate.findMany({
            where: { customerId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
        return results.map((r: any) => this.mapToDomain(r));
    }

    async findByStatus(status: Order["status"]): Promise<Order[]> {
        const delegate = await this.getDelegate();
        if (!delegate) return [];
        const results = await delegate.findMany({
            where: { status },
            include: { items: true },
        });
        return results.map((r: any) => this.mapToDomain(r));
    }

    async findPendingOrders(): Promise<Order[]> {
        const delegate = await this.getDelegate();
        if (!delegate) return [];
        const results = await delegate.findMany({
            where: {
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            include: { items: true },
        });
        return results.map((r: any) => this.mapToDomain(r));
    }

    async updateStatus(
        id: string,
        status: Order["status"],
    ): Promise<Order> {
        const updateData: any = { status };

        // Atualizar timestamps específicos
        if (status === "CONFIRMED") {
            updateData.confirmedAt = new Date();
        } else if (status === "SHIPPED") {
            updateData.shippedAt = new Date();
        } else if (status === "DELIVERED") {
            updateData.deliveredAt = new Date();
        }

        const result = await this.update(id, updateData); // update calls getDelegate -> update which returns Prisma obj. Wait.
        // update returns this.mapToDomain(result)? BaseRepository returns PrismaT.
        // OrderRepository extends AbstractRepository<Order>. 
        // If BaseRepository returns T (which is Order), then it ostensibly returns Order.
        // BUT BaseRepository.update returns delegate.updateResult.
        // I should override update in OrderRepository or cast result. 
        // Actually, BaseRepository.update result is unmapped!
        // So I must override update here as well if I want explicit mapping.

        // Let's implement Override for Update as well since BaseRepo doesn't map.
        return this.mapToDomain(result); // Assuming update override is added below
    }

    async updatePaymentStatus(
        id: string,
        paymentStatus: Order["paymentStatus"],
    ): Promise<Order> {
        return this.update(id, { paymentStatus });
    }

    async calculateTotals(items: OrderItem[]): Promise<{
        subtotal: number;
        discount: number;
        total: number;
    }> {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const discount = items.reduce((sum, item) => sum + item.discount, 0);
        const total = subtotal - discount;

        return { subtotal, discount, total };
    }

    async getOrderStats(startDate: Date, endDate: Date): Promise<{
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        ordersByStatus: Record<string, number>;
    }> {
        const delegate = await this.getDelegate();
        if (!delegate) return {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            ordersByStatus: {}
        };

        const orders = await delegate.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
            },
        });

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, o: Order) => sum + o.total, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const ordersByStatus = orders.reduce((acc: Record<string, number>, o: Order) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalOrders,
            totalRevenue,
            averageOrderValue,
            ordersByStatus,
        };
    }

    // Override update to handle mapping
    async update(id: string, data: Partial<Order>): Promise<Order> {
        const delegate = await this.getDelegate();
        if (!delegate) throw new Error("Database unavailable");
        // We need to be careful with sending Decimal fields back.
        // Prisma expects Decimal or number/string. Number is fine.
        const result = await delegate.update({ where: { id }, data, include: { items: true } });
        return this.mapToDomain(result);
    }
}

export const orderRepository = new OrderRepository();
