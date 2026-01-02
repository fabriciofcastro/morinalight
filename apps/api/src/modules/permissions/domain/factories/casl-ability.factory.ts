import { AbilityBuilder } from '@casl/ability';
import {
    AppAbility,
    AppActions,
    AppSubjects,
    unifiedPolicyEngine,
    SecurityContext
} from '@morina/shared-kernel';
import * as Sentry from "@sentry/node";
import { ResolverPermissoesEfetivasResultado } from '../../application/schemas/effective-permissions.schema';

/**
 * Contexto do usuário para ABAC e Advanced Security (AUBAC)
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

export class CaslAbilityFactory {
    /**
     * Cria uma instância de AppAbility com base nas permissões efetivas do usuário.
     * Versão básica sem condições ABAC.
     */
    static createForUser(permissions: ResolverPermissoesEfetivasResultado): AppAbility {
        // Enriquecer escopo do Sentry com informações de segurança
        Sentry.configureScope((scope) => {
            scope.setTag("user_role", permissions.role);
            scope.setContext("security", {
                permissions_count: permissions.effective.length,
                role: permissions.role,
                is_owner: permissions.role === 'owner'
            });
        });

        const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);

        // Super-admin rule (exemplo: proprietários têm acesso total)
        if (permissions.role === 'owner') {
            can('manage', 'all');
        }

        // Processar permissões efetivas (Allow)
        for (const grant of permissions.effective) {
            if (!grant.granted) continue;

            const { action, subject } = this.parsePermissionKey(grant.permissionKey);

            if (action && subject) {
                can(action, subject);
            }
        }

        // Processar negações explícitas (Denied)
        for (const deniedKey of permissions.denied) {
            const { action, subject } = this.parsePermissionKey(deniedKey);
            if (action && subject) {
                cannot(action, subject);
            }
        }

        return build({
            detectSubjectType: (item) => {
                return (item as any).__typename || item.constructor as unknown as AppSubjects;
            },
        });
    }

    /**
     * Cria Ability com suporte a condições ABAC e Segurança Avançada (PBAC, TBAC, ACL)
     */
    static createForUserWithConditions(
        permissions: ResolverPermissoesEfetivasResultado,
        userContext: UserContext
    ): AppAbility {
        Sentry.configureScope((scope) => {
            scope.setTag("user_role", permissions.role);
            scope.setContext("security", {
                permissions_count: permissions.effective.length,
                role: permissions.role,
                is_owner: permissions.role === 'owner',
                has_advanced_security: true
            });
        });

        const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);
        const securityContext = this.buildSecurityContext(userContext);

        // Super-admin rule
        if (permissions.role === 'owner') {
            can('manage', 'all');
        }

        // Processar permissões com condições dinâmicas
        for (const grant of permissions.effective) {
            if (!grant.granted) continue;

            const { action, subject, conditions } = this.parsePermissionKeyWithConditions(
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

        // Processar negações explicitas
        for (const deniedKey of permissions.denied) {
            const { action, subject } = this.parsePermissionKey(deniedKey);
            if (action && subject) {
                cannot(action, subject);
            }
        }

        return build({
            detectSubjectType: (item) => {
                return (item as any).__typename || item.constructor as unknown as AppSubjects;
            },
        });
    }

    /**
     * Helper para construir o SecurityContext (Advanced)
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
                ip: userContext.ipAddress,
                userAgent: userContext.userAgent,
                mfaVerified: userContext.mfaVerified || false
            }
        };
    }

    /**
     * Parse permission key com suporte a condições ABAC
     */
    private static parsePermissionKeyWithConditions(
        key: string,
        userContext: UserContext
    ): { action: AppActions | null; subject: AppSubjects | null; conditions?: any } {
        const parts = key.split(':');
        if (parts.length < 2) return { action: null, subject: null };

        const subjectRaw = parts[0];
        const actionRaw = parts[1];
        const modifier = parts[2]; // ex: 'own', 'department', 'active'

        const subject = this.mapSubject(subjectRaw);
        const action = this.mapAction(actionRaw);

        if (!action || !subject) {
            return { action, subject };
        }

        // Aplicar condições baseadas no modificador
        let conditions: any = undefined;

        if (modifier === 'own') {
            // Permissão apenas para recursos próprios
            conditions = { ownerId: userContext.userId };
        } else if (modifier === 'department') {
            // Permissão apenas para recursos do mesmo departamento
            conditions = { departmentId: userContext.departmentId };
        } else if (modifier === 'sector') {
            // Permissão apenas para recursos do mesmo setor
            conditions = { sectorId: userContext.sectorId };
        } else if (modifier === 'active') {
            // Permissão apenas para recursos ativos
            conditions = { status: 'active' };
        } else if (modifier === 'inactive') {
            // Permissão apenas para recursos inativos
            conditions = { status: 'inactive' };
        } else if (modifier === 'pending') {
            // Permissão apenas para recursos pendentes
            conditions = { status: 'pending' };
        } else if (modifier === 'draft') {
            // Permissão apenas para rascunhos
            conditions = { status: 'draft' };
        }

        return { action, subject, conditions };
    }

    /**
     * Parse básico de permission key (sem condições)
     */
    public static parsePermissionKey(key: string): { action: AppActions | null, subject: AppSubjects | null } {
        const parts = key.split(':');
        if (parts.length < 2) return { action: null, subject: null };

        const subjectRaw = parts[0];
        const actionRaw = parts[1];

        const subject = this.mapSubject(subjectRaw);
        const action = this.mapAction(actionRaw);

        return { subject, action };
    }

    /**
     * Verifica permissão com objeto específico (helper para controllers)
     */
    static checkWithResource(
        ability: AppAbility,
        action: AppActions,
        subject: AppSubjects,
        resource?: Record<string, any>
    ): boolean {
        return ability.can(action, subject, resource);
    }

    /**
     * Mapeia prefixos de permissão para Sujeitos do CASL
     */
    private static mapSubject(raw: string): AppSubjects | null {
        const map: Record<string, AppSubjects> = {
            // Produtos e Catálogo
            'products': 'Product',
            'catalog': 'Product',

            // Clientes e Fornecedores
            'clients': 'Client',
            'suppliers': 'Supplier',

            // Pedidos e Vendas
            'orders': 'Order',
            'sales': 'Order',

            // Usuários e Equipe
            'users': 'User',
            'representatives': 'User',
            'settings:team': 'User',

            // Organização
            'settings:company': 'Organization',
            'organization': 'Organization',

            // Permissões
            'settings:permissions': 'Permission',
            'permissions': 'Permission',

            // Relatórios e Comissões
            'reports': 'Report',
            'commissions': 'Commission',

            // Dashboard e Configurações
            'dashboard': 'Dashboard',
            'settings': 'Settings',

            // Estrutura Organizacional
            'departments': 'Department',
            'sectors': 'Sector',
            'positions': 'Position',

            // Outros
            'posts': 'Post',
            'documents': 'Document',
        };

        return map[raw] || null;
    }

    /**
     * Mapeia sufixos de permissão para Ações do CASL
     */
    private static mapAction(raw: string): AppActions | null {
        const map: Record<string, AppActions> = {
            // CRUD básico
            'view': 'read',
            'list': 'read',
            'read': 'read',
            'create': 'create',
            'edit': 'update',
            'update': 'update',
            'delete': 'delete',
            'remove': 'delete',

            // Ações especiais
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
