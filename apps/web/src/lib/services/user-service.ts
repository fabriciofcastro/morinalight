// Legacy imports - commented out for Clean Architecture migration
// import { container } from "@/lib/di/container";
// import { UserRepository, User } from "@/lib/repositories/user-repository";
// import { eventBus, USER_EVENTS } from "@/lib/events/event-bus";

/**
 * User Service
 * 
 * Implements business logic for User management.
 * Follows SOLID principles:
 * - Single Responsibility: Only handles user logic
 * - Dependency Inversion: Dependencies are injected via property or constructor
 */
// LEGACY CLASS - Commented out for Clean Architecture migration
// export class UserService {
//     private userRepository: UserRepository;
//     private auditService: AuditService;
//     ...
// }

// Placeholder export to prevent build errors
export class UserService {}

// Legacy registration - commented out for Clean Architecture migration
// const userService = new UserService();
// container.register("UserService", userService);
// export { userService };
