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

/**
 * Implementação abstrata do Repository
 */
export abstract class AbstractRepository<T> implements BaseRepository<T> {
    constructor(protected readonly modelName: string) { }

    abstract findById(id: string): Promise<T | null>;
    abstract findAll(filters?: any): Promise<T[]>;
    abstract create(data: Partial<T>): Promise<T>;
    abstract update(id: string, data: Partial<T>): Promise<T>;
    abstract delete(id: string): Promise<void>;
    abstract count(filters?: any): Promise<number>;

    /**
     * Helpers comuns
     */
    protected buildWhereClause(filters: any): any {
        const where: any = {};

        if (filters.search) {
            // Implementar busca
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.createdAfter) {
            where.createdAt = { gte: filters.createdAfter };
        }

        return where;
    }

    protected buildOrderByClause(orderBy?: string, order: "asc" | "desc" = "desc"): any {
        if (!orderBy) return { createdAt: order };

        return { [orderBy]: order };
    }
}

/**
 * EXEMPLO: User Repository
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class UserRepository extends AbstractRepository<User> {
    constructor() {
        super("user");
    }

    async findById(id: string): Promise<User | null> {
        // TODO: Implementar com Prisma
        // return prisma.user.findUnique({ where: { id } });
        return null;
    }

    async findAll(filters?: any): Promise<User[]> {
        const where = this.buildWhereClause(filters);
        const orderBy = this.buildOrderByClause(filters?.orderBy, filters?.order);

        // return prisma.user.findMany({
        //   where,
        //   orderBy,
        //   take: filters?.limit || 50,
        //   skip: filters?.offset || 0,
        // });

        return [];
    }

    async create(data: Partial<User>): Promise<User> {
        // return prisma.user.create({ data });
        return {} as User;
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        // return prisma.user.update({ where: { id }, data });
        return {} as User;
    }

    async delete(id: string): Promise<void> {
        // await prisma.user.delete({ where: { id } });
    }

    async count(filters?: any): Promise<number> {
        const where = this.buildWhereClause(filters);
        // return prisma.user.count({ where });
        return 0;
    }

    /**
     * Métodos específicos de User
     */
    async findByEmail(email: string): Promise<User | null> {
        // return prisma.user.findUnique({ where: { email } });
        return null;
    }

    async findByRole(role: string): Promise<User[]> {
        // return prisma.user.findMany({ where: { role } });
        return [];
    }

    async updateLastLogin(id: string): Promise<void> {
        // await prisma.user.update({
        //   where: { id },
        //   data: { lastLogin: new Date() },
        // });
    }
}

/**
 * Instância singleton
 */
export const userRepository = new UserRepository();
