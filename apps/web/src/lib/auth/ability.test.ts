import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildAbilityForUser, buildAbilityForUserWithConditions, type UserEffectivePermissions, type UserContext } from './ability';

describe('Authorization - ability.ts', () => {
    describe('buildAbilityForUser (Basic CASL)', () => {
        it('should grant manage:all for owner role', () => {
            const permissions: UserEffectivePermissions = {
                effective: [],
                denied: [],
                role: 'owner'
            };

            const ability = buildAbilityForUser(permissions);

            expect(ability.can('manage', 'all')).toBe(true);
            expect(ability.can('create', 'Product')).toBe(true);
            expect(ability.can('delete', 'User')).toBe(true);
        });

        it('should grant specific permissions from effective grants', () => {
            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'products:create', granted: true },
                    { permissionKey: 'products:read', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUser(permissions);

            expect(ability.can('create', 'Product')).toBe(true);
            expect(ability.can('read', 'Product')).toBe(true);
            expect(ability.can('delete', 'Product')).toBe(false);
        });

        it('should deny permissions in denied list', () => {
            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'products:create', granted: true }
                ],
                denied: ['products:delete'],
                role: 'member'
            };

            const ability = buildAbilityForUser(permissions);

            expect(ability.can('create', 'Product')).toBe(true);
            expect(ability.can('delete', 'Product')).toBe(false);
        });
    });

    describe('ABAC - Attribute-Based Access Control', () => {
        let userContext: UserContext;

        beforeEach(() => {
            userContext = {
                userId: 'user-123',
                departmentId: 'dept-a',
                sectorId: 'sector-1',
                role: 'manager',
                attributes: {}
            };
        });

        it('should allow owner to update their own document', () => {
            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'documents:update:own', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUserWithConditions(permissions, userContext);

            const myDocument = { __typename: 'Document', id: 'doc-1', ownerId: 'user-123' };
            const otherDocument = { __typename: 'Document', id: 'doc-2', ownerId: 'user-456' };

            expect(ability.can('update', myDocument)).toBe(true);
            expect(ability.can('update', otherDocument)).toBe(false);
        });

        it('should allow department members to read department documents', () => {
            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'documents:read:department', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUserWithConditions(permissions, userContext);

            const deptDocument = { __typename: 'Document', id: 'doc-1', departmentId: 'dept-a' };
            const otherDeptDocument = { __typename: 'Document', id: 'doc-2', departmentId: 'dept-b' };

            expect(ability.can('read', deptDocument)).toBe(true);
            expect(ability.can('read', otherDeptDocument)).toBe(false);
        });

        it('should enforce status-based conditions', () => {
            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'documents:read:active', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUserWithConditions(permissions, userContext);

            const activeDoc = { __typename: 'Document', id: 'doc-1', status: 'active' };
            const inactiveDoc = { __typename: 'Document', id: 'doc-2', status: 'inactive' };

            expect(ability.can('read', activeDoc)).toBe(true);
            expect(ability.can('read', inactiveDoc)).toBe(false);
        });
    });

    describe('TBAC - Time-Based Access Control', () => {
        let userContext: UserContext;

        beforeEach(() => {
            userContext = {
                userId: 'user-123',
                role: 'member',
                attributes: {}
            };
        });

        it('should allow access during business hours (Mon-Fri 9-18)', () => {
            // Mock date to Wednesday 10:00 AM
            vi.setSystemTime(new Date('2026-01-08T10:00:00')); // Wednesday

            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'documents:update:business_hours', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUserWithConditions(permissions, userContext);
            const document = { __typename: 'Document', id: 'doc-1' };

            expect(ability.can('update', document)).toBe(true);

            vi.useRealTimers();
        });

        it('should deny access outside business hours', () => {
            // Mock date to Wednesday 8:00 AM (before 9 AM)
            vi.setSystemTime(new Date('2026-01-08T08:00:00'));

            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'documents:update:business_hours', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUserWithConditions(permissions, userContext);
            const document = { __typename: 'Document', id: 'doc-1' };

            expect(ability.can('update', document)).toBe(false);

            vi.useRealTimers();
        });

        it('should deny access on weekends', () => {
            // Mock date to Saturday 10:00 AM
            vi.setSystemTime(new Date('2026-01-10T10:00:00')); // Saturday

            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'documents:update:business_hours', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUserWithConditions(permissions, userContext);
            const document = { __typename: 'Document', id: 'doc-1' };

            expect(ability.can('update', document)).toBe(false);

            vi.useRealTimers();
        });

        it('should allow access at end of business hours boundary (17:59)', () => {
            // Mock date to Wednesday 5:59 PM
            vi.setSystemTime(new Date('2026-01-08T17:59:00'));

            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'documents:update:business_hours', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUserWithConditions(permissions, userContext);
            const document = { __typename: 'Document', id: 'doc-1' };

            expect(ability.can('update', document)).toBe(true);

            vi.useRealTimers();
        });

        it('should deny access at 18:00 (end boundary)', () => {
            // Mock date to Wednesday 6:00 PM
            vi.setSystemTime(new Date('2026-01-08T18:00:00'));

            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'documents:update:business_hours', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUserWithConditions(permissions, userContext);
            const document = { __typename: 'Document', id: 'doc-1' };

            expect(ability.can('update', document)).toBe(false);

            vi.useRealTimers();
        });
    });

    describe('AUBAC - Attribute-Based with User Context', () => {
        it('should use custom user attributes in policy evaluation', () => {
            const userContext: UserContext = {
                userId: 'user-123',
                role: 'manager',
                attributes: {
                    clearanceLevel: 3,
                    certifications: ['ISO27001', 'LGPD']
                }
            };

            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'documents:read', granted: true }
                ],
                denied: [],
                role: 'manager'
            };

            const ability = buildAbilityForUserWithConditions(permissions, userContext);

            // UnifiedPolicyEngine should have access to these attributes
            expect(ability.can('read', 'Document')).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty permissions gracefully', () => {
            const permissions: UserEffectivePermissions = {
                effective: [],
                denied: [],
                role: null
            };

            const ability = buildAbilityForUser(permissions);

            expect(ability.can('read', 'Product')).toBe(false);
        });

        it('should handle malformed permission keys', () => {
            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'invalid', granted: true },
                    { permissionKey: 'products:create', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUser(permissions);

            expect(ability.can('create', 'Product')).toBe(true);
        });

        it('should handle subject type detection for objects with __typename', () => {
            const permissions: UserEffectivePermissions = {
                effective: [
                    { permissionKey: 'products:read', granted: true }
                ],
                denied: [],
                role: 'member'
            };

            const ability = buildAbilityForUser(permissions);

            const product = { __typename: 'Product', id: 'prod-1', name: 'Test' };

            expect(ability.can('read', product)).toBe(true);
        });
    });
});
