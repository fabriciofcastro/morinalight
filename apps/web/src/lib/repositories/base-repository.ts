/**
 * Base Repository Pattern
 * 
 * Abstração de acesso a dados seguindo Repository Pattern
 */

export interface BaseRepository<T> {
    findById(id: string): Promise<T | null>;
    findAll(filters?: any): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
    count(filters?: any): Promise<number>;
}

import { getPrismaClient } from "@/lib/prisma";

/**
 * Implementação abstrata do Repository
 */
export abstract class AbstractRepository<T> implements BaseRepository<T> {
    constructor(protected readonly modelName: string) { }

    protected async getDelegate(): Promise<any> {
        const prisma = await getPrismaClient();
        if (!prisma) {
            console.warn(`[Repository] Prisma not available for ${this.modelName}`);
            return null;
        }
        return (prisma as any)[this.modelName];
    }

    async findById(id: string): Promise<T | null> {
        const delegate = await this.getDelegate();
        if (!delegate) return null;
        return delegate.findUnique({ where: { id } });
    }

    async findAll(filters?: any): Promise<T[]> {
        const delegate = await this.getDelegate();
        if (!delegate) return [];

        const where = this.buildWhereClause(filters);
        const orderBy = this.buildOrderByClause(filters?.orderBy, filters?.order);

        return delegate.findMany({
            where,
            orderBy,
            take: filters?.limit || 50,
            skip: filters?.offset || 0,
        });
    }

    async create(data: Partial<T>): Promise<T> {
        const delegate = await this.getDelegate();
        if (!delegate) throw new Error("Database unavailable");
        return delegate.create({ data });
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        const delegate = await this.getDelegate();
        if (!delegate) throw new Error("Database unavailable");
        return delegate.update({ where: { id }, data });
    }

    async delete(id: string): Promise<void> {
        const delegate = await this.getDelegate();
        if (!delegate) throw new Error("Database unavailable");
        await delegate.delete({ where: { id } });
    }

    async count(filters?: any): Promise<number> {
        const delegate = await this.getDelegate();
        if (!delegate) return 0;
        const where = this.buildWhereClause(filters);
        return delegate.count({ where });
    }

    /**
     * Helpers comuns
     */
    protected buildWhereClause(filters: any): any {
        if (!filters) return {};

        const where: any = {};

        if (filters.search) {
            // Implementar busca genérica se necessário (ex: em campos texto)
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.createdAfter) {
            where.createdAt = { gte: filters.createdAfter };
        }

        // Espalhar outros filtros diretos
        Object.keys(filters).forEach(key => {
            if (["status", "createdAfter", "orderBy", "order", "limit", "offset", "search"].includes(key)) return;
            where[key] = filters[key];
        });

        return where;
    }

    protected buildOrderByClause(orderBy?: string, order: "asc" | "desc" = "desc"): any {
        if (!orderBy) return { createdAt: order };

        return { [orderBy]: order };
    }
}


