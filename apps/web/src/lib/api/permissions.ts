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
    type RoleItemDto = {
      roleId: string;
      name: string;
      code: string;
      description?: string | null;
      scope: string;
      active?: boolean | null;
      createdAt?: unknown;
      updatedAt?: unknown;
    };
    const data = await api.get<{ itens: RoleItemDto[] }>("/roles");
    return (data.itens ?? []).map((r) => ({
      id: r.roleId,
      name: r.name,
      code: r.code,
      description: r.description ?? undefined,
      scope: r.scope,
      active: Boolean(r.active),
      createdAt: String(r.createdAt),
      updatedAt: String(r.updatedAt),
    })) as Role[];
  },

  getRole: async (id: string) => {
    type RoleDto = {
      roleId: string;
      name: string;
      code: string;
      description?: string | null;
      scope: string;
      active?: boolean | null;
      createdAt?: unknown;
      updatedAt?: unknown;
    };
    const r = await api.get<RoleDto>(`/roles/${id}`);
    return {
      id: r.roleId,
      name: r.name,
      code: r.code,
      description: r.description ?? undefined,
      scope: r.scope,
      active: Boolean(r.active),
      createdAt: String(r.createdAt),
      updatedAt: String(r.updatedAt),
    } as Role;
  },

  createRole: async (data: CreateRoleInput) => {
    const payload = {
      name: data.name,
      code: data.code,
      description: data.description,
      scope: data.scope,
      active: data.active ?? true,
    };
    type RoleDto = {
      roleId: string;
      name: string;
      code: string;
      description?: string | null;
      scope: string;
      active?: boolean | null;
      createdAt?: unknown;
      updatedAt?: unknown;
    };
    const r = await api.post<RoleDto>("/roles", payload);
    return {
      id: r.roleId,
      name: r.name,
      code: r.code,
      description: r.description ?? undefined,
      scope: r.scope,
      active: Boolean(r.active),
      createdAt: String(r.createdAt),
      updatedAt: String(r.updatedAt),
    } as Role;
  },

  updateRole: async (data: UpdateRoleInput) => {
    const { id, ...body } = data;
    type RoleDto = {
      roleId: string;
      name: string;
      code: string;
      description?: string | null;
      scope: string;
      active?: boolean | null;
      createdAt?: unknown;
      updatedAt?: unknown;
    };
    const r = await api.put<RoleDto>(`/roles/${id}`, body);
    return {
      id: r.roleId,
      name: r.name,
      code: r.code,
      description: r.description ?? undefined,
      scope: r.scope,
      active: Boolean(r.active),
      createdAt: String(r.createdAt),
      updatedAt: String(r.updatedAt),
    } as Role;
  },

  deleteRole: async (id: string) => {
    return api.delete(`/roles/${id}`);
  },

  // Permissions
  getPermissions: async () => {
    type PermissionItemDto = {
      permissionId: string;
      name: string;
      description?: string | null;
      module: string;
      resource: string;
      action: string;
      createdAt?: unknown;
      updatedAt?: unknown;
    };
    const data = await api.get<{ itens: PermissionItemDto[] }>("/permissions");
    return (data.itens ?? []).map((p) => ({
      id: p.permissionId,
      name: p.name,
      code: `${p.resource}:${p.action}`,
      description: p.description ?? undefined,
      module: p.module,
      level: p.action,
      createdAt: String(p.createdAt),
      updatedAt: String(p.updatedAt),
    })) as Permission[];
  },

  getPermission: async (id: string) => {
    type PermissionDto = {
      permissionId?: string;
      id?: string;
      name: string;
      description?: string | null;
      module: string;
      resource?: string;
      action?: string;
      code?: string;
      level?: string;
      createdAt?: unknown;
      updatedAt?: unknown;
    };
    const p = await api.get<PermissionDto>(`/permissions/${id}`);
    return {
      id: p.permissionId ?? p.id ?? id,
      name: p.name,
      code: p.code ?? `${p.resource}:${p.action}`,
      description: p.description ?? undefined,
      module: p.module,
      level: p.action ?? p.level,
      createdAt: String(p.createdAt),
      updatedAt: String(p.updatedAt),
    } as Permission;
  },

  createPermission: async (data: CreatePermissionInput) => {
    const [resource, action] = data.code.includes(":")
      ? data.code.split(":", 2)
      : [data.code, data.level];
    const payload = {
      name: data.name,
      description: data.description,
      module: data.module,
      category: data.module,
      resource,
      action: action || data.level,
    };
    type PermissionDto = {
      permissionId: string;
      name: string;
      description?: string | null;
      module: string;
      resource: string;
      action: string;
      createdAt?: unknown;
      updatedAt?: unknown;
    };
    const p = await api.post<PermissionDto>("/permissions", payload);
    return {
      id: p.permissionId,
      name: p.name,
      code: `${p.resource}:${p.action}`,
      description: p.description ?? undefined,
      module: p.module,
      level: p.action,
      createdAt: String(p.createdAt),
      updatedAt: String(p.updatedAt),
    } as Permission;
  },

  updatePermission: async (data: UpdatePermissionInput) => {
    const { id, ...body } = data;
    const payload: Record<string, unknown> = { ...body };
    if (body.code && typeof body.code === "string" && body.code.includes(":")) {
      const [resource, action] = body.code.split(":", 2);
      payload.resource = resource;
      payload.action = action;
    }
    type PermissionDto = {
      permissionId: string;
      name: string;
      description?: string | null;
      module: string;
      resource: string;
      action: string;
      createdAt?: unknown;
      updatedAt?: unknown;
    };
    const p = await api.put<PermissionDto>(`/permissions/${id}`, payload);
    return {
      id: p.permissionId,
      name: p.name,
      code: `${p.resource}:${p.action}`,
      description: p.description ?? undefined,
      module: p.module,
      level: p.action,
      createdAt: String(p.createdAt),
      updatedAt: String(p.updatedAt),
    } as Permission;
  },

  deletePermission: async (id: string) => {
    return api.delete(`/permissions/${id}`);
  },

  assignPermissionsToUser: async (
    userId: string,
    permissionIds: string[],
    options?: { granted?: boolean; reason?: string },
  ) => {
    const payload = {
      entityType: "user",
      entityId: userId,
      permissionIds,
      granted: options?.granted ?? true,
      reason: options?.reason,
    };
    await api.post("/permissions/bulk-assign", payload);
  },
};
