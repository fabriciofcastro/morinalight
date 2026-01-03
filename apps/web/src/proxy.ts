import { NextRequest, NextResponse } from 'next/server';
import { redisRateLimiter } from '@/lib/rate-limit/redis-rate-limiter';
import { getRateLimitConfig, getRateLimitKey } from '@/lib/rate-limit/rate-limit-config';
import { threatFeedAggregator } from '@/lib/threat-intel/threat-feed-aggregator';
import { siemExporter } from '@/lib/siem/siem-exporter';
import { proxy as authProxy } from './auth-proxy';

/**
 * Global Middleware for MorinaLight
 * 
 * Integrates:
 * 1. Authentication & Routing (Proxy)
 * 2. Security Headers (Proxy)
 * 3. Threat Intelligence (IP Reputation)
 * 4. Attack Pattern Detection (SQLi, XSS, etc)
 * 5. Distributed Rate Limiting (Redis)
 * 6. SIEM Logging
 */
export default async function (request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Skip security checks for public assets and internal Next.js paths
    if (
        path.startsWith('/_next/') ||
        path.startsWith('/static/') ||
        path.startsWith('/favicon.ico') ||
        path.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|map)$/)
    ) {
        return NextResponse.next();
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1';

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
        }
    }

    // 2. ATTACK PATTERN DETECTION
    if (process.env.THREAT_INTEL_ENABLED === 'true') {
        try {
            // Only check API routes or specific inputs to minimize overhead
            if (path.startsWith('/api/')) {
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
                        },
                    });

                    return NextResponse.json(
                        { error: 'Malicious request detected' },
                        { status: 400 }
                    );
                }
            }
        } catch (error) {
            console.error('Attack pattern detection failed:', error);
        }
    }

    // 3. REDIS RATE LIMITING - Distributed protection for API routes
    if (path.startsWith('/api/') && process.env.RATE_LIMIT_ENABLED === 'true') {
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
        } catch (error) {
            console.error('Rate limiting failed:', error);
        }
    }

    // 4. AUTHENTICATION & ROUTING (Delegated to auth-proxy.ts)
    return authProxy(request);
}

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
