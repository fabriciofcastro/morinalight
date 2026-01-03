/**
 * Users Query Hooks
 * 
 * Hooks do TanStack Query para gerenciar estado de usuários
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTypedApiClient, type QueryParams } from "@/lib/api/factory";
import { queryKeys, queryConfigs } from "@/lib/query/client";

/**
 * Tipo de usuário (ajustar conforme seu schema)
 */
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * API client para usuários
 */
const usersApi = createTypedApiClient<User>("/users");

/**
 * Hook para listar usuários
 */
export function useUsers(params?: QueryParams) {
    return useQuery({
        queryKey: queryKeys.users.list(params || {}),
        queryFn: () => usersApi.list(params),
        ...queryConfigs.paginated,
    });
}

/**
 * Hook para obter um usuário específico
 */
export function useUser(id: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: () => usersApi.get(id),
        enabled: enabled && !!id,
    });
}

/**
 * Hook para criar usuário
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<User>) => usersApi.create(data),
        onSuccess: () => {
            // Invalidar cache de listagem
            queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        },
    });
}

/**
 * Hook para atualizar usuário
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
            usersApi.update(id, data),
        onSuccess: (_, variables) => {
            // Invalidar cache do usuário específico
            queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
            // Invalidar cache de listagem
            queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        },
    });
}

/**
 * Hook para deletar usuário
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => usersApi.delete(id),
        onSuccess: () => {
            // Invalidar cache de listagem
            queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        },
    });
}

/**
 * Hook para deletar múltiplos usuários
 */
export function useDeleteManyUsers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => usersApi.deleteMany(ids),
        onSuccess: () => {
            // Invalidar cache de listagem
            queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        },
    });
}
