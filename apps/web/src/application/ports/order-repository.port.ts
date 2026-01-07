import { OrderEntity } from '@/domain/entities';
import { Option } from '@/shared/kernel/types';

/**
 * IOrderRepository
 * 
 * Port para o repositório de pedidos.
 */
export interface IOrderRepository {
    save(order: OrderEntity): Promise<void>;
    findById(id: string): Promise<Option<OrderEntity>>;
    findByOrderNumber(orderNumber: string): Promise<Option<OrderEntity>>;
    findAll(filters?: any): Promise<OrderEntity[]>;
    findByCustomer(customerId: string): Promise<OrderEntity[]>;
    delete(id: string): Promise<void>;
}
