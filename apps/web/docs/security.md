# Security & Authorization Architecture

## Overview

MorinaLight implements a comprehensive, multi-layered authorization system combining **CASL** (isomorphic authorization), **RBAC** (Role-Based Access Control), **ABAC** (Attribute-Based Access Control), and **TBAC** (Time-Based Access Control).

## Core Systems

### 1. CASL (Primary Authorization Layer)

**Status**: ✅ Fully Implemented

CASL provides isomorphic authorization that works identically on both frontend and backend.

#### Backend (`apps/api`)
- `CaslAbilityFactory` - Creates abilities with ABAC conditions
- `requirePermission` middleware - Protects routes
- Supports 20+ subjects and 15+ actions

#### Frontend (`apps/web`)
- `CaslContext` & `AbilityProvider` - React context
- `Can` component - Declarative permission checks
- `useAbility` hook - Programmatic checks
- `AllowedGuard` - Route protection

**Key Files**:
- `apps/web/src/lib/auth/ability.ts` - Frontend ability factory
- `apps/web/src/lib/auth/CaslContext.tsx` - React integration
- `apps/api/src/modules/permissions/domain/factories/casl-ability.factory.ts` - Backend factory

### 2. ABAC (Attribute-Based Access Control)

**Status**: ✅ Fully Implemented

ABAC enables fine-grained permissions based on resource attributes and user context.

#### Supported Conditions

| Modifier | Description | Example |
|----------|-------------|---------|
| `own` | User owns the resource | `documents:edit:own` |
| `department` | Same department | `projects:view:department` |
| `sector` | Same sector | `reports:read:sector` |
| `active` | Resource is active | `users:manage:active` |
| `draft` | Resource is draft | `posts:edit:draft` |

#### Usage Example

```typescript
// Backend - Create ability with conditions
const ability = CaslAbilityFactory.createForUserWithConditions(
  permissions,
  { userId, departmentId, role }
);

// Check permission on specific resource
ability.can('update', 'Post', { ownerId: 'user-123' });

// Frontend - Declarative check
<Can I="update" this={{ __typename: 'Post', ownerId: post.authorId }}>
  <EditButton />
</Can>
```

### 3. TBAC (Time-Based Access Control)

**Status**: ✅ Newly Implemented

TBAC restricts access based on time of day and day of week.

#### Business Hours Modifier

```typescript
// Permission key with business_hours modifier
'documents:view:business_hours'

// Automatically enforces:
// - Monday-Friday only (days: [1,2,3,4,5])
// - 9:00 AM - 6:00 PM (start: '09:00', end: '18:00')
```

#### Implementation

The TBAC logic is integrated into the ability factory:

```typescript
if (conditions.time) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday
  const { start, end, days } = conditions.time;
  
  // Check if current day is allowed
  if (days && !days.includes(currentDay)) return false;
  
  // Check if current hour is within range
  const [startH] = start.split(':').map(Number);
  const [endH] = end.split(':').map(Number);
  if (currentHour < startH || currentHour >= endH) return false;
}
```

**Key File**: `apps/web/src/lib/auth/ability.ts` (lines 123-138)

### 4. RBAC (Legacy System)

**Status**: ⚠️ Maintained for Compatibility

The legacy RBAC system is still functional but being gradually migrated to CASL.

#### Available Roles
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access
- `MANAGER` - Management operations
- `SUPERVISOR` - Supervisory access
- `USER` - Standard user
- `GUEST` - Limited visitor access

**Key File**: `apps/web/src/lib/auth/rbac.ts`

## Permission Key Format

Permissions follow the pattern: `{subject}:{action}:{modifier?}`

### Examples

```typescript
// Basic permissions
'products:view'          // View products
'users:create'           // Create users
'orders:delete'          // Delete orders

// ABAC permissions
'documents:edit:own'     // Edit own documents
'projects:view:department' // View department projects

// TBAC permissions
'system:access:business_hours' // Access only during business hours
```

### Subject Mapping

| Permission Prefix | CASL Subject |
|-------------------|--------------|
| `products`, `catalog` | `Product` |
| `users`, `representatives` | `User` |
| `clients` | `Client` |
| `orders`, `sales` | `Order` |
| `documents` | `Document` |
| `departments` | `Department` |
| `sectors` | `Sector` |

### Action Mapping

| Permission Action | CASL Action |
|-------------------|-------------|
| `view`, `list` | `read` |
| `create` | `create` |
| `edit`, `update` | `update` |
| `delete`, `remove` | `delete` |
| `manage` | `manage` |

## Security Context

The `SecurityContext` provides environmental and user attributes for advanced authorization:

```typescript
interface SecurityContext {
  user: {
    id: string;
    role: string;
    departmentId?: string;
    sectorId?: string;
    attributes?: Record<string, any>;
  };
  environment: {
    time: Date;
    ip?: string;
    userAgent?: string;
    mfaVerified?: boolean;
  };
}
```

## Integration with Unified Policy Engine

The ability factory integrates with the `UnifiedPolicyEngine` from `@morina/shared-kernel` for advanced policy evaluation:

```typescript
// After ABAC/TBAC checks, validate against security policies
return unifiedPolicyEngine.evaluate(
  action,
  subject,
  securityContext,
  resource
);
```

## Testing

Unit tests verify TBAC and ABAC functionality:

**Test File**: `apps/web/src/lib/auth/ability.test.ts`

```typescript
// TBAC Test
it('should respect TBAC (Business Hours)', () => {
  vi.setSystemTime(new Date('2023-01-02T10:00:00')); // Monday 10 AM
  const ability = buildAbilityForUserWithConditions(permissions, context);
  expect(ability.can('read', document)).toBe(true);
  
  vi.setSystemTime(new Date('2023-01-01T10:00:00')); // Sunday
  const ability2 = buildAbilityForUserWithConditions(permissions, context);
  expect(ability2.can('read', document)).toBe(false);
});

// ABAC Test
it('should respect ABAC department conditions', () => {
  const ability = buildAbilityForUserWithConditions(permissions, context);
  expect(ability.can('read', { departmentId: 'dept-1' })).toBe(true);
  expect(ability.can('read', { departmentId: 'dept-2' })).toBe(false);
});
```

## Best Practices

### 1. Use CASL for New Features
Always use CASL for new authorization logic. The legacy RBAC system is maintained only for backward compatibility.

### 2. Leverage ABAC for Fine-Grained Control
Use ABAC modifiers when permissions depend on resource ownership or organizational structure:

```typescript
// ✅ Good - Fine-grained
'documents:edit:own'

// ❌ Avoid - Too broad
'documents:edit'
```

### 3. Combine TBAC with Other Modifiers
TBAC can be combined with ABAC for complex scenarios:

```typescript
// Access own documents only during business hours
'documents:view:own:business_hours'
```

### 4. Test Time-Based Logic
Always test TBAC logic with mocked times to ensure correct behavior across different time zones and edge cases.

## Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Sidebar | ✅ Migrated | Uses CASL |
| Middleware | ✅ Migrated | Uses UnifiedPolicyEngine |
| API Routes | ⚠️ Partial | Some still use legacy RBAC |
| UI Components | ⚠️ Partial | 2/27 migrated to CASL |

## Future Enhancements

- [ ] Complete migration of all components to CASL
- [ ] Deprecate legacy RBAC system
- [ ] Add E2E tests for authorization flows
- [ ] Implement custom TBAC schedules (beyond business_hours)
- [ ] Add ACL for object-level permissions

## References

- [CASL Documentation](https://casl.js.org/)
- Security Audit: `/home/fabricio/.gemini/antigravity/brain/7e0d5315-123e-4c08-87b4-af182e706ee6/security-audit.md.resolved`
- Implementation Plan: `/home/fabricio/.gemini/antigravity/brain/0f5c76b1-d15a-4ed4-a649-ff99c8aee5cc/implementation_plan.md`
