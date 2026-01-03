import { AbstractRepository } from "./base-repository";
import { eventBus, USER_EVENTS } from "../events/event-bus";
import { Cached, InvalidatesCache } from "../patterns/caching-decorator";

/**
 * User Interface
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    passwordHash?: string; // Added for AuthStrategy compatibility
    has2FA?: boolean;      // Added for AuthStrategy compatibility
}

export class UserRepository extends AbstractRepository<User> {
    constructor() {
        super("user");
    }

    /**
     * Métodos específicos de User
     */
    @Cached({ ttl: 60 }) // Cache for 60 seconds
    async findByEmail(email: string): Promise<User | null> {
        const delegate = await this.getDelegate();
        if (!delegate) return null;
        return delegate.findUnique({ where: { email } });
    }

    @Cached({ ttl: 300 }) // Cache for 5 minutes
    async findByRole(role: string): Promise<User[]> {
        const delegate = await this.getDelegate();
        if (!delegate) return [];
        return delegate.findMany({ where: { role } });
    }

    async updateLastLogin(id: string): Promise<void> {
        const delegate = await this.getDelegate();
        if (!delegate) return;
        await delegate.update({
            where: { id },
            data: { lastLogin: new Date() },
        });

        await eventBus.emit(USER_EVENTS.LOGIN, { userId: id });
    }

    // Override Base Methods to emit events

    @InvalidatesCache({ keys: ["user_list", "user_email"] }) // Simplified cache invalidation strategy
    async create(data: Partial<User>): Promise<User> {
        const user = await super.create(data);
        await eventBus.emit(USER_EVENTS.CREATED, user);
        return user;
    }

    @InvalidatesCache({ keys: ["user_list", "user_email"] })
    async update(id: string, data: Partial<User>): Promise<User> {
        const user = await super.update(id, data);
        await eventBus.emit(USER_EVENTS.UPDATED, { ...user, changes: data });
        return user;
    }

    @InvalidatesCache({ keys: ["user_list", "user_email"] })
    async delete(id: string): Promise<void> {
        await super.delete(id);
        await eventBus.emit(USER_EVENTS.DELETED, { id });
    }
}

/**
 * Instância singleton
 */
export const userRepository = new UserRepository();
