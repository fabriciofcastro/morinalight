/**
 * Product Repository
 * 
 * Repository para gerenciar produtos
 */

import { AbstractRepository, type BaseRepository } from "./base-repository";

export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    brand?: string;
    unit: string;
    status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
    costPrice: number;
    sellingPrice: number;
    margin?: number;
    minStock: number;
    maxStock: number;
    currentStock: number;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class ProductRepository extends AbstractRepository<Product> {
    constructor() {
        super("product");
    }

    async findById(id: string): Promise<Product | null> {
        // return prisma.product.findUnique({ where: { id } });
        return null;
    }

    async findAll(filters?: any): Promise<Product[]> {
        const where = this.buildWhereClause(filters);
        const orderBy = this.buildOrderByClause(filters?.orderBy, filters?.order);

        // return prisma.product.findMany({
        //   where,
        //   orderBy,
        //   take: filters?.limit || 50,
        //   skip: filters?.offset || 0,
        // });

        return [];
    }

    async create(data: Partial<Product>): Promise<Product> {
        // return prisma.product.create({ data });
        return {} as Product;
    }

    async update(id: string, data: Partial<Product>): Promise<Product> {
        // return prisma.product.update({ where: { id }, data });
        return {} as Product;
    }

    async delete(id: string): Promise<void> {
        // await prisma.product.delete({ where: { id } });
    }

    async count(filters?: any): Promise<number> {
        const where = this.buildWhereClause(filters);
        // return prisma.product.count({ where });
        return 0;
    }

    /**
     * Métodos específicos de Product
     */

    async findBySku(sku: string): Promise<Product | null> {
        // return prisma.product.findUnique({ where: { sku } });
        return null;
    }

    async findByCategory(categoryId: string): Promise<Product[]> {
        // return prisma.product.findMany({ where: { categoryId } });
        return [];
    }

    async findLowStock(): Promise<Product[]> {
        // return prisma.product.findMany({
        //   where: {
        //     currentStock: { lte: prisma.product.fields.minStock },
        //   },
        // });
        return [];
    }

    async updateStock(id: string, quantity: number, type: "IN" | "OUT"): Promise<Product> {
        // const product = await this.findById(id);
        // if (!product) throw new Error('Product not found');

        // const newStock = type === 'IN'
        //   ? product.currentStock + quantity
        //   : product.currentStock - quantity;

        // return this.update(id, { currentStock: newStock });
        return {} as Product;
    }

    async bulkUpdatePrices(
        updates: Array<{ id: string; costPrice?: number; sellingPrice?: number }>,
    ): Promise<void> {
        // await prisma.$transaction(
        //   updates.map(({ id, costPrice, sellingPrice }) =>
        //     prisma.product.update({
        //       where: { id },
        //       data: { costPrice, sellingPrice },
        //     })
        //   )
        // );
    }

    async search(query: string): Promise<Product[]> {
        // return prisma.product.findMany({
        //   where: {
        //     OR: [
        //       { name: { contains: query, mode: 'insensitive' } },
        //       { sku: { contains: query, mode: 'insensitive' } },
        //       { description: { contains: query, mode: 'insensitive' } },
        //     ],
        //   },
        // });
        return [];
    }
}

export const productRepository = new ProductRepository();
