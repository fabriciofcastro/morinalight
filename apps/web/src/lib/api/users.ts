/**
 * Users API - Migrated to Factory Pattern
 */

import { createTypedApiClient } from "./factory";

export interface User {
    userId: string;
    email: string;
    displayName: string;
    status: "active" | "inactive";
    createdAt: string;
    lastLogin?: string;
    has2FA?: boolean;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    displayName: string;
}

export interface UpdateUserRequest {
    displayName?: string;
    status?: "active" | "inactive";
}

// Usar factory pattern para métodos CRUD padrão
const baseUsersApi = createTypedApiClient<User>("/users");

// Estender com métodos customizados
export const usersApi = {
    ...baseUsersApi,

    // Métodos customizados específicos de usuários
    resetPassword: async (userId: string): Promise<void> => {
        const { apiClient } = await import("./base");
        return apiClient.post<void>(`/users/${userId}/reset-password`, {});
    },

    enable2FA: async (userId: string): Promise<void> => {
        const { apiClient } = await import("./base");
        return apiClient.post<void>(`/users/${userId}/2fa/enable`, {});
    },

    disable2FA: async (userId: string): Promise<void> => {
        const { apiClient } = await import("./base");
        return apiClient.post<void>(`/users/${userId}/2fa/disable`, {});
    },

    // Bulk operations
    bulkDelete: async (userIds: string[]): Promise<void> => {
        const { apiClient } = await import("./base");
        return apiClient.post<void>("/users/bulk-delete", { userIds });
    },

    bulkUpdateStatus: async (
        userIds: string[],
        status: "active" | "inactive",
    ): Promise<void> => {
        const { apiClient } = await import("./base");
        return apiClient.post<void>("/users/bulk-update-status", { userIds, status });
    },
};
