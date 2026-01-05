/**
 * Global Rate Limiting Configuration
 * 
 * Provides different rate limit tiers for different types of operations
 */

export const globalRateLimitConfig = {
    global: true,
    max: 1000, // 1000 requests
    timeWindow: "15 minutes",
    skipOnError: true, // Fail-open strategy
    keyGenerator: (request: any) => {
        // Use IP + user ID if authenticated
        return request.user?.userId
            ? `${request.ip}-${request.user.userId}`
            : request.ip;
    },
};

export const strictRateLimitConfig = {
    max: 100,
    timeWindow: "1 minute",
};

export const authRateLimitConfig = {
    max: 5,
    timeWindow: "15 minutes",
};

export const apiRateLimitConfig = {
    max: 300,
    timeWindow: "5 minutes",
};

export const publicRateLimitConfig = {
    max: 60,
    timeWindow: "1 minute",
};
