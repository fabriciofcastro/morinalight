/**
 * Sistema Centralizado de Permissões
 * 
 * Define todas as permissões da aplicação de forma tipada e organizada.
 * Use estas constantes em vez de strings literais para:
 * - Autocomplete no IDE
 * - Type safety
 * - Refatoração fácil
 * - Documentação centralizada
 */

// ============================================================================
// TIPOS
// ============================================================================

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ============================================================================
// CONSTANTES DE PERMISSÕES
// ============================================================================

export const PERMISSIONS = {
    // Dashboard
    DASHBOARD_VIEW: 'dashboard:view',

    // Produtos
    PRODUCTS_VIEW: 'products:view',
    PRODUCTS_CREATE: 'products:create',
    PRODUCTS_EDIT: 'products:edit',
    PRODUCTS_DELETE: 'products:delete',

    // Catálogo
    CATALOG_VIEW: 'catalog:view',
    CATALOG_EDIT: 'catalog:edit',

    // Fichas Técnicas
    PRE_FICHAS_VIEW: 'pre-fichas-tecnicas:view',
    PRE_FICHAS_CREATE: 'pre-fichas-tecnicas:create',
    PRE_FICHAS_EDIT: 'pre-fichas-tecnicas:edit',

    // Fichas de Custo
    FICHAS_CUSTO_VIEW: 'fichas-custo:view',
    FICHAS_CUSTO_CREATE: 'fichas-custo:create',
    FICHAS_CUSTO_EDIT: 'fichas-custo:edit',
    FICHAS_CUSTO_DELETE: 'fichas-custo:delete',

    // Clientes
    CLIENTS_VIEW: 'clients:view',
    CLIENTS_CREATE: 'clients:create',
    CLIENTS_EDIT: 'clients:edit',
    CLIENTS_DELETE: 'clients:delete',

    // Fornecedores
    SUPPLIERS_VIEW: 'suppliers:view',
    SUPPLIERS_CREATE: 'suppliers:create',
    SUPPLIERS_EDIT: 'suppliers:edit',
    SUPPLIERS_DELETE: 'suppliers:delete',

    // Representantes
    REPRESENTATIVES_VIEW: 'representatives:view',
    REPRESENTATIVES_CREATE: 'representatives:create',
    REPRESENTATIVES_EDIT: 'representatives:edit',
    REPRESENTATIVES_DELETE: 'representatives:delete',

    // Vendas
    SALES_VIEW: 'sales:view',
    SALES_CREATE: 'sales:create',
    SALES_EDIT: 'sales:edit',

    // Comissões
    COMMISSIONS_VIEW: 'commissions:view',
    COMMISSIONS_MANAGE: 'commissions:manage',

    // Relatórios
    REPORTS_VIEW: 'reports:view',
    REPORTS_EXPORT: 'reports:export',

    // Notificações
    NOTIFICATIONS_VIEW: 'notifications:view',
    NOTIFICATIONS_MANAGE: 'notifications:manage',

    // Configurações - Geral
    SETTINGS_VIEW: 'settings:view',

    // Configurações - Empresa
    SETTINGS_COMPANY_VIEW: 'settings:company:view',
    SETTINGS_COMPANY_EDIT: 'settings:company:edit',

    // Configurações - Estrutura Organizacional
    SETTINGS_ORG_STRUCTURE_VIEW: 'settings:organizational-structure:view',
    SETTINGS_ORG_STRUCTURE_EDIT: 'settings:organizational-structure:edit',

    // Configurações - Usuários
    USERS_VIEW: 'users:view',
    USERS_CREATE: 'users:create',
    USERS_EDIT: 'users:edit',
    USERS_DELETE: 'users:delete',

    // Configurações - Papéis
    SETTINGS_ROLES_VIEW: 'settings:roles:view',
    SETTINGS_ROLES_EDIT: 'settings:roles:edit',

    // Configurações - Permissões
    SETTINGS_PERMISSIONS_VIEW: 'settings:permissions:view',
    SETTINGS_PERMISSIONS_EDIT: 'settings:permissions:edit',

    // Configurações - Equipe
    SETTINGS_TEAM_VIEW: 'settings:team:view',
    SETTINGS_TEAM_MANAGE: 'settings:team:manage',

    // Admin
    ADMIN_FULL_ACCESS: 'admin:*',
} as const;

// ============================================================================
// GRUPOS DE PERMISSÕES
// ============================================================================

export const PERMISSION_GROUPS = {
    PRODUCTS: [
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.PRODUCTS_CREATE,
        PERMISSIONS.PRODUCTS_EDIT,
        PERMISSIONS.PRODUCTS_DELETE,
    ],
    CLIENTS: [
        PERMISSIONS.CLIENTS_VIEW,
        PERMISSIONS.CLIENTS_CREATE,
        PERMISSIONS.CLIENTS_EDIT,
        PERMISSIONS.CLIENTS_DELETE,
    ],
    SUPPLIERS: [
        PERMISSIONS.SUPPLIERS_VIEW,
        PERMISSIONS.SUPPLIERS_CREATE,
        PERMISSIONS.SUPPLIERS_EDIT,
        PERMISSIONS.SUPPLIERS_DELETE,
    ],
    ADMIN: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_EDIT,
        PERMISSIONS.USERS_DELETE,
        PERMISSIONS.SETTINGS_ROLES_VIEW,
        PERMISSIONS.SETTINGS_ROLES_EDIT,
        PERMISSIONS.SETTINGS_PERMISSIONS_VIEW,
        PERMISSIONS.SETTINGS_PERMISSIONS_EDIT,
    ],
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verifica se o usuário tem uma permissão específica
 */
export function hasPermission(
    userPermissions: string[],
    requiredPermission: Permission
): boolean {
    // Admin tem acesso total
    if (userPermissions.includes(PERMISSIONS.ADMIN_FULL_ACCESS)) {
        return true;
    }

    return userPermissions.includes(requiredPermission);
}

/**
 * Verifica se o usuário tem TODAS as permissões especificadas (AND)
 */
export function hasAllPermissions(
    userPermissions: string[],
    requiredPermissions: Permission[]
): boolean {
    if (userPermissions.includes(PERMISSIONS.ADMIN_FULL_ACCESS)) {
        return true;
    }

    return requiredPermissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Verifica se o usuário tem ALGUMA das permissões especificadas (OR)
 */
export function hasAnyPermission(
    userPermissions: string[],
    requiredPermissions: Permission[]
): boolean {
    if (userPermissions.includes(PERMISSIONS.ADMIN_FULL_ACCESS)) {
        return true;
    }

    return requiredPermissions.some((perm) => userPermissions.includes(perm));
}
