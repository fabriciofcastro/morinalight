import { Option } from '@/shared/kernel/types';
import { ProductEntity } from '../../domain/entities';

/**
 * IProductRepository
 * 
 * Port (interface) para repositório de produtos.
 * Define contrato que será implementado pela camada de infraestrutura.
 */
export interface IProductRepository {
  /**
   * Salva um produto (create ou update)
   */
  save(product: ProductEntity): Promise<void>;

  /**
   * Busca produto por ID
   */
  findById(id: string): Promise<Option<ProductEntity>>;

  /**
   * Busca produto por SKU
   */
  findBySku(sku: string): Promise<Option<ProductEntity>>;

  /**
   * Lista todos os produtos com filtros opcionais
   */
  findAll(filters?: {
    search?: string;
    categoryId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    onlyLowStock?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ProductEntity[]>;

  /**
   * Busca produtos por categoria
   */
  findByCategory(categoryId: string): Promise<ProductEntity[]>;

  /**
   * Busca produtos com estoque baixo
   */
  findLowStock(): Promise<ProductEntity[]>;

  /**
   * Deleta um produto
   */
  delete(id: string): Promise<void>;

  /**
   * Conta produtos com filtros opcionais
   */
  count(filters?: {
    search?: string;
    categoryId?: string;
    status?: string;
  }): Promise<number>;
}
