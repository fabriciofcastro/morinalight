import {
    AppAbility,
    SharedAbilityFactory,
    UserContext,
    UserEffectivePermissions,
    SentryAdapter
} from '@morina/shared-kernel';
import * as Sentry from "@sentry/node";
import { ResolverPermissoesEfetivasResultado } from '../../application/schemas/effective-permissions.schema';

/**
 * Sentry adapter for API (Node.js)
 */
const apiSentryAdapter: SentryAdapter = {
    setTag: (key: string, value: string) => {
        Sentry.setTag(key, value);
    },
    setContext: (name: string, context: Record<string, any>) => {
        Sentry.setContext(name, context);
    },
    captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => {
        Sentry.captureMessage(message, level || 'info');
    }
};

/**
 * CASL Ability Factory for API
 * Now delegates to SharedAbilityFactory from shared-kernel
 */
export class CaslAbilityFactory {
    /**
     * Creates a basic AppAbility without conditions (for simple RBAC)
     */
    static createForUser(permissions: ResolverPermissoesEfetivasResultado): AppAbility {
        return SharedAbilityFactory.createForUser(permissions, apiSentryAdapter);
    }

    /**
     * Creates AppAbility with ABAC conditions and Advanced Security (PBAC, TBAC, ACL)
     */
    static createForUserWithConditions(
        permissions: ResolverPermissoesEfetivasResultado,
        userContext: UserContext
    ): AppAbility {
        return SharedAbilityFactory.createForUserWithConditions(
            permissions,
            userContext,
            apiSentryAdapter
        );
    }

    /**
     * Parse permission key (re-exported for backward compatibility)
     */
    public static parsePermissionKey = SharedAbilityFactory.parsePermissionKey;

    /**
     * Verifies permission with specific resource (helper for controllers)
     */
    static checkWithResource(
        ability: AppAbility,
        action: string,
        subject: string,
        resource?: Record<string, any>
    ): boolean {
        return ability.can(action as any, subject as any, resource);
    }
}
