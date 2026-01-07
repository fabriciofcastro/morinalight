import { Err, Ok, Result } from '@/shared/kernel/types';
import { ProductEntity } from '../entities/product.entity';
import { ValidationError } from '../errors';

/**
 * InventoryService
 * 
 * Serviço de domínio para gerenciar estoque entre múltiplos produtos/agregados.
 */
export class InventoryService {
  /**
   * Valida se há estoque suficiente para uma lista de itens e retorna os produtos atualizados.
   */
  validateAndReserveStock(
    products: ProductEntity[],
    items: Array<{ productId: string; quantity: number }>
  ): Result<ProductEntity[], ValidationError> {
    const updatedProducts: ProductEntity[] = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        return Err(new ValidationError(`Product ${item.productId} not found`, 'productId'));
      }

      if (product.currentStock < item.quantity) {
        return Err(new ValidationError(
          `Insufficient stock for product ${product.name.getValue()}`,
          'quantity',
          item.quantity
        ));
      }

      try {
        updatedProducts.push(product.removeStock(item.quantity));
      } catch (error) {
        return Err(error as ValidationError);
      }
    }

    return Ok(updatedProducts);
  }
}
