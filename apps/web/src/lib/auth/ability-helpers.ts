import { useAbility } from './CaslContext';
import { AppActions, AppSubjects } from '@morina/shared-kernel';
import { useCurrentUser } from '@/hooks/use-current-user';

/**
 * Verifica se o usuário tem QUALQUER uma das permissões
 * 
 * @example
 * const canManage = useCanAny([
 *   { action: 'manage', subject: 'User' },
 *   { action: 'manage', subject: 'Product' }
 * ]);
 */
export function useCanAny(
    checks: Array<{ action: AppActions; subject: AppSubjects; conditions?: any }>
): boolean {
    const ability = useAbility();
    return checks.some(({ action, subject, conditions }) =>
        ability.can(action, subject, conditions)
    );
}

/**
 * Verifica se o usuário tem TODAS as permissões
 * 
 * @example
 * const canFullAccess = useCanAll([
 *   { action: 'read', subject: 'User' },
 *   { action: 'update', subject: 'User' }
 * ]);
 */
export function useCanAll(
    checks: Array<{ action: AppActions; subject: AppSubjects; conditions?: any }>
): boolean {
    const ability = useAbility();
    return checks.every(({ action, subject, conditions }) =>
        ability.can(action, subject, conditions)
    );
}

/**
 * Verifica se o usuário pode realizar ação em recurso próprio
 * 
 * @example
 * const canEditOwnPost = useCanOwn('update', 'Post', post.authorId);
 */
export function useCanOwn(
    action: AppActions,
    subject: AppSubjects,
    ownerId: string
): boolean {
    const ability = useAbility();
    const { data: user } = useCurrentUser();

    if (!user) return false;

    return ability.can(action, subject, { ownerId }) && user.id === ownerId;
}

/**
 * Verifica permissão com múltiplas condições
 * 
 * @example
 * const canApprove = useCanWithConditions('approve', 'Order', {
 *   departmentId: order.departmentId,
 *   status: 'pending'
 * });
 */
export function useCanWithConditions(
    action: AppActions,
    subject: AppSubjects,
    conditions: Record<string, any>
): boolean {
    const ability = useAbility();
    return ability.can(action, subject, conditions);
}

/**
 * Hook para verificar se usuário é dono do recurso
 * 
 * @example
 * const isOwner = useIsOwner(post.authorId);
 */
export function useIsOwner(ownerId?: string): boolean {
    const { data: user } = useCurrentUser();

    if (!user || !ownerId) return false;

    return user.id === ownerId;
}

/**
 * Verifica se usuário pertence ao mesmo departamento do recurso
 * 
 * @example
 * const isSameDepartment = useIsSameDepartment(order.departmentId);
 */
export function useIsSameDepartment(departmentId?: string): boolean {
    const { data: user } = useCurrentUser();

    if (!user || !departmentId) return false;

    return user.departmentId === departmentId;
}
