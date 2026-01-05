/**
 * PermissionKeys
 * Single source of truth for all permission strings in the system.
 * Format: context:resource:action or resource:action
 */
export declare const PermissionKeys: {
    readonly DASHBOARD_VIEW: "dashboard:view";
    readonly PRODUCTS_VIEW: "products:view";
    readonly PRODUCTS_CREATE: "products:create";
    readonly PRODUCTS_EDIT: "products:edit";
    readonly PRODUCTS_EDIT_OWN: "products:edit:own";
    readonly PRODUCTS_DELETE: "products:delete";
    readonly CATALOG_VIEW: "catalog:view";
    readonly CATEGORIES_MANAGE: "categories:manage";
    readonly CLIENTS_VIEW: "clients:view";
    readonly CLIENTS_CREATE: "clients:create";
    readonly CLIENTS_EDIT: "clients:edit";
    readonly CLIENTS_DELETE: "clients:delete";
    readonly CLIENTS_EXPORT: "clients:export";
    readonly CLIENTS_IMPORT: "clients:import";
    readonly SUPPLIERS_VIEW: "suppliers:view";
    readonly SUPPLIERS_CREATE: "suppliers:create";
    readonly SUPPLIERS_EDIT: "suppliers:edit";
    readonly SUPPLIERS_DELETE: "suppliers:delete";
    readonly SALES_VIEW: "sales:view";
    readonly SALES_CREATE: "sales:create";
    readonly SALES_EDIT: "sales:edit";
    readonly SALES_APPROVE: "sales:approve";
    readonly COMMISSIONS_VIEW: "commissions:view";
    readonly COMMISSIONS_PAY: "commissions:pay";
    readonly COMMISSIONS_CALCULATE: "commissions:calculate";
    readonly REPRESENTATIVES_VIEW: "representatives:view";
    readonly REPRESENTATIVES_CREATE: "representatives:create";
    readonly REPRESENTATIVES_EDIT: "representatives:edit";
    readonly REPORTS_VIEW: "reports:view";
    readonly SETTINGS_VIEW: "settings:view";
    readonly WORKFLOWS_VIEW: "workflows:view";
    readonly WORKFLOWS_MANAGE: "workflows:manage";
    readonly SETTINGS_COMPANY_VIEW: "settings:company:view";
    readonly SETTINGS_COMPANY_EDIT: "settings:company:edit";
    readonly BRANCHES_VIEW: "branches:view";
    readonly BRANCHES_MANAGE: "branches:manage";
    readonly DEPARTMENTS_VIEW: "departments:view";
    readonly DEPARTMENTS_MANAGE: "departments:manage";
    readonly SECTORS_VIEW: "sectors:view";
    readonly SECTORS_MANAGE: "sectors:manage";
    readonly POSITIONS_VIEW: "positions:view";
    readonly POSITIONS_MANAGE: "positions:manage";
    readonly SETTINGS_TEAM_VIEW: "settings:team:view";
    readonly USERS_VIEW: "users:view";
    readonly USERS_MANAGE: "users:manage";
    readonly ROLES_VIEW: "roles:view";
    readonly ROLES_MANAGE: "roles:manage";
    readonly PERMISSIONS_VIEW: "permissions:view";
    readonly PERMISSIONS_MANAGE: "permissions:manage";
    readonly AUDIT_VIEW: "audit:view";
    readonly SYSTEM_HEALTH_VIEW: "system:health:view";
    readonly LOGS_VIEW: "logs:view";
};
export type PermissionKey = typeof PermissionKeys[keyof typeof PermissionKeys];
