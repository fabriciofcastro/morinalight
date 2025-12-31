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
    PRODUCTS: '/products',
    PRODUCTS_NEW: '/products/new',
    PRODUCTS_EDIT: (id: string) => `/products/${id}/edit`,

    // Catálogo
    CATALOG: '/catalogo/auditoria',

    // Fichas Técnicas
    PRE_FICHAS: '/pre-fichas-tecnicas',
    PRE_FICHAS_NEW: '/pre-fichas-tecnicas/new',

    // Fichas de Custo
    FICHAS_CUSTO: '/fichas-custo',
    FICHAS_CUSTO_LIST: '/fichas-custo/list',
    FICHAS_CUSTO_NEW: '/fichas-custo/new',
    FICHAS_CUSTO_STATUS: '/fichas-custo/status-customizados',

    // Clientes
    CLIENTS: '/clientes',
    CLIENTS_NEW: '/clientes/new',
    CLIENTS_EDIT: (id: string) => `/clientes/${id}/edit`,

    // Fornecedores
    SUPPLIERS: '/fornecedores',
    SUPPLIERS_LIST: '/fornecedores/list',
    SUPPLIERS_NEW: '/fornecedores/new',
    SUPPLIERS_EDIT: (id: string) => `/fornecedores/${id}/edit`,
    SUPPLIERS_IMPORT: '/fornecedores/import',

    // Representantes
    REPRESENTATIVES: '/representantes',

    // Vendas
    SALES: '/sales',

    // Comissões
    COMMISSIONS: '/comissoes',

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
