/**
 * Organizations Query Hooks
 * 
 * Hooks do TanStack Query para gerenciar estado de organizações
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTypedApiClient, type QueryParams } from "@/lib/api/factory";
import { queryKeys, queryConfigs } from "@/lib/query/client";

/**
 * Tipo de organização
 */
export interface Organization {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    logo?: string;
    settings?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

/**
 * API client para organizações
 */
const organizationsApi = createTypedApiClient<Organization>("/organizations");

/**
 * Hook para listar organizações
 */
export function useOrganizations(params?: QueryParams) {
    return useQuery({
        queryKey: queryKeys.organizations.list(params || {}),
        queryFn: () => organizationsApi.list(params),
        ...queryConfigs.static, // Organizações mudam raramente
    });
}

/**
 * Hook para obter uma organização específica
 */
export function useOrganization(id: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.organizations.detail(id),
        queryFn: () => organizationsApi.get(id),
        enabled: enabled && !!id,
        ...queryConfigs.static,
    });
}

/**
 * Hook para criar organização
 */
export function useCreateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Organization>) => organizationsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations.lists() });
        },
    });
}

/**
 * Hook para atualizar organização
 */
export function useUpdateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Organization> }) =>
            organizationsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations.lists() });
        },
    });
}

/**
 * Hook para deletar organização
 */
export function useDeleteOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => organizationsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations.lists() });
        },
    });
}

/**
 * Hook para obter organização atual (do contexto/localStorage)
 */
export function useCurrentOrganization() {
    const orgId = typeof window !== "undefined"
        ? localStorage.getItem("selected_org_id")
        : null;

    return useOrganization(orgId || "", !!orgId);
}
