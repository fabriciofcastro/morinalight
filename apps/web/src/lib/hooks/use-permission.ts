/**
 * Custom Hook Pattern: usePermission
 * 
 * Encapsula a lógica de verificação de permissões para reutilização em componentes.
 */

import { useSession } from "next-auth/react"; // Assumindo next-auth ou similar
import { useCallback } from "react";
// Em um app real, importaria a lógica CASL/RBAC centralizada
// import { ability } from "@/lib/auth/ability"; 

export function usePermission() {
    const { data: session } = useSession();

    // Simulação de hook de permissionamento
    const can = useCallback((action: string, subject: string) => {
        if (!session?.user) return false;

        // Admin Master tem acesso a tudo
        // @ts-ignore
        if (session.user.role === "ADMIN_MASTER") return true;

        // Lógica real viria aqui (CASL ability check)
        // return ability.can(action, subject);

        // Fallback simples para exemplo
        return true;
    }, [session]);

    const isManager = session?.user && (session.user as any).role === 'MANAGER';

    return {
        can,
        isManager,
        user: session?.user,
        isAuthenticated: !!session?.user
    };
}
