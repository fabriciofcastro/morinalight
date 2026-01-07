/**
 * Security Index
 * 
 * Exportações centralizadas de segurança
 */

// CSRF Protection
export {
    generateCSRFToken,
    validateCSRFToken,
    withCSRFProtection,
    useCSRFToken,
    setupCSRFInterceptor,
} from "./csrf";

// Rate Limiting
export {
    rateLimit,
    RateLimiters,
    ClientRateLimiter,
    useRateLimit,
    type RateLimitConfig,
} from "./rate-limit";

// Security Utilities
export {
    sanitizeInput,
    isValidEmail,
    isStrongPassword,
    hashPassword,
    isSecureURL,
    sanitizeObject,
    generateSecureId,
    isSecureContext,
    constantTimeCompare,
} from "./utils";

// Security Headers
export { securityHeadersMiddleware as securityHeaders } from "../middleware/security-middleware";
