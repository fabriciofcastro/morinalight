/**
 * Enhanced Middleware with All Security Features
 * 
 * This is an example of how to integrate all enterprise security enhancements
 * into your existing middleware.
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisRateLimiter } from '@/lib/rate-limit/redis-rate-limiter';
import { getRateLimitConfig, getRateLimitKey } from '@/lib/rate-limit/rate-limit-config';
import { threatFeedAggregator } from '@/lib/threat-intel/threat-feed-aggregator';
import { siemExporter } from '@/lib/siem/siem-exporter';

/**
 * Example middleware with all security enhancements enabled
 */
export async function enhancedSecurityMiddleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    // Skip security checks for public assets
    if (path.startsWith('/_next/') || path.startsWith('/static/')) {
        return NextResponse.next();
    }

    // 1. THREAT INTELLIGENCE - Check IP reputation
    if (process.env.THREAT_INTEL_ENABLED === 'true') {
        try {
            const ipCheck = await threatFeedAggregator.shouldBlockIP(ip);

            if (ipCheck.shouldBlock) {
                // Log to SIEM
                await siemExporter.exportEvent({
                    timestamp: new Date(),
                    eventType: 'threat_blocked',
                    severity: 'high',
                    ipAddress: ip,
                    action: 'ip_blocked',
                    status: 'success',
                    message: `Blocked malicious IP: ${ipCheck.reason}`,
                    metadata: { riskScore: ipCheck.riskScore },
                });

                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
        } catch (error) {
            console.error('Threat intelligence check failed:', error);
            // Continue on error - don't block legitimate traffic
        }
    }

    // 2. ATTACK PATTERN DETECTION
    if (process.env.THREAT_INTEL_ENABLED === 'true') {
        try {
            const requestCheck = threatFeedAggregator.checkRequest({
                url: request.url,
                headers: Object.fromEntries(request.headers),
            });

            if (requestCheck.isMalicious) {
                // Log to SIEM
                await siemExporter.exportEvent({
                    timestamp: new Date(),
                    eventType: 'attack_detected',
                    severity: requestCheck.severity || 'high',
                    ipAddress: ip,
                    action: 'attack_blocked',
                    status: 'success',
                    message: 'Malicious request pattern detected',
                    metadata: {
                        patterns: requestCheck.patterns.map(p => p.type),
                        severity: requestCheck.severity,
                    },
                });

                return NextResponse.json(
                    { error: 'Malicious request detected' },
                    { status: 400 }
                );
            }
        } catch (error) {
            console.error('Attack pattern detection failed:', error);
        }
    }

    // 3. REDIS RATE LIMITING - For API routes
    if (path.startsWith('/api/')) {
        try {
            const config = getRateLimitConfig(path);
            const key = getRateLimitKey(ip, path, 'ip');

            const result = await redisRateLimiter.checkLimit(key, config);

            if (!result.allowed) {
                // Log to SIEM
                await siemExporter.exportEvent({
                    timestamp: new Date(),
                    eventType: 'rate_limit_exceeded',
                    severity: 'medium',
                    ipAddress: ip,
                    action: 'rate_limit',
                    status: 'failure',
                    message: `Rate limit exceeded for ${path}`,
                    metadata: {
                        limit: result.limit,
                        retryAfter: result.retryAfter,
                    },
                });

                return NextResponse.json(
                    { error: 'Rate limit exceeded' },
                    {
                        status: 429,
                        headers: {
                            'X-RateLimit-Limit': result.limit.toString(),
                            'X-RateLimit-Remaining': '0',
                            'X-RateLimit-Reset': result.resetAt.toISOString(),
                            'Retry-After': result.retryAfter?.toString() || '60',
                        }
                    }
                );
            }

            // Add rate limit headers to successful responses
            const response = NextResponse.next();
            response.headers.set('X-RateLimit-Limit', result.limit.toString());
            response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
            response.headers.set('X-RateLimit-Reset', result.resetAt.toISOString());

            return response;
        } catch (error) {
            console.error('Rate limiting failed:', error);
            // Continue on error - don't block legitimate traffic
        }
    }

    return NextResponse.next();
}

/**
 * INTEGRATION INSTRUCTIONS:
 * 
 * 1. Replace your existing middleware.ts with this enhanced version
 * 2. Or merge this logic into your existing middleware
 * 3. Ensure environment variables are set:
 *    - THREAT_INTEL_ENABLED=true
 *    - REDIS_URL=redis://localhost:6379
 *    - SIEM_ENABLED=true (optional)
 * 
 * 4. Test with:
 *    - Normal requests (should work)
 *    - Rapid requests (should hit rate limit)
 *    - SQL injection attempts (should be blocked)
 *    - Known malicious IPs (should be blocked)
 */

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
