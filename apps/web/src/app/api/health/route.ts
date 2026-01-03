/**
 * Health Check Endpoint for MorinaLight
 * Tests system components and returns status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis/client';

export async function GET(request: NextRequest) {
    const checks = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        components: {} as Record<string, { status: string; message?: string; latency?: number }>,
    };

    // 1. Database Check
    try {
        const start = Date.now();
        const prisma = await getPrismaClient();
        if (prisma) {
            await prisma.$queryRaw`SELECT 1`;
            checks.components.database = {
                status: 'healthy',
                latency: Date.now() - start,
            };
        } else {
            checks.components.database = {
                status: 'unavailable',
                message: 'Prisma client not initialized',
            };
            checks.status = 'degraded';
        }
    } catch (error) {
        checks.components.database = {
            status: 'unhealthy',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
        checks.status = 'unhealthy';
    }

    // 2. Redis Check (Optional)
    try {
        const start = Date.now();
        const redis = getRedisClient();
        if (redis) {
            await redis.ping();
            checks.components.redis = {
                status: 'healthy',
                latency: Date.now() - start,
            };
        } else {
            checks.components.redis = {
                status: 'not_configured',
                message: 'Redis not configured (using fallback)',
            };
        }
    } catch (error) {
        checks.components.redis = {
            status: 'unhealthy',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
        // Redis is optional, so don't mark overall as unhealthy
    }

    // 3. Environment Variables Check
    const requiredEnvVars = [
        'ENCRYPTION_MASTER_KEY',
        'ENCRYPTION_SALT',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
    ];

    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    checks.components.environment = {
        status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
        message: missingVars.length > 0 ? `Missing: ${missingVars.join(', ')}` : undefined,
    };

    if (missingVars.length > 0) {
        checks.status = 'unhealthy';
    }

    // 4. Security Features Check
    checks.components.security = {
        status: 'healthy',
        message: [
            `MFA: ${process.env.ENABLE_MFA === 'true' ? 'enabled' : 'disabled'}`,
            `IDS: ${process.env.IDS_ENABLED === 'true' ? 'enabled' : 'disabled'}`,
        ].join(', '),
    };

    return NextResponse.json(checks, {
        status: checks.status === 'healthy' ? 200 : checks.status === 'degraded' ? 200 : 503,
    });
}
