import { PureAbility, AbilityClass } from '@casl/ability';
import {
    AppActions,
    AppSubjects,
    SharedAbilityFactory,
    UserContext,
    UserEffectivePermissions,
    PermissionGrant,
    SentryAdapter
} from '@morina/shared-kernel';
import * as Sentry from '@sentry/nextjs';

/**
 * Ability for the client side which supports function conditions
 */
export type ClientAppAbility = PureAbility<[AppActions, AppSubjects], unknown>;
export const ClientAppAbility = PureAbility as AbilityClass<ClientAppAbility>;

/**
 * Re-export types from shared-kernel for convenience
 */
export type { PermissionGrant, UserEffectivePermissions, UserContext };

/**
 * Sentry adapter for Web (Next.js)
 */
const webSentryAdapter: SentryAdapter = {
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
 * Builds a basic Ability for the user (Web version)
 */
export function buildAbilityForUser(permissions: UserEffectivePermissions) {
    return SharedAbilityFactory.createForUser(permissions, webSentryAdapter);
}

/**
 * Builds Ability with ABAC conditions and Advanced Security (Web version)
 */
export function buildAbilityForUserWithConditions(
    permissions: UserEffectivePermissions,
    userContext: UserContext
) {
    return SharedAbilityFactory.createForUserWithConditions(
        permissions,
        userContext,
        webSentryAdapter
    );
}

/**
 * Re-export parsePermissionKey for backward compatibility
 * Wrapped in arrow function to preserve 'this' context
 */
export const parsePermissionKey = (key: string) => SharedAbilityFactory.parsePermissionKey(key);
