import { IOrderRepository } from '@/application/ports/order-repository.port';
import { OrderEntity, OrderStatus, PaymentStatus } from '@/domain/entities';
import { None, Option, Some } from '@/shared/kernel/types';
import { PrismaClient } from '@prisma/client';
import { BasePrismaRepository } from './base-prisma.repository';

/**
 * PrismaOrderRepository
 */

/**
 * PrismaOrderRepository
 */
export class PrismaOrderRepository extends BasePrismaRepository implements IOrderRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async save(order: OrderEntity): Promise<void> {
    const data = order.toJSON();

    await this.client.order.upsert({
      where: { id: order.id },
      create: {
        id: data.id,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        shipping: data.shipping,
        total: data.total,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        notes: data.notes,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        confirmedAt: data.confirmedAt ? new Date(data.confirmedAt) : null,
        shippedAt: data.shippedAt ? new Date(data.shippedAt) : null,
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : null,
        items: {
          create: data.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.total,
          })),
        },
      },
      update: {
        status: data.status,
        paymentStatus: data.paymentStatus,
        updatedAt: new Date(data.updatedAt),
        confirmedAt: data.confirmedAt ? new Date(data.confirmedAt) : null,
        shippedAt: data.shippedAt ? new Date(data.shippedAt) : null,
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : null,
      },
    });
  }

  async findById(id: string): Promise<Option<OrderEntity>> {
    const order = await this.client.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return None();

    return Some(this.toDomain(order));
  }

  async findByOrderNumber(orderNumber: string): Promise<Option<OrderEntity>> {
    const order = await this.client.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) return None();

    return Some(this.toDomain(order));
  }

  async findAll(filters?: any): Promise<OrderEntity[]> {
    const orders = await this.client.order.findMany({
      where: filters,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o: any) => this.toDomain(o));
  }

  async findByCustomer(customerId: string): Promise<OrderEntity[]> {
    const orders = await this.client.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o: any) => this.toDomain(o));
  }

  async delete(id: string): Promise<void> {
    await this.client.order.delete({
      where: { id },
    });
  }

  private toDomain(p: any): OrderEntity {
    return new OrderEntity(
      p.id,
      p.orderNumber, // Assume it's already a wrapped value or we wrap it
      p.customerId,
      p.customerName,
      p.customerEmail,
      p.status as OrderStatus,
      p.paymentStatus as PaymentStatus,
      p.paymentMethod,
      p.items.map((i: any) => i), // Mapping logic needed here for full domain entity
      p.subtotal,
      p.discount,
      p.tax,
      p.shipping,
      p.total,
      p.shippingAddress,
      p.billingAddress,
      p.createdAt,
      p.updatedAt,
      p.notes,
      p.confirmedAt,
      p.shippedAt,
      p.deliveredAt
    );
  }
}
