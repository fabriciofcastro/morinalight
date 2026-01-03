/**
 * Product Repository
 * 
 * Repository para gerenciar produtos
 */

import { AbstractRepository, type BaseRepository } from "./base-repository";
import { Cached, InvalidatesCache } from "../patterns/caching-decorator";
import { QueryBuilder } from "../patterns/query-builder";

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

    @Cached({ ttl: 60 })
    async findById(id: string): Promise<Product | null> {
        const delegate = await this.getDelegate();
        if (!delegate) return null;
        const result = await delegate.findUnique({
            where: { id },
            include: { variants: true }
        });
        if (!result) return null;
        return this.mapToDomain(result);
    }

    @Cached({ ttl: 300 })
    async findAll(filters?: any): Promise<Product[]> {
        const delegate = await this.getDelegate();
        if (!delegate) return [];

        // Use Builder Pattern to construct query
        const qb = new QueryBuilder().from("product");

        if (filters?.search) {
            qb.where("name", "LIKE", filters.search);
        }

        if (filters?.status) {
            qb.where("status", "=", filters.status);
        }

        if (filters?.limit) qb.limit(Number(filters.limit));
        if (filters?.offset) qb.offset(Number(filters.offset));

        if (filters?.orderBy) {
            qb.orderBy(filters.orderBy, filters.order || "desc");
        } else {
            qb.orderBy("createdAt", "desc");
        }

        const prismaOptions = qb.toPrisma();

        const results = await delegate.findMany({
            ...prismaOptions,
            include: { variants: true },
        });

        return results.map((r: any) => this.mapToDomain(r));
    }

    private mapToDomain(prismaProduct: any): Product {
        // Simple mapping strategy: take first variant or defaults
        const mainVariant = prismaProduct.variants?.[0] || {};

        return {
            id: prismaProduct.id,
            name: prismaProduct.name,
            sku: prismaProduct.sku || mainVariant.sku || "",
            description: prismaProduct.description || undefined,
            categoryId: prismaProduct.categoryId || "",
            status: prismaProduct.status === "ativo" ? "ACTIVE" : "INACTIVE", // Map enum
            // Fields not in schema, using defaults or mapping from variant
            unit: "unidade",
            brand: "Generic",
            costPrice: 0,
            sellingPrice: mainVariant.preco ? Number(mainVariant.preco) : 0,
            currentStock: mainVariant.estoque || 0,
            minStock: 0,
            maxStock: 0,
            createdAt: prismaProduct.createdAt,
            updatedAt: prismaProduct.updatedAt,
        };
    }


    @InvalidatesCache({ keys: ["product_list"] })
    async create(data: Partial<Product>): Promise<Product> {
        const delegate = await this.getDelegate();
        if (!delegate) throw new Error("Database delegate unavailable");

        // Map domain fields to Prisma structure
        const prismaData: any = {
            orgId: "default-org-id", // TODO: Get from context or data
            name: data.name,
            description: data.description,
            sku: data.sku,
            status: data.status === "ACTIVE" ? "ativo" : "inativo", // Map enum
            // Create default variant with price/stock
            variants: {
                create: {
                    orgId: "default-org-id", // TODO
                    sku: data.sku,
                    nome: data.name,
                    atributos: {},
                    preco: data.sellingPrice,
                    estoque: data.currentStock,
                    createdBy: "system", // TODO
                    updatedBy: "system",
                }
            },
            createdBy: "system",
            updatedBy: "system",
        };

        if (data.categoryId) prismaData.categoryId = data.categoryId;

        // Note: In real app, we need to handle orgId and userId from context
        // For now, we assume data might have orgId if passed, or we fail safely.

        try {
            const result = await delegate.create({
                data: prismaData,
                include: { variants: true }
            });
            return this.mapToDomain(result);
        } catch (e) {
            console.error("Failed to create product", e);
            throw e;
        }
    }

    @InvalidatesCache({ keys: ["product_list"] })
    async update(id: string, data: Partial<Product>): Promise<Product> {
        const delegate = await this.getDelegate();
        if (!delegate) throw new Error("Database delegate unavailable");

        const prismaData: any = {};
        if (data.name) prismaData.name = data.name;
        if (data.description) prismaData.description = data.description;
        if (data.status) prismaData.status = data.status === "ACTIVE" ? "ativo" : "inativo";

        // We do not update variants here deeply for simplicity, 
        // normally we would update the matched variant or main variant.

        const result = await delegate.update({
            where: { id },
            data: prismaData,
            include: { variants: true }
        });
        return this.mapToDomain(result);
    }

    @InvalidatesCache({ keys: ["product_list"] })
    async delete(id: string): Promise<void> {
        const delegate = await this.getDelegate();
        if (!delegate) return;
        await delegate.delete({ where: { id } });
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
