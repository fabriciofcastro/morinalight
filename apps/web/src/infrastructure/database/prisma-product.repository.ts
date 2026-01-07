import { BasePrismaRepository } from './base-prisma.repository';

/**
 * PrismaProductRepository
 * 
 * Implementação concreta do IProductRepository usando Prisma.
 * Adapta entre domain entities e Prisma models.
 */

/**
 * PrismaProductRepository
 * 
 * Implementação concreta do IProductRepository usando Prisma.
 * Adapta entre domain entities e Prisma models.
 */
export class PrismaProductRepository extends BasePrismaRepository implements IProductRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async save(product: ProductEntity): Promise<void> {
    const data = product.toPersistence();

    await this.client.product.upsert({
      where: { id: product.id },
      create: {
        id: data.id,
        orgId: 'default-org', // TODO: Get from context
        sku: data.sku,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        status: this.mapStatusToPrisma(data.status),
        createdBy: 'system', // TODO: Get from context
        updatedBy: 'system',
        // Create default variant with pricing/stock
        variants: {
          create: {
            orgId: 'default-org',
            sku: data.sku,
            nome: data.name,
            atributos: {},
            preco: data.sellingPrice,
            estoque: data.currentStock,
            createdBy: 'system',
            updatedBy: 'system',
          },
        },
      },
      update: {
        name: data.name,
        description: data.description,
        status: this.mapStatusToPrisma(data.status),
        updatedBy: 'system',
        // Update main variant
        variants: {
          updateMany: {
            where: { productId: product.id },
            data: {
              nome: data.name,
              preco: data.sellingPrice,
              estoque: data.currentStock,
              updatedBy: 'system',
            },
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Option<ProductEntity>> {
    const product = await this.client.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) return None();

    return Some(this.toDomain(product));
  }

  async findBySku(sku: string): Promise<Option<ProductEntity>> {
    const product = await this.client.product.findFirst({
      where: { sku },
      include: { variants: true },
    });

    if (!product) return None();

    return Some(this.toDomain(product));
  }

  async findAll(filters?: {
    search?: string;
    categoryId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    onlyLowStock?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ProductEntity[]> {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.status) {
      where.status = this.mapStatusToPrisma(filters.status as ProductStatus);
    }

    const products = await this.client.product.findMany({
      where,
      include: { variants: true },
      take: filters?.limit,
      skip: filters?.offset,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => this.toDomain(p));
  }

  async findByCategory(categoryId: string): Promise<ProductEntity[]> {
    const products = await this.client.product.findMany({
      where: { categoryId },
      include: { variants: true },
    });

    return products.map((p) => this.toDomain(p));
  }

  async findLowStock(): Promise<ProductEntity[]> {
    // TODO: Implement low stock logic based on variants
    return [];
  }

  async delete(id: string): Promise<void> {
    await this.client.product.delete({
      where: { id },
    });
  }

  async count(filters?: {
    search?: string;
    categoryId?: string;
    status?: string;
  }): Promise<number> {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.status) {
      where.status = this.mapStatusToPrisma(filters.status as ProductStatus);
    }

    return this.client.product.count({ where });
  }

  /**
   * Converte Prisma model para Domain entity
   */
  private toDomain(prismaProduct: any): ProductEntity {
    const mainVariant = prismaProduct.variants?.[0] || {};

    return ProductEntity.fromPersistence({
      id: prismaProduct.id,
      sku: prismaProduct.sku || mainVariant.sku || '',
      name: prismaProduct.name,
      description: prismaProduct.description || undefined,
      categoryId: prismaProduct.categoryId || '',
      brand: undefined, // TODO: Add to schema
      unit: 'unidade', // TODO: Add to schema
      status: this.mapStatusFromPrisma(prismaProduct.status),
      costPrice: 0, // TODO: Add to schema
      sellingPrice: mainVariant.preco ? Number(mainVariant.preco) : 0,
      minStock: 0, // TODO: Add to schema
      maxStock: 1000, // TODO: Add to schema
      currentStock: mainVariant.estoque || 0,
      imageUrl: undefined, // TODO: Add to schema
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    });
  }

  /**
   * Mapeia status do domain para Prisma
   */
  private mapStatusToPrisma(status: ProductStatus): string {
    switch (status) {
      case ProductStatus.ACTIVE:
        return 'ativo';
      case ProductStatus.INACTIVE:
        return 'inativo';
      case ProductStatus.ARCHIVED:
        return 'arquivado';
      default:
        return 'ativo';
    }
  }

  /**
   * Mapeia status do Prisma para domain
   */
  private mapStatusFromPrisma(status: string): ProductStatus {
    switch (status) {
      case 'ativo':
        return ProductStatus.ACTIVE;
      case 'inativo':
        return ProductStatus.INACTIVE;
      case 'arquivado':
        return ProductStatus.ARCHIVED;
      default:
        return ProductStatus.ACTIVE;
    }
  }
}
