import { apiClient as api } from "./base";

export interface Role {
    id: string;
    name: string;
    code: string;
    description?: string;
    scope: string; // GLOBAL, FILIAL, DEPARTAMENTO, SETOR
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoleInput {
    name: string;
    code: string;
    description?: string;
    scope: string;
    active?: boolean;
}

export interface UpdateRoleInput extends Partial<CreateRoleInput> {
    id: string;
}

export interface Permission {
    id: string;
    name: string;
    code: string;
    description?: string;
    module: string;
    level: string; // READ, WRITE, ADMIN
    createdAt: string;
    updatedAt: string;
}

export interface CreatePermissionInput {
    name: string;
    code: string;
    description?: string;
    module: string;
    level: string;
}

export interface UpdatePermissionInput extends Partial<CreatePermissionInput> {
    id: string;
}

export const permissionsApi = {
    // Roles
    getRoles: async () => {
        return api.get<Role[]>("/roles");
    },

    getRole: async (id: string) => {
        return api.get<Role>(`/roles/${id}`);
    },

    createRole: async (data: CreateRoleInput) => {
        return api.post<Role>("/roles", data);
    },

    updateRole: async (data: UpdateRoleInput) => {
        const { id, ...body } = data;
        return api.put<Role>(`/roles/${id}`, body);
    },

    deleteRole: async (id: string) => {
        return api.delete(`/roles/${id}`);
    },

    // Permissions
    getPermissions: async () => {
        return api.get<Permission[]>("/permissions");
    },

    getPermission: async (id: string) => {
        return api.get<Permission>(`/permissions/${id}`);
    },

    createPermission: async (data: CreatePermissionInput) => {
        return api.post<Permission>("/permissions", data);
    },

    updatePermission: async (data: UpdatePermissionInput) => {
        const { id, ...body } = data;
        return api.put<Permission>(`/permissions/${id}`, body);
    },

    deletePermission: async (id: string) => {
        return api.delete(`/permissions/${id}`);
    },
};
