import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import {
    AppAbility,
    AppActions,
    AppSubjects,
    unifiedPolicyEngine,
    SecurityContext
} from '@morina/shared-kernel';

/**
 * Permissão recebida da API
 */
export type PermissionGrant = {
    permissionKey: string;
    granted: boolean;
    source?: string;
    sourceEntityId?: string;
};

/**
 * Permissões efetivas do usuário
 */
export type UserEffectivePermissions = {
    effective: PermissionGrant[];
    denied: string[];
    role: string | null;
};

/**
 * Contexto do usuário para ABAC e Segurança Avançada (AUBAC)
 */
export interface UserContext {
    userId: string;
    departmentId?: string;
    sectorId?: string;
    positionId?: string;
    role?: string;
    organizationId?: string;
    attributes?: Record<string, any>; // Atributos dinâmicos para AUBAC
    ipAddress?: string;
    userAgent?: string;
    mfaVerified?: boolean;
}

/**
 * Reconstrói a Ability no frontend (versão básica, sem condições ABAC)
 */
export function buildAbilityForUser(permissions: UserEffectivePermissions): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    // Super Admin
    if (permissions.role === 'owner') {
        can('manage', 'all');
    }

    // Processar Grants
    for (const grant of permissions.effective) {
        if (!grant.granted) continue;
        const { action, subject } = parsePermissionKey(grant.permissionKey);
        if (action && subject) {
            can(action, subject);
        }
    }

    // Processar Denials
    for (const deniedKey of permissions.denied) {
        const { action, subject } = parsePermissionKey(deniedKey);
        if (action && subject) {
            cannot(action, subject);
        }
    }

    return build({
        detectSubjectType: (item) => {
            if (typeof item === 'string') return item as AppSubjects;
            if (item && typeof item === 'object' && '__typename' in item) {
                return (item as any).__typename as AppSubjects;
            }
            return item.constructor.name as AppSubjects;
        }
    });
}

/**
 * Reconstrói a Ability com suporte a condições ABAC e Segurança Avançada (PBAC, TBAC, ACL)
 */
export function buildAbilityForUserWithConditions(
    permissions: UserEffectivePermissions,
    userContext: UserContext
): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
    const securityContext = buildSecurityContext(userContext);

    // Super Admin
    if (permissions.role === 'owner') {
        can('manage', 'all');
    }

    // Processar Grants com condições dinâmicas
    for (const grant of permissions.effective) {
        if (!grant.granted) continue;

        const { action, subject, conditions } = parsePermissionKeyWithConditions(
            grant.permissionKey,
            userContext
        );

        if (action && subject) {
            // Integração do motor ABAC legado COM o novo UnifiedPolicyEngine
            can(action, subject, (resource) => {
                // 1. Validar condições básicas de ABAC (ex: own, department)
                if (conditions) {
                    const matchesAbac = Object.entries(conditions).every(
                        ([key, value]) => resource?.[key] === value
                    );
                    if (!matchesAbac) return false;
                }

                // 2. Validar contra Security Policies, TBAC e ACLs Avançadas
                return unifiedPolicyEngine.evaluate(
                    action,
                    subject,
                    securityContext,
                    resource
                );
            });
        }
    }

    // Processar Denials
    for (const deniedKey of permissions.denied) {
        const { action, subject } = parsePermissionKey(deniedKey);
        if (action && subject) {
            cannot(action, subject);
        }
    }

    return build({
        detectSubjectType: (item) => {
            if (typeof item === 'string') return item as AppSubjects;
            if (item && typeof item === 'object' && '__typename' in item) {
                return (item as any).__typename as AppSubjects;
            }
            return item.constructor.name as AppSubjects;
        }
    });
}

/**
 * Helper para construir o SecurityContext no Frontend
 */
function buildSecurityContext(userContext: UserContext): SecurityContext {
    return {
        user: {
            id: userContext.userId,
            role: userContext.role || 'member',
            departmentId: userContext.departmentId,
            sectorId: userContext.sectorId,
            attributes: userContext.attributes
        },
        environment: {
            time: new Date(),
            ip: userContext.ipAddress,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : userContext.userAgent,
            mfaVerified: userContext.mfaVerified || false
        }
    };
}

/**
 * Parse permission key com condições ABAC
 */
function parsePermissionKeyWithConditions(
    key: string,
    userContext: UserContext
): { action: AppActions | null; subject: AppSubjects | null; conditions?: any } {
    const parts = key.split(':');
    if (parts.length < 2) return { action: null, subject: null };

    const subjectRaw = parts[0];
    const actionRaw = parts[1];
    const modifier = parts[2]; // ex: 'own', 'department', 'active'

    const subject = mapSubject(subjectRaw);
    const action = mapAction(actionRaw);

    if (!action || !subject) {
        return { action, subject };
    }

    // Aplicar condições
    let conditions: any = undefined;

    if (modifier === 'own') {
        conditions = { ownerId: userContext.userId };
    } else if (modifier === 'department') {
        conditions = { departmentId: userContext.departmentId };
    } else if (modifier === 'sector') {
        conditions = { sectorId: userContext.sectorId };
    } else if (modifier === 'active') {
        conditions = { status: 'active' };
    } else if (modifier === 'inactive') {
        conditions = { status: 'inactive' };
    } else if (modifier === 'pending') {
        conditions = { status: 'pending' };
    } else if (modifier === 'draft') {
        conditions = { status: 'draft' };
    }

    return { action, subject, conditions };
}

/**
 * Parse básico de permission key
 */
export function parsePermissionKey(key: string): { action: AppActions | null, subject: AppSubjects | null } {
    const parts = key.split(':');
    if (parts.length < 2) return { action: null, subject: null };

    const subjectRaw = parts[0];
    const actionRaw = parts[1];

    const subject = mapSubject(subjectRaw);
    const action = mapAction(actionRaw);

    return { subject, action };
}

/**
 * Mapeia prefixos para Subjects
 */
function mapSubject(raw: string): AppSubjects | null {
    const map: Record<string, AppSubjects> = {
        'products': 'Product',
        'catalog': 'Product',
        'categories': 'Category',
        'clients': 'Client',
        'suppliers': 'Supplier',
        'orders': 'Order',
        'sales': 'Order',
        'users': 'User',
        'representatives': 'User',
        'settings:team': 'User',
        'settings:company': 'Organization',
        'organization': 'Organization',
        'settings:permissions': 'Permission',
        'permissions': 'Permission',
        'settings:roles': 'Role',
        'roles': 'Role',
        'reports': 'Report',
        'commissions': 'Commission',
        'dashboard': 'Dashboard',
        'settings': 'Settings',
        'departments': 'Department',
        'sectors': 'Sector',
        'positions': 'Position',
        'branches': 'Branch',
        'posts': 'Post',
        'documents': 'Document',
        'notifications': 'Notification',
        'pre-fichas-tecnicas': 'TechnicalSheet',
        'fichas-custo': 'TechnicalSheet',
        'workflows': 'Workflow',
        'settings:organizational-structure': 'Organization',
    };
    return map[raw] || null;
}

/**
 * Mapeia sufixos para Actions
 */
function mapAction(raw: string): AppActions | null {
    const map: Record<string, AppActions> = {
        'view': 'read',
        'list': 'read',
        'read': 'read',
        'create': 'create',
        'edit': 'update',
        'update': 'update',
        'delete': 'delete',
        'remove': 'delete',
        'manage': 'manage',
        'approve': 'approve',
        'reject': 'reject',
        'publish': 'publish',
        'archive': 'archive',
        'export': 'export',
        'import': 'import',
        'pay': 'update',
        'assign': 'update',
    };
    return map[raw] || null;
}
