/**
 * Auth Index - Updated with All Auth Modules
 */

// CASL Integration
export { AbilityContext, AbilityProvider, Can, useAbility } from './CaslContext';

// ABAC Helpers
export {
    useCanAll, useCanAny, useCanOwn,
    useCanWithConditions,
    useIsOwner,
    useIsSameDepartment
} from './ability-helpers';

// Legacy exports (deprecated)
export { withPermission } from "./hooks";

// Middleware - SERVER ONLY - Import directly from './middleware' in server code
// export {
//     requirePermission,
//     requirePolicy,
//     compose,
//     type AuthContext,
// } from "./middleware";

// Hooks (Frontend)
export {
    useCan, usePermission
} from "./hooks";

// JWT
export {
    decodeToken, generateAccessToken,
    generateRefreshToken, isTokenExpired, verifyAccessToken,
    verifyRefreshToken, type TokenPayload
} from "./jwt";

// MFA
export {
    generateBackupCodes, generateMFASecret,
    generateQRCode, hashBackupCode, MFAService, mfaService, verifyBackupCode, verifyMFAToken
} from "./mfa";

// Session Management
export {
    SessionManager,
    sessionManager,
    type UserSession
} from "./session-manager";

