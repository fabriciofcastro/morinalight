import { useCallback, useMemo } from 'react';
import {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    type Permission
} from '@/config/permissions';

/**
 * Hook para verificar permissões do usuário
 * 
 * @example
 * ```tsx
 * const { can, canAll, canAny } = usePermission();
 * 
 * if (can(PERMISSIONS.PRODUCTS_EDIT)) {
 *   // Mostrar botão de editar
 * }
 * 
 * if (canAll([PERMISSIONS.PRODUCTS_EDIT, PERMISSIONS.PRODUCTS_DELETE])) {
 *   // Mostrar menu avançado
 * }
 * ```
 */
export function usePermission() {
    // TODO: Integrar com sistema de autenticação real
    // Por enquanto, retorna permissões mockadas
    const userPermissions = useMemo(() => {
        // Em produção, buscar do contexto de autenticação
        // return useAuth().user.permissions;
        return ['admin:*']; // Mock: admin tem tudo
    }, []);

    const can = useCallback(
        (permission: Permission) => {
            return hasPermission(userPermissions, permission);
        },
        [userPermissions]
    );

    const canAll = useCallback(
        (permissions: Permission[]) => {
            return hasAllPermissions(userPermissions, permissions);
        },
        [userPermissions]
    );

    const canAny = useCallback(
        (permissions: Permission[]) => {
            return hasAnyPermission(userPermissions, permissions);
        },
        [userPermissions]
    );

    return {
        can,
        canAll,
        canAny,
        permissions: userPermissions,
    };
}
