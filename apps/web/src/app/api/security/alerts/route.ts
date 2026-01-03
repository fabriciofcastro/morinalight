import { NextRequest, NextResponse } from 'next/server';
import { protectedRouteMiddleware } from '@/lib/middleware/security-middleware';
import { getPrismaClient } from '@/lib/prisma';

/**
 * GET /api/security/alerts
 * List security alerts with filtering and pagination
 */
export async function GET(request: NextRequest) {
    try {
        // Aplicar middleware de segurança
        const middlewareResult = await protectedRouteMiddleware(request, {});
        if (middlewareResult) return middlewareResult;

        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 503 }
            );
        }

        // Obter usuário autenticado do contexto
        const user = (request as any).user;
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const severity = searchParams.get('severity');
        const alertType = searchParams.get('alertType');
        const acknowledged = searchParams.get('acknowledged');
        const userId = searchParams.get('userId');

        // Build where clause
        const where: any = {};

        if (severity) {
            where.severity = severity;
        }

        if (alertType) {
            where.alertType = alertType;
        }

        if (acknowledged !== null && acknowledged !== undefined) {
            where.acknowledged = acknowledged === 'true';
        }

        if (userId) {
            where.userId = userId;
        }

        // Get total count
        const total = await prisma.securityAlert.count({ where });

        // Get alerts
        const alerts = await prisma.securityAlert.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        displayName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return NextResponse.json({
            alerts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Failed to fetch security alerts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch security alerts' },
            { status: 500 }
        );
    }
}
