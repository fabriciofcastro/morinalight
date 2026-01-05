/**
 * Custom Hook Pattern: usePermission
 * 
 * Encapsula a lógica de verificação de permissões para reutilização em componentes.
 */

import { useAbility } from "@/lib/auth/CaslContext";
import { getAuthUser } from "@/lib/auth-client";
import { useCallback } from "react";

/**
 * @deprecated Use `useAbility()` from `@/lib/auth/CaslContext` instead.
 * This hook is maintained for backward compatibility.
 */
export function usePermission() {
    const ability = useAbility();
    const user = getAuthUser();

    // Adapter for legacy 'can' function
    const can = useCallback((action: string, subject: string) => {
        // Map legacy string subjects if needed, but ability.can handles strings fine
        // Casl uses 'manage', 'all' for super admin which is covered by ability logic
        return ability.can(action as any, subject as any);
    }, [ability]);

    const isManager = ability.can('manage', 'all');

    return {
        can,
        isManager,
        user,
        isAuthenticated: !!user
    };
}
