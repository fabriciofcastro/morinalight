/**
 * Rate Limit Configuration
 * 
 * Centralized configuration for rate limiting across all routes
 */

import type { RateLimitConfig } from './redis-rate-limiter';

/**
 * Rate limit configurations by route pattern
 */
export const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig> = {
    // Authentication routes (strict)
    '/api/auth/login': { requests: 5, window: '15m' },
    '/api/auth/register': { requests: 3, window: '1h' },
    '/api/auth/forgot-password': { requests: 3, window: '1h' },
    '/api/auth/reset-password': { requests: 5, window: '1h' },
    '/api/auth/mfa/verify': { requests: 10, window: '15m' },

    // API routes (moderate)
    '/api/users': { requests: 100, window: '1m' },
    '/api/products': { requests: 200, window: '1m' },
    '/api/orders': { requests: 100, window: '1m' },

    // Public routes (lenient)
    '/api/public': { requests: 1000, window: '1m' },

    // Admin routes (moderate)
    '/api/admin': { requests: 200, window: '1m' },

    // Default for all other API routes
    '/api': { requests: 100, window: '1m' },

    // Global limit per IP
    'global': { requests: 1000, window: '1h' },
};

/**
 * Get rate limit config for a route
 */
export function getRateLimitConfig(path: string): RateLimitConfig {
    // Try exact match first
    if (RATE_LIMIT_CONFIG[path]) {
        return RATE_LIMIT_CONFIG[path];
    }

    // Try prefix match (longest first)
    const sortedPaths = Object.keys(RATE_LIMIT_CONFIG)
        .filter(p => path.startsWith(p))
        .sort((a, b) => b.length - a.length);

    if (sortedPaths.length > 0) {
        return RATE_LIMIT_CONFIG[sortedPaths[0]];
    }

    // Default fallback
    return { requests: 100, window: '1m' };
}

/**
 * Get rate limit key for a request
 */
export function getRateLimitKey(
    identifier: string,
    path: string,
    scope: 'user' | 'ip' | 'global' = 'user'
): string {
    return `ratelimit:${scope}:${identifier}:${path}`;
}
