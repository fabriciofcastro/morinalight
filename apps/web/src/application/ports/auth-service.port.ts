import { Credentials } from "@/domain/value-objects";
import { Result } from "@/shared/kernel/types";

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
    requiresTwoFactor?: boolean;
    mustChangePassword?: boolean;
    organizations?: {
        id: string;
        name: string;
        slug: string;
    }[];
}

export interface IAuthService {
    login(credentials: Credentials, remember?: boolean): Promise<Result<AuthUser>>;
    logout(): Promise<Result<void>>;
    getCurrentUser(): Promise<Result<AuthUser>>;
}
