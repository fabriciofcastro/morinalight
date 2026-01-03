import { container } from "@/lib/di/container";
import { UserRepository, User } from "@/lib/repositories/user-repository";
import { eventBus, USER_EVENTS } from "@/lib/events/event-bus";
import { AuditService } from "@/lib/audit/audit-service";

/**
 * User Service
 * 
 * Implements business logic for User management.
 * Follows SOLID principles:
 * - Single Responsibility: Only handles user logic
 * - Dependency Inversion: Dependencies are injected via property or constructor
 */
export class UserService {
    private userRepository: UserRepository;
    private auditService: AuditService;

    constructor() {
        // Resolve dependencies from Container
        // Note: In a stricter DI setup, these would be passed in constructor
        // but for now we follow the Service Locator pattern variant supported by container.ts
        try {
            this.userRepository = container.resolve<UserRepository>("UserRepository");
        } catch (e) {
            // Fallback or explicit register if not found (lazy init)
            const { userRepository } = require("@/lib/repositories/user-repository");
            container.register("UserRepository", userRepository);
            this.userRepository = userRepository;
        }

        try {
            this.auditService = container.resolve<AuditService>("AuditService");
        } catch (e) {
            const { auditService } = require("@/lib/audit/audit-service");
            container.register("AuditService", auditService);
            this.auditService = auditService;
        }
    }

    /**
     * Create a new user with business validation
     */
    async createUser(data: Partial<User>): Promise<User> {
        // 1. Business Validation
        if (!data.email) {
            throw new Error("Email is required");
        }

        const existing = await this.userRepository.findByEmail(data.email);
        if (existing) {
            throw new Error("User with this email already exists");
        }

        // 2. Create User (Repository handles Event Emission)
        const user = await this.userRepository.create(data);

        // 3. Additional Logic (e.g. Send Welcome Email)
        // This is decoupled via EventBus, so we don't need to import EmailService here directly
        // The subscriber in audit-subscriber.ts or notification-subscriber.ts will handle it.

        return user;
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }
}

// Register Self
const userService = new UserService();
container.register("UserService", userService);

export { userService };
