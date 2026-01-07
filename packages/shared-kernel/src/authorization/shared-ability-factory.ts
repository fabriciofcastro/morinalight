import { AbilityBuilder } from '@casl/ability';
import { ObjectAccessEntry, SecurityContext, SecurityPolicy } from './advanced/types';
import { unifiedPolicyEngine } from './advanced/unified-policy-engine';
import { AppAbility, AppActions, AppSubjects } from './types';

/**
 * Sentry adapter interface for logging authorization events
 */
export interface SentryAdapter {
    setTag(key: string, value: string): void;
    setContext(name: string, context: Record<string, any>): void;
    captureMessage?(message: string, level?: 'info' | 'warning' | 'error'): void;
}

/**
 * User context for ABAC and Advanced Security (AUBAC)
 */
export interface UserContext {
    userId: string;
    departmentId?: string;
    sectorId?: string;
    positionId?: string;
    role?: string;
    organizationId?: string;
    attributes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    mfaVerified?: boolean;
}

/**
 * Permission grant from API
 */
export interface PermissionGrant {
    permissionKey: string;
    granted: boolean;
    source?: string;
    sourceEntityId?: string;
}

/**
 * User effective permissions
 */
export interface UserEffectivePermissions {
    effective: PermissionGrant[];
    denied: string[];
    role: string | null;
    policies?: SecurityPolicy[];
    aclEntries?: ObjectAccessEntry[];
}

/**
 * Shared Ability Factory
 * Consolidates authorization logic for both Web and API
 */
export class SharedAbilityFactory {
    /**
     * Creates a basic AppAbility without conditions (for simple RBAC)
     */
    static createForUser(
        permissions: UserEffectivePermissions,
        sentryAdapter?: SentryAdapter
    ): AppAbility {
        // Enrich Sentry context
        if (sentryAdapter) {
            sentryAdapter.setTag('user_role', permissions.role || 'unknown');
            sentryAdapter.setContext('security', {
                permissions_count: permissions.effective.length,
                role: permissions.role,
                is_owner: permissions.role === 'owner'
            });
        }

        const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);

        // Super Admin
        if (permissions.role === 'owner') {
            can('manage', 'all');
        }

        // Process Grants
        for (const grant of permissions.effective) {
            if (!grant.granted) continue;
            const { action, subject } = this.parsePermissionKey(grant.permissionKey);
            if (action && subject) {
                can(action, subject);
            }
        }

        // Process Denials
        for (const deniedKey of permissions.denied) {
            const { action, subject } = this.parsePermissionKey(deniedKey);
            if (action && subject) {
                cannot(action, subject);
            }
        }

        return build({
            detectSubjectType: (item) => {
                if (typeof item === 'string') return item as any;
                const subject = item as any;
                if (subject && typeof subject === 'object' && '__typename' in subject) {
                    return subject.__typename as any;
                }
                return (subject?.constructor?.name || 'all') as any;
            },
        });
    }

    /**
     * Creates AppAbility with ABAC conditions and Advanced Security (PBAC, TBAC, ACL)
     */
    static createForUserWithConditions(
        permissions: UserEffectivePermissions,
        userContext: UserContext,
        sentryAdapter?: SentryAdapter
    ): AppAbility {
        // Enrich Sentry context
        if (sentryAdapter) {
            sentryAdapter.setTag('user_role', permissions.role || 'unknown');
            sentryAdapter.setContext('security', {
                permissions_count: permissions.effective.length,
                role: permissions.role,
                is_owner: permissions.role === 'owner',
                has_advanced_security: true,
                has_policies: (permissions.policies?.length || 0) > 0,
                has_acls: (permissions.aclEntries?.length || 0) > 0
            });
        }

        const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);
        const securityContext = this.buildSecurityContext(userContext);

        // Hydrate Advanced Security Engine
        if (permissions.policies) {
            unifiedPolicyEngine.setPolicies(permissions.policies);
        }
        if (permissions.aclEntries) {
            unifiedPolicyEngine.setAclEntries(permissions.aclEntries);
        }

        // Super Admin
        if (permissions.role === 'owner') {
            can('manage', 'all');
        }

        // Process Grants with dynamic conditions
        for (const grant of permissions.effective) {
            if (!grant.granted) continue;

            const { action, subject, conditions } = this.parsePermissionKeyWithConditions(
                grant.permissionKey,
                userContext
            );

            if (action && subject) {
                can(action, subject, (resource: any) => {
                    // 1. Check Advanced Policy Engine (PBAC/ACL/TBAC)
                    const engineDecision = unifiedPolicyEngine.evaluate(
                        action,
                        subject as string,
                        securityContext,
                        resource
                    );

                    // 2. Validate legacy conditions (ABAC markers in key)
                    if (conditions) {
                        // TBAC Check
                        if (conditions.time) {
                            const now = new Date();
                            const currentHour = now.getHours();
                            const currentDay = now.getDay();
                            const { start, end, days } = conditions.time;

                            const [startH] = start.split(':').map(Number);
                            const [endH] = end.split(':').map(Number);

                            if (days && !days.includes(currentDay)) return false;
                            if (currentHour < startH || currentHour >= endH) return false;
                        }

                        // Ownership & Attribute Checks
                        const abacConditions = { ...conditions };
                        delete abacConditions.time;

                        if (Object.keys(abacConditions).length > 0) {
                            const matchesAbac = Object.entries(abacConditions).every(
                                ([key, value]) => resource?.[key] === value
                            );
                            if (!matchesAbac) return false;
                        }

                        return true;
                    }

                    // If no legacy conditions, check engine
                    return engineDecision;
                });
            }
        }

        // Process Denials
        for (const deniedKey of permissions.denied) {
            const { action, subject } = this.parsePermissionKey(deniedKey);
            if (action && subject) {
                cannot(action, subject);
            }
        }

        return build({
            detectSubjectType: (item) => {
                if (typeof item === 'string') return item as any;
                const subject = item as any;
                if (subject && typeof subject === 'object' && '__typename' in subject) {
                    return subject.__typename as any;
                }
                return (subject?.constructor?.name || 'all') as any;
            },
        });
    }

    /**
     * Helper to build SecurityContext
     */
    private static buildSecurityContext(userContext: UserContext): SecurityContext {
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
                timeWindows: userContext.attributes?.timeWindows,
                ip: userContext.ipAddress,
                userAgent: userContext.userAgent,
                mfaVerified: userContext.mfaVerified || false
            }
        };
    }

    /**
     * Parse permission key with ABAC conditions
     */
    private static parsePermissionKeyWithConditions(
        key: string,
        userContext: UserContext
    ): { action: AppActions | null; subject: AppSubjects | null; conditions?: any } {
        const parts = key.split(':');
        if (parts.length < 2) return { action: null, subject: null };

        const subjectRaw = parts[0];
        const actionRaw = parts[1];
        const modifier = parts[2];

        const subject = this.mapSubject(subjectRaw!);
        const action = this.mapAction(actionRaw!);

        if (!action || !subject) {
            // Tentar subject composto (ex: settings:permissions:view)
            if (parts.length >= 3) {
                const compositeSubjectRaw = `${parts[0]}:${parts[1]}`;
                const compositeActionRaw = parts[2];
                const compositeModifier = parts[3]; // Pode ser undefined

                const compositeSubject = this.mapSubject(compositeSubjectRaw);
                const compositeAction = this.mapAction(compositeActionRaw!);

                if (compositeSubject && compositeAction) {
                    let conditions: any = undefined;

                    // Re-aplicar lógica de condições para o modifier deslocado
                    if (compositeModifier === 'own') {
                        conditions = { ownerId: userContext.userId };
                    } else if (compositeModifier === 'department') {
                        conditions = { departmentId: userContext.departmentId };
                    } else if (compositeModifier === 'sector') {
                        conditions = { sectorId: userContext.sectorId };
                    } else if (compositeModifier === 'active') {
                        conditions = { status: 'active' };
                    } else if (compositeModifier === 'inactive') {
                        conditions = { status: 'inactive' };
                    } else if (compositeModifier === 'pending') {
                        conditions = { status: 'pending' };
                    } else if (compositeModifier === 'draft') {
                        conditions = { status: 'draft' };
                    } else if (compositeModifier === 'business_hours') {
                        conditions = {
                            time: {
                                start: '09:00',
                                end: '18:00',
                                days: [1, 2, 3, 4, 5]
                            }
                        };
                    }

                    return { action: compositeAction, subject: compositeSubject, conditions };
                }
            }

            return { action, subject };
        }

        // Apply conditions
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
        } else if (modifier === 'business_hours') {
            conditions = {
                time: {
                    start: '09:00',
                    end: '18:00',
                    days: [1, 2, 3, 4, 5] // Mon-Fri
                }
            };
        }

        return { action, subject, conditions };
    }

    /**
     * Parse basic permission key
     */
    public static parsePermissionKey(key: string): { action: AppActions | null, subject: AppSubjects | null } {
        const parts = key.split(':');
        if (parts.length < 2) return { action: null, subject: null };

        const subjectRaw = parts[0];
        const actionRaw = parts[1];

        // Tentar mapeamento direto primeiro
        let subject = this.mapSubject(subjectRaw!);
        let action = this.mapAction(actionRaw!);

        // Se falhar e tivermos mais partes, tentar subject composto
        if ((!subject || !action) && parts.length >= 3) {
            const compositeSubjectRaw = `${parts[0]}:${parts[1]}`;
            const compositeActionRaw = parts[2];

            const compositeSubject = this.mapSubject(compositeSubjectRaw);
            const compositeAction = this.mapAction(compositeActionRaw!);

            if (compositeSubject && compositeAction) {
                return { subject: compositeSubject, action: compositeAction };
            }
        }

        return { subject, action };
    }

    /**
     * Map subject prefixes to AppSubjects
     */
    private static mapSubject(raw: string): AppSubjects | null {
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
            'business-segments': 'BusinessSegment',
            'settings:organizational-structure': 'Organization',
        };
        return map[raw] || null;
    }

    /**
     * Map action suffixes to AppActions
     */
    private static mapAction(raw: string): AppActions | null {
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
}
