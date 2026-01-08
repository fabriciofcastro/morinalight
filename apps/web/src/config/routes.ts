/**
 * Constantes de Rotas da Aplicação
 * 
 * Centraliza todas as rotas para:
 * - Evitar typos
 * - Facilitar refatoração
 * - Documentar estrutura
 * - Autocomplete no IDE
 */

// ============================================================================
// ROTAS PÚBLICAS
// ============================================================================

export const PUBLIC_ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    SELECT_ORG: '/select-organization',
    INVITE: (token: string) => `/invite/${token}`,
} as const;

// ============================================================================
// ROTAS DA APLICAÇÃO
// ============================================================================

export const APP_ROUTES = {
    // Dashboard
    DASHBOARD: '/dashboard',

    // Produtos
    PRODUCTS: '/admin/products/list',
    PRODUCTS_NEW: '/admin/products/new',
    PRODUCTS_EDIT: (id: string) => `/admin/products/${id}/edit`,

    // Catálogo
    CATALOG: '/admin/catalog/auditoria',

    // Fichas Técnicas
    PRE_FICHAS: '/admin/pre-technical-sheets',
    PRE_FICHAS_NEW: '/admin/pre-technical-sheets/new',

    // Fichas de Custo
    FICHAS_CUSTO: '/admin/cost-sheets',
    FICHAS_CUSTO_LIST: '/admin/cost-sheets/list',
    FICHAS_CUSTO_NEW: '/admin/cost-sheets/new',
    FICHAS_CUSTO_STATUS: '/admin/cost-sheets/status-customizados',

    // Clientes
    CLIENTS: '/admin/clients',
    CLIENTS_NEW: '/admin/clients/new',
    CLIENTS_EDIT: (id: string) => `/admin/clients/${id}/edit`,

    // Fornecedores
    SUPPLIERS: '/admin/suppliers',
    SUPPLIERS_LIST: '/admin/suppliers/list',
    SUPPLIERS_NEW: '/admin/suppliers/new',
    SUPPLIERS_EDIT: (id: string) => `/admin/suppliers/${id}/edit`,
    SUPPLIERS_IMPORT: '/admin/suppliers/import',

    // Representantes
    REPRESENTATIVES: '/admin/representatives',

    // Vendas
    SALES: '/admin/sales',

    // Comissões
    COMMISSIONS: '/admin/commissions',

    // Relatórios
    REPORTS: '/reports',

    // Notificações
    NOTIFICATIONS: '/notifications',

    // Perfil
    PROFILE: '/profile',

    // Configurações
    SETTINGS: '/settings',
    SETTINGS_COMPANY: '/admin/company/edit',
    SETTINGS_ORG_STRUCTURE: '/settings/organizational-structure',
    SETTINGS_TEAM: '/settings/team',
    SETTINGS_USERS: '/settings/users',
    SETTINGS_PROFILES: '/settings/profiles',
    SETTINGS_INVITES: '/settings/invites',
    SETTINGS_NOTIFICATIONS: '/settings/notifications/preferences',
    SETTINGS_NOTIFICATIONS_HISTORY: '/settings/notifications/history',

    // Admin - Estrutura Organizacional
    ADMIN_BRANCHES: '/admin/branches',
    ADMIN_DEPARTMENTS: '/admin/departments',
    ADMIN_SECTORS: '/admin/sectors',
    ADMIN_POSITIONS: '/admin/positions',

    // Admin - Acesso
    ADMIN_USERS: '/admin/users/list',
    ADMIN_USERS_NEW: '/admin/users/new',
    ADMIN_ROLES: '/admin/roles',
    ADMIN_PERMISSIONS: '/admin/permissions/dashboard',
    ADMIN_CERTIFICATIONS: '/admin/certifications',

    // Admin - Outros
    ADMIN_CHECKLIST: '/admin/checklist',
} as const;

// ============================================================================
// ROTAS LEGAIS
// ============================================================================

export const LEGAL_ROUTES = {
    TERMS: '/termos',
    PRIVACY: '/privacidade',
    LGPD: '/lgpd',
    COOKIES: '/cookies',
    ANTIFRAUDE: '/antifraude',
    VINCULO_EMPREGATICIO: '/vinculo-empregaticio',
    LEI_REPRESENTANTE: '/lei-representante',
    RETENCAO_LOGS: '/retencao-logs',
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Combina todas as rotas em um único objeto
 */
export const ROUTES = {
    ...PUBLIC_ROUTES,
    ...APP_ROUTES,
    ...LEGAL_ROUTES,
} as const;

/**
 * Verifica se uma rota é pública
 */
export function isPublicRoute(path: string): boolean {
    const publicPaths = Object.values(PUBLIC_ROUTES).filter(
        (route) => typeof route === 'string'
    );
    return publicPaths.some((route) => path.startsWith(route));
}

/**
 * Verifica se uma rota é legal
 */
export function isLegalRoute(path: string): boolean {
    const legalPaths = Object.values(LEGAL_ROUTES);
    return legalPaths.some((route) => path.startsWith(route));
}
