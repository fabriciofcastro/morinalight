/**
 * Authorization Hooks for React Components
 * 
 * Hooks para verificar permissões no frontend
 */

"use client";

import { useCurrentUser } from "@/hooks/queries/use-auth";
import { can, hasPermission, type Role, type Action, type Resource, type Permission } from "./rbac";
import { useMemo } from "react";

/**
 * Hook para verificar se usuário tem permissão
 */
import { useCurrentUser } from "@/hooks/queries/use-auth";
import { type Role, type Action, type Resource, type Permission } from "./rbac";
import { useMemo } from "react";
import { useAbility } from "@/lib/auth/CaslContext";
import { parsePermissionKey } from "@/lib/auth/ability";
import { AppActions, AppSubjects } from "@morina/shared-kernel";

/**
 * Hook para verificar se usuário tem permissão
 * @deprecated Use useAbility()
 */
export function usePermission(permission: Permission) {
    const ability = useAbility();

    return useMemo(() => {
        if (!permission) return true;

        // Tentar parsear chave
        const { action, subject } = parsePermissionKey(permission);
        if (action && subject) {
            return ability.can(action, subject);
        }

        return false;
    }, [ability, permission]);
}

/**
 * Hook para verificar se usuário pode executar ação em recurso
 * @deprecated Use useAbility()
 */
export function useCan(action: Action, resource: Resource) {
    const ability = useAbility();

    return useMemo(() => {
        // Mapping manual
        let act = action as string;
        let sub = resource as string;

        if (act === 'view') act = 'read';
        if (act === 'edit') act = 'update';
        if (sub === 'users') sub = 'User';
        if (sub === 'products') sub = 'Product';

        return ability.can(act as AppActions, sub as AppSubjects);
    }, [ability, action, resource]);
}

/**
 * Hook para obter todas as permissões do usuário
 * @deprecated
 */
export function usePermissions() {
    return useMemo(() => [], []);
}

/**
 * Componente para renderização condicional baseada em permissão
 * @deprecated Use <Can I="read" a="Product" /> from @/lib/auth/CaslContext
 */
interface CanProps {
    permission?: Permission;
    action?: Action;
    resource?: Resource;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function Can({ permission, action, resource, children, fallback = null }: CanProps) {
    const hasDirectPermission = usePermission(permission!);
    const canPerformAction = useCan(action!, resource!);

    const allowed = permission ? hasDirectPermission : canPerformAction;

    return allowed ? <>{children}</> : <>{fallback}</>;
}

/**
 * HOC para proteger componentes
 */
export function withPermission<P extends object>(
    Component: React.ComponentType<P>,
    permission: Permission,
    fallback?: React.ComponentType,
) {
    return function ProtectedComponent(props: P) {
        const allowed = usePermission(permission);

        if (!allowed) {
            return fallback ? React.createElement(fallback) : null;
        }

        return <Component {...props} />;
    };
}

/**
 * EXEMPLO DE USO:
 * 
 * ```typescript
 * // Verificar permissão
 * function UsersList() {
 *   const canCreate = useCan('create', 'users');
 *   const canDelete = useCan('delete', 'users');
 * 
 *   return (
 *     <div>
 *       {canCreate && <button>Create User</button>}
 *       
 *       <Can action="delete" resource="users">
 *         <button>Delete User</button>
 *       </Can>
 *     </div>
 *   );
 * }
 * 
 * // Proteger componente inteiro
 * const AdminPanel = withPermission(
 *   AdminPanelComponent,
 *   'settings:update',
 *   UnauthorizedPage
 * );
 * ```
 */

import React from "react";
