/**
 * PermissionKeys
 * Single source of truth for all permission strings in the system.
 * Format: context:resource:action or resource:action
 */

export const PermissionKeys = {
    // --- DASHBOARD ---
    DASHBOARD_VIEW: 'dashboard:view',

    // --- PRODUCTS & CATALOG ---
    PRODUCTS_VIEW: 'products:view',
    PRODUCTS_CREATE: 'products:create',
    PRODUCTS_EDIT: 'products:edit',
    PRODUCTS_EDIT_OWN: 'products:edit:own',
    PRODUCTS_DELETE: 'products:delete',
    CATALOG_VIEW: 'catalog:view',
    CATEGORIES_MANAGE: 'categories:manage',

    // --- CLIENTS ---
    CLIENTS_VIEW: 'clients:view',
    CLIENTS_CREATE: 'clients:create',
    CLIENTS_EDIT: 'clients:edit',
    CLIENTS_DELETE: 'clients:delete',
    CLIENTS_EXPORT: 'clients:export',
    CLIENTS_IMPORT: 'clients:import',

    // --- SUPPLIERS ---
    SUPPLIERS_VIEW: 'suppliers:view',
    SUPPLIERS_CREATE: 'suppliers:create',
    SUPPLIERS_EDIT: 'suppliers:edit',
    SUPPLIERS_DELETE: 'suppliers:delete',

    // --- SALES & ORDERS ---
    SALES_VIEW: 'sales:view',
    SALES_CREATE: 'sales:create',
    SALES_EDIT: 'sales:edit',
    SALES_APPROVE: 'sales:approve',

    // --- COMMISSIONS ---
    COMMISSIONS_VIEW: 'commissions:view',
    COMMISSIONS_PAY: 'commissions:pay',
    COMMISSIONS_CALCULATE: 'commissions:calculate',

    // --- REPRESENTATIVES ---
    REPRESENTATIVES_VIEW: 'representatives:view',
    REPRESENTATIVES_CREATE: 'representatives:create',
    REPRESENTATIVES_EDIT: 'representatives:edit',

    // --- REPORTS ---
    REPORTS_VIEW: 'reports:view',

    // --- SETTINGS (ADMIN) ---
    SETTINGS_VIEW: 'settings:view',

    // Workflow
    WORKFLOWS_VIEW: 'workflows:view',
    WORKFLOWS_CREATE: 'workflows:create',
    WORKFLOWS_EDIT: 'workflows:edit',
    WORKFLOWS_DELETE: 'workflows:delete',
    WORKFLOWS_MANAGE: 'workflows:manage',

    // Company
    SETTINGS_COMPANY_VIEW: 'settings:company:view',
    SETTINGS_COMPANY_EDIT: 'settings:company:edit',

    // Organizational Structure
    BRANCHES_VIEW: 'branches:view',
    BRANCHES_CREATE: 'branches:create',
    BRANCHES_EDIT: 'branches:edit',
    BRANCHES_DELETE: 'branches:delete',
    BRANCHES_MANAGE: 'branches:manage',
    DEPARTMENTS_VIEW: 'departments:view',
    DEPARTMENTS_CREATE: 'departments:create',
    DEPARTMENTS_EDIT: 'departments:edit',
    DEPARTMENTS_DELETE: 'departments:delete',
    DEPARTMENTS_MANAGE: 'departments:manage',
    SECTORS_VIEW: 'sectors:view',
    SECTORS_CREATE: 'sectors:create',
    SECTORS_EDIT: 'sectors:edit',
    SECTORS_DELETE: 'sectors:delete',
    SECTORS_MANAGE: 'sectors:manage',
    POSITIONS_VIEW: 'positions:view',
    POSITIONS_CREATE: 'positions:create',
    POSITIONS_EDIT: 'positions:edit',
    POSITIONS_DELETE: 'positions:delete',
    POSITIONS_MANAGE: 'positions:manage',

    // Access Control
    SETTINGS_TEAM_VIEW: 'settings:team:view',
    USERS_VIEW: 'users:view',
    USERS_CREATE: 'users:create',
    USERS_EDIT: 'users:edit',
    USERS_DELETE: 'users:delete',
    USERS_MANAGE: 'users:manage',
    ROLES_VIEW: 'roles:view',
    ROLES_CREATE: 'roles:create',
    ROLES_EDIT: 'roles:edit',
    ROLES_DELETE: 'roles:delete',
    ROLES_MANAGE: 'roles:manage',
    PERMISSIONS_VIEW: 'permissions:view', // Correctly mapped now!
    PERMISSIONS_CREATE: 'permissions:create',
    PERMISSIONS_EDIT: 'permissions:edit',
    PERMISSIONS_DELETE: 'permissions:delete',
    PERMISSIONS_MANAGE: 'permissions:manage',

    // Audit
    AUDIT_VIEW: 'audit:view',

    // --- INFRASTRUCTURE ---
    SYSTEM_HEALTH_VIEW: 'system:health:view',
    LOGS_VIEW: 'logs:view',
} as const;

export type PermissionKey = typeof PermissionKeys[keyof typeof PermissionKeys];
