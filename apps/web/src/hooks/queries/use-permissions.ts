/**
 * Permissions Query Hooks
 * 
 * Hooks do TanStack Query para gerenciar permissões
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/base";
import { queryKeys, queryConfigs } from "@/lib/query/client";

/**
 * Tipo de permissão
 */
export interface Permission {
    id: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
}

/**
 * Hook para obter permissões do usuário
 */
import { useAbility } from "@/lib/auth/CaslContext";
import { parsePermissionKey } from "@/lib/auth/ability";
import { AppActions, AppSubjects } from "@morina/shared-kernel";

/**
 * @deprecated Use useAbility() instead.
 * 
 * Adaptação do antigo useUserPermissions para usar o contexto do CASL.
 * Retorna dados mockados para manter contrato da interface antiga.
 */
export function useUserPermissions(userId: string, enabled = true) {
    // Nota: O userId é ignorado pois o CASL context sempre traz o usuário logado.
    // Se precisar ver permissão de OUTRO usuário, precisaria de um hook admin específico.

    // Como o CASL não expõe a lista crua de forma fácil, retornamos vazio/mock
    // já que o foco é migrar para useAbility.
    return {
        data: [] as Permission[],
        isLoading: false,
        error: null
    };
}

/**
 * Hook para obter permissões de uma role
 * (Mantido pois busca dados de definição de role, não permissão efetiva do usuário logado)
 */
export function useRolePermissions(roleId: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.permissions.role(roleId),
        queryFn: async () => {
            const response = await apiClient.get<Permission[]>(`/roles/${roleId}/permissions`);
            return response;
        },
        enabled: enabled && !!roleId,
        ...queryConfigs.static,
    });
}

/**
 * @deprecated Use useAbility() instead.
 * 
 * Adapter para usar CASL internamente.
 */
export function useHasPermission(userId: string, resource: string, action: string) {
    const ability = useAbility();

    // Mapeamento manual rápido para compatibilidade
    // O ideal é chamar useAbility direto no componente

    // Tenta mapear resource/action legados para CASL
    // Se API antiga usava "products" e "view", isso mapeia para "Product" e "read"
    // conforme lógica do parsePermissionKey, ou passamos direto se já estiver certo.

    let subject: AppSubjects | string = resource;
    let act: AppActions | string = action;

    // Tentar normalizar usando helpers existentes se possível, 
    // ou assumir que resource/action batem com CASL

    // Normalização simples para casos comuns legados
    if (action === 'view') act = 'read';
    if (action === 'edit') act = 'update';
    if (resource === 'products') subject = 'Product';
    if (resource === 'clients') subject = 'Client';

    const hasPermission = ability.can(act as AppActions, subject as AppSubjects);

    return {
        hasPermission,
        isLoading: false,
    };
}

import React from "react";
