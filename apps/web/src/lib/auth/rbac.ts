/**
 * RBAC (Role-Based Access Control) System
 * 
 * Sistema completo de controle de acesso baseado em papéis
 */

// ===== ROLES =====

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    SUPERVISOR: 'supervisor',
    USER: 'user',
    GUEST: 'guest',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// ===== RESOURCES =====

export const RESOURCES = {
    USERS: 'users',
    PRODUCTS: 'products',
    ORDERS: 'orders',
    CLIENTS: 'clients',
    SUPPLIERS: 'suppliers',
    REPORTS: 'reports',
    SETTINGS: 'settings',
    AUDIT_LOGS: 'audit_logs',
    PERMISSIONS: 'permissions',
} as const;

export type Resource = typeof RESOURCES[keyof typeof RESOURCES];

// ===== ACTIONS =====

export const ACTIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    EXPORT: 'export',
    IMPORT: 'import',
    APPROVE: 'approve',
    REJECT: 'reject',
} as const;

export type Action = typeof ACTIONS[keyof typeof ACTIONS];

// ===== PERMISSIONS =====

export type Permission = `${Resource}:${Action}`;

/**
 * Mapa de permissões por papel
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [ROLES.SUPER_ADMIN]: [
        // Acesso total a tudo
        'users:create', 'users:read', 'users:update', 'users:delete',
        'products:create', 'products:read', 'products:update', 'products:delete', 'products:export', 'products:import',
        'orders:create', 'orders:read', 'orders:update', 'orders:delete', 'orders:approve', 'orders:reject',
        'clients:create', 'clients:read', 'clients:update', 'clients:delete',
        'suppliers:create', 'suppliers:read', 'suppliers:update', 'suppliers:delete',
        'reports:read', 'reports:export',
        'settings:read', 'settings:update',
        'audit_logs:read',
        'permissions:read', 'permissions:update',
    ],

    [ROLES.ADMIN]: [
        'users:create', 'users:read', 'users:update',
        'products:create', 'products:read', 'products:update', 'products:delete', 'products:export',
        'orders:create', 'orders:read', 'orders:update', 'orders:approve',
        'clients:create', 'clients:read', 'clients:update', 'clients:delete',
        'suppliers:create', 'suppliers:read', 'suppliers:update',
        'reports:read', 'reports:export',
        'settings:read',
        'audit_logs:read',
    ],

    [ROLES.MANAGER]: [
        'users:read',
        'products:create', 'products:read', 'products:update', 'products:export',
        'orders:create', 'orders:read', 'orders:update',
        'clients:create', 'clients:read', 'clients:update',
        'suppliers:read',
        'reports:read', 'reports:export',
    ],

    [ROLES.SUPERVISOR]: [
        'products:read', 'products:update',
        'orders:read', 'orders:update',
        'clients:read', 'clients:update',
        'reports:read',
    ],

    [ROLES.USER]: [
        'products:read',
        'orders:read',
        'clients:read',
    ],

    [ROLES.GUEST]: [
        'products:read',
    ],
};

/**
 * Verifica se um papel tem uma permissão específica
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Verifica se um papel tem permissão para uma ação em um recurso
 */
export function can(role: Role, action: Action, resource: Resource): boolean {
    const permission: Permission = `${resource}:${action}`;
    return hasPermission(role, permission);
}

/**
 * Obtém todas as permissões de um papel
 */
export function getPermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Verifica se um papel tem pelo menos uma das permissões
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Verifica se um papel tem todas as permissões
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Hierarquia de papéis (para herança de permissões)
 */
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
    [ROLES.SUPER_ADMIN]: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.USER, ROLES.GUEST],
    [ROLES.ADMIN]: [ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.USER, ROLES.GUEST],
    [ROLES.MANAGER]: [ROLES.SUPERVISOR, ROLES.USER, ROLES.GUEST],
    [ROLES.SUPERVISOR]: [ROLES.USER, ROLES.GUEST],
    [ROLES.USER]: [ROLES.GUEST],
    [ROLES.GUEST]: [],
};

/**
 * Verifica se um papel herda de outro
 */
export function inheritsFrom(role: Role, targetRole: Role): boolean {
    return ROLE_HIERARCHY[role]?.includes(targetRole) ?? false;
}

/**
 * Interface para usuário com permissões
 */
export interface UserWithPermissions {
    id: string;
    email: string;
    role: Role;
    customPermissions?: Permission[];
}

/**
 * Verifica permissão considerando permissões customizadas
 */
export function userHasPermission(
    user: UserWithPermissions,
    permission: Permission,
): boolean {
    // Verificar permissões customizadas primeiro
    if (user.customPermissions?.includes(permission)) {
        return true;
    }

    // Verificar permissões do papel
    return hasPermission(user.role, permission);
}

/**
 * Verifica se usuário pode executar ação em recurso
 */
export function userCan(
    user: UserWithPermissions,
    action: Action,
    resource: Resource,
): boolean {
    const permission: Permission = `${resource}:${action}`;
    return userHasPermission(user, permission);
}
