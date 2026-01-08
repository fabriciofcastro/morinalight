import { OrderDTO } from '../dto';
import { IOrderRepository } from '../ports';

/**
 * List Orders Query
 * 
 * Query para listar todos os pedidos.
 */

export class ListOrdersQuery {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(): Promise<OrderDTO[]> {
    const orders = await this.orderRepository.findAll();

    return orders.map((order) => order.toJSON());
  }
}
