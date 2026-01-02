/**
 * Auth Index - Updated with All Auth Modules
 */

// RBAC
export {
    ROLES,
    RESOURCES,
    ACTIONS,
    ROLE_PERMISSIONS,
    ROLE_HIERARCHY,
    hasPermission,
    can,
    getPermissions,
    hasAnyPermission,
    hasAllPermissions,
    inheritsFrom,
    userHasPermission,
    userCan,
    type Role,
    type Resource,
    type Action,
    type Permission,
    type UserWithPermissions,
} from "./rbac";

// CASL Integration
export { AbilityContext, Can, useAbility, AbilityProvider } from './CaslContext';

// ABAC Helpers
export {
    useCanAny,
    useCanAll,
    useCanOwn,
    useCanWithConditions,
    useIsOwner,
    useIsSameDepartment
} from './ability-helpers';

// Legacy exports (deprecated)
export { usePermission, useCan, Can as LegacyCan, withPermission } from "./hooks";
export { hasPermission, can } from "./rbac";

// ABAC
export {
    ABACEngine,
    abacEngine,
    type ABACPolicy,
    type ABACCondition,
    type ABACContext,
} from "./abac";

// Middleware
export {
    requirePermission,
    requirePolicy,
    compose,
    type AuthContext,
} from "./middleware";

// Hooks (Frontend)
export {
    usePermission,
    useCan,
    usePermissions,
    Can,
} from "./hooks";

// JWT
export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    isTokenExpired,
    type TokenPayload,
} from "./jwt";

// MFA
export {
    generateMFASecret,
    generateQRCode,
    verifyMFAToken,
    generateBackupCodes,
    hashBackupCode,
    verifyBackupCode,
    MFAService,
    mfaService,
} from "./mfa";

// Session Management
export {
    SessionManager,
    sessionManager,
    type UserSession,
} from "./session-manager";
