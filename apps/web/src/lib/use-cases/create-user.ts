import { container } from "@/lib/di/container";
import { UserRepository, User } from "@/lib/repositories/user-repository";
import { eventBus, USER_EVENTS } from "@/lib/events/event-bus";

export interface CreateUserDTO {
    email: string;
    name: string;
    role?: string;
    password?: string;
}

export class CreateUserUseCase {
    private userRepository: UserRepository;

    constructor() {
        // Resolve Repo from DI Container
        try {
            this.userRepository = container.resolve<UserRepository>("UserRepository");
        } catch (e) {
            // Lazy fallback
            const { userRepository } = require("@/lib/repositories/user-repository");
            this.userRepository = userRepository;
        }
    }

    async execute(input: CreateUserDTO): Promise<User> {
        // 1. Validate Input
        if (!input.email || !input.name) {
            throw new Error("Missing required fields: email, name");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            throw new Error("Invalid email format");
        }

        // 2. Validate Business Rules (Uniqueness)
        const existing = await this.userRepository.findByEmail(input.email);
        if (existing) {
            throw new Error("User already exists");
        }

        // 3. Persist
        /* In Clean Arch, we might map DTO to Domain Entity here, but for simplicity we use POJO/Prisma types */
        const newUser: Partial<User> = {
            email: input.email,
            name: input.name,
            role: input.role || "user",
            // password hashing would happen here or in repository
            // passwordHash: await hash(input.password)
        };

        const createdUser = await this.userRepository.create(newUser);

        // 4. Events (Side Effects) are handled by Repository decoration OR explicit emission here.
        // Since we decorated the Repository, it's already handled there!
        // But for explicit Use Case orchestration, we could add UseCase-specific events here if needed.

        return createdUser;
    }
}
