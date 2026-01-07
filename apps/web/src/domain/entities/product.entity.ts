import { ValidationError } from '../errors';
import { Money, ProductName, SKU } from '../value-objects';

/**
 * Product Status Enum
 */
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Product Entity
 * 
 * Entidade rica que representa um produto no domínio.
 * Contém lógica de negócio relacionada a produtos.
 */
export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly sku: SKU,
    public readonly name: ProductName,
    public readonly description: string | undefined,
    public readonly categoryId: string,
    public readonly brand: string | undefined,
    public readonly unit: string,
    public readonly status: ProductStatus,
    public readonly costPrice: Money,
    public readonly sellingPrice: Money,
    public readonly minStock: number,
    public readonly maxStock: number,
    public readonly currentStock: number,
    public readonly imageUrl: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Factory method para criar novo produto
   */
  static create(props: {
    id: string;
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    brand?: string;
    unit: string;
    status?: ProductStatus;
    costPrice: number;
    sellingPrice: number;
    minStock?: number;
    maxStock?: number;
    currentStock?: number;
    imageUrl?: string;
  }): ProductEntity {
    // Validações
    if (!props.id || props.id.trim().length === 0) {
      throw new ValidationError('Product ID is required', 'id');
    }

    if (!props.categoryId || props.categoryId.trim().length === 0) {
      throw new ValidationError('Category ID is required', 'categoryId');
    }

    if (!props.unit || props.unit.trim().length === 0) {
      throw new ValidationError('Unit is required', 'unit');
    }

    // Criar value objects
    const sku = SKU.create(props.sku);
    const name = ProductName.create(props.name);
    const costPrice = Money.create(props.costPrice);
    const sellingPrice = Money.create(props.sellingPrice);

    // Validar preços
    if (sellingPrice.isLessThan(costPrice)) {
      throw new ValidationError(
        'Selling price cannot be less than cost price',
        'sellingPrice'
      );
    }

    // Validar estoque
    const minStock = props.minStock ?? 0;
    const maxStock = props.maxStock ?? 1000;
    const currentStock = props.currentStock ?? 0;

    if (minStock < 0) {
      throw new ValidationError('Min stock cannot be negative', 'minStock');
    }

    if (maxStock < minStock) {
      throw new ValidationError(
        'Max stock cannot be less than min stock',
        'maxStock'
      );
    }

    if (currentStock < 0) {
      throw new ValidationError('Current stock cannot be negative', 'currentStock');
    }

    return new ProductEntity(
      props.id,
      sku,
      name,
      props.description,
      props.categoryId,
      props.brand,
      props.unit,
      props.status ?? ProductStatus.ACTIVE,
      costPrice,
      sellingPrice,
      minStock,
      maxStock,
      currentStock,
      props.imageUrl,
      new Date(),
      new Date()
    );
  }

  /**
   * Reconstrói entidade a partir de dados de persistência
   */
  static fromPersistence(data: {
    id: string;
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    brand?: string;
    unit: string;
    status: string;
    costPrice: number;
    sellingPrice: number;
    minStock: number;
    maxStock: number;
    currentStock: number;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }): ProductEntity {
    return new ProductEntity(
      data.id,
      SKU.create(data.sku),
      ProductName.create(data.name),
      data.description,
      data.categoryId,
      data.brand,
      data.unit,
      data.status as ProductStatus,
      Money.create(data.costPrice),
      Money.create(data.sellingPrice),
      data.minStock,
      data.maxStock,
      data.currentStock,
      data.imageUrl,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Calcula a margem de lucro
   */
  calculateMargin(): number {
    const cost = this.costPrice.getValue();
    const selling = this.sellingPrice.getValue();
    
    if (cost === 0) return 0;
    
    return ((selling - cost) / cost) * 100;
  }

  /**
   * Verifica se o produto está com estoque baixo
   */
  isLowStock(): boolean {
    return this.currentStock <= this.minStock;
  }

  /**
   * Verifica se o produto está sem estoque
   */
  isOutOfStock(): boolean {
    return this.currentStock === 0;
  }

  /**
   * Verifica se o produto está ativo
   */
  isActive(): boolean {
    return this.status === ProductStatus.ACTIVE;
  }

  /**
   * Atualiza o preço de venda
   */
  updateSellingPrice(newPrice: number): ProductEntity {
    const newSellingPrice = Money.create(newPrice);

    if (newSellingPrice.isLessThan(this.costPrice)) {
      throw new ValidationError(
        'Selling price cannot be less than cost price',
        'sellingPrice'
      );
    }

    return new ProductEntity(
      this.id,
      this.sku,
      this.name,
      this.description,
      this.categoryId,
      this.brand,
      this.unit,
      this.status,
      this.costPrice,
      newSellingPrice,
      this.minStock,
      this.maxStock,
      this.currentStock,
      this.imageUrl,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Atualiza o preço de custo
   */
  updateCostPrice(newPrice: number): ProductEntity {
    const newCostPrice = Money.create(newPrice);

    if (this.sellingPrice.isLessThan(newCostPrice)) {
      throw new ValidationError(
        'Cost price cannot be greater than selling price',
        'costPrice'
      );
    }

    return new ProductEntity(
      this.id,
      this.sku,
      this.name,
      this.description,
      this.categoryId,
      this.brand,
      this.unit,
      this.status,
      newCostPrice,
      this.sellingPrice,
      this.minStock,
      this.maxStock,
      this.currentStock,
      this.imageUrl,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Adiciona estoque
   */
  addStock(quantity: number): ProductEntity {
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than zero', 'quantity');
    }

    const newStock = this.currentStock + quantity;

    if (newStock > this.maxStock) {
      throw new ValidationError(
        `Stock would exceed maximum (${this.maxStock})`,
        'currentStock'
      );
    }

    return new ProductEntity(
      this.id,
      this.sku,
      this.name,
      this.description,
      this.categoryId,
      this.brand,
      this.unit,
      this.status,
      this.costPrice,
      this.sellingPrice,
      this.minStock,
      this.maxStock,
      newStock,
      this.imageUrl,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Remove estoque
   */
  removeStock(quantity: number): ProductEntity {
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than zero', 'quantity');
    }

    const newStock = this.currentStock - quantity;

    if (newStock < 0) {
      throw new ValidationError(
        'Insufficient stock',
        'currentStock'
      );
    }

    return new ProductEntity(
      this.id,
      this.sku,
      this.name,
      this.description,
      this.categoryId,
      this.brand,
      this.unit,
      this.status,
      this.costPrice,
      this.sellingPrice,
      this.minStock,
      this.maxStock,
      newStock,
      this.imageUrl,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Ativa o produto
   */
  activate(): ProductEntity {
    if (this.status === ProductStatus.ACTIVE) {
      return this;
    }

    return new ProductEntity(
      this.id,
      this.sku,
      this.name,
      this.description,
      this.categoryId,
      this.brand,
      this.unit,
      ProductStatus.ACTIVE,
      this.costPrice,
      this.sellingPrice,
      this.minStock,
      this.maxStock,
      this.currentStock,
      this.imageUrl,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Desativa o produto
   */
  deactivate(): ProductEntity {
    if (this.status === ProductStatus.INACTIVE) {
      return this;
    }

    return new ProductEntity(
      this.id,
      this.sku,
      this.name,
      this.description,
      this.categoryId,
      this.brand,
      this.unit,
      ProductStatus.INACTIVE,
      this.costPrice,
      this.sellingPrice,
      this.minStock,
      this.maxStock,
      this.currentStock,
      this.imageUrl,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Arquiva o produto
   */
  archive(): ProductEntity {
    if (this.status === ProductStatus.ARCHIVED) {
      return this;
    }

    return new ProductEntity(
      this.id,
      this.sku,
      this.name,
      this.description,
      this.categoryId,
      this.brand,
      this.unit,
      ProductStatus.ARCHIVED,
      this.costPrice,
      this.sellingPrice,
      this.minStock,
      this.maxStock,
      this.currentStock,
      this.imageUrl,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Compara produtos por ID
   */
  equals(other: ProductEntity): boolean {
    return this.id === other.id;
  }

  /**
   * Converte para formato de persistência
   */
  toPersistence() {
    return {
      id: this.id,
      sku: this.sku.getValue(),
      name: this.name.getValue(),
      description: this.description,
      categoryId: this.categoryId,
      brand: this.brand,
      unit: this.unit,
      status: this.status,
      costPrice: this.costPrice.getValue(),
      sellingPrice: this.sellingPrice.getValue(),
      minStock: this.minStock,
      maxStock: this.maxStock,
      currentStock: this.currentStock,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Serializa para JSON
   */
  toJSON() {
    return {
      id: this.id,
      sku: this.sku.getValue(),
      name: this.name.getValue(),
      description: this.description,
      categoryId: this.categoryId,
      brand: this.brand,
      unit: this.unit,
      status: this.status,
      costPrice: this.costPrice.getValue(),
      sellingPrice: this.sellingPrice.getValue(),
      margin: this.calculateMargin(),
      minStock: this.minStock,
      maxStock: this.maxStock,
      currentStock: this.currentStock,
      isLowStock: this.isLowStock(),
      isOutOfStock: this.isOutOfStock(),
      imageUrl: this.imageUrl,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
