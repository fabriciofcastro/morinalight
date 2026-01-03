/**
 * TanStack Query Configuration
 * 
 * Configuração global do React Query para gerenciamento de estado do servidor
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Cliente global do React Query
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache por 5 minutos
            staleTime: 5 * 60 * 1000,
            // Manter em cache por 10 minutos
            gcTime: 10 * 60 * 1000,
            // Retry 3 vezes em caso de erro
            retry: 3,
            // Delay entre retries (exponential backoff)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Não refetch ao focar na janela (já temos circuit breaker)
            refetchOnWindowFocus: false,
            // Refetch ao reconectar
            refetchOnReconnect: true,
            // Refetch em mount apenas se stale
            refetchOnMount: "if-stale",
        },
        mutations: {
            // Retry mutations 2 vezes
            retry: 2,
            // Delay entre retries
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        },
    },
});

/**
 * Configurações específicas por tipo de query
 */
export const queryConfigs = {
    /**
     * Para dados que mudam raramente (ex: configurações, permissões)
     */
    static: {
        staleTime: 30 * 60 * 1000, // 30 minutos
        gcTime: 60 * 60 * 1000, // 1 hora
    },

    /**
     * Para dados que mudam frequentemente (ex: notificações, status)
     */
    realtime: {
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 2 * 60 * 1000, // 2 minutos
        refetchInterval: 30 * 1000, // Refetch a cada 30s
    },

    /**
     * Para dados de listagem com paginação
     */
    paginated: {
        staleTime: 2 * 60 * 1000, // 2 minutos
        gcTime: 5 * 60 * 1000, // 5 minutos
        keepPreviousData: true, // Manter dados anteriores durante loading
    },

    /**
     * Para dados infinitos (infinite scroll)
     */
    infinite: {
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    },
};

/**
 * Query keys factory para consistência
 */
export const queryKeys = {
    // Auth
    auth: {
        all: ["auth"] as const,
        user: () => [...queryKeys.auth.all, "user"] as const,
        session: () => [...queryKeys.auth.all, "session"] as const,
    },

    // Users
    users: {
        all: ["users"] as const,
        lists: () => [...queryKeys.users.all, "list"] as const,
        list: (filters: Record<string, any>) =>
            [...queryKeys.users.lists(), filters] as const,
        details: () => [...queryKeys.users.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.users.details(), id] as const,
    },

    // Products
    products: {
        all: ["products"] as const,
        lists: () => [...queryKeys.products.all, "list"] as const,
        list: (filters: Record<string, any>) =>
            [...queryKeys.products.lists(), filters] as const,
        details: () => [...queryKeys.products.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.products.details(), id] as const,
    },

    // Organizations
    organizations: {
        all: ["organizations"] as const,
        lists: () => [...queryKeys.organizations.all, "list"] as const,
        list: (filters: Record<string, any>) =>
            [...queryKeys.organizations.lists(), filters] as const,
        details: () => [...queryKeys.organizations.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.organizations.details(), id] as const,
    },

    // Permissions
    permissions: {
        all: ["permissions"] as const,
        user: (userId: string) => [...queryKeys.permissions.all, "user", userId] as const,
        role: (roleId: string) => [...queryKeys.permissions.all, "role", roleId] as const,
    },

    // Notifications
    notifications: {
        all: ["notifications"] as const,
        unread: () => [...queryKeys.notifications.all, "unread"] as const,
        list: (filters: Record<string, any>) =>
            [...queryKeys.notifications.all, "list", filters] as const,
    },
};
