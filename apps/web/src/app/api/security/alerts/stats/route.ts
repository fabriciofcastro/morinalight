import { NextRequest, NextResponse } from 'next/server';
import { protectedRouteMiddleware } from '@/lib/middleware/security-middleware';
import { getPrismaClient } from '@/lib/prisma';

/**
 * GET /api/security/alerts/stats
 * Get security alert statistics
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

        // Get time range from query params
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '7');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get total alerts
        const totalAlerts = await prisma.securityAlert.count({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
        });

        // Get alerts by severity
        const alertsBySeverity = await prisma.securityAlert.groupBy({
            by: ['severity'],
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            _count: {
                id: true,
            },
        });

        // Get alerts by type
        const alertsByType = await prisma.securityAlert.groupBy({
            by: ['alertType'],
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            _count: {
                id: true,
            },
        });

        // Get unacknowledged alerts
        const unacknowledgedAlerts = await prisma.securityAlert.count({
            where: {
                acknowledged: false,
                createdAt: {
                    gte: startDate,
                },
            },
        });

        // Get recent critical alerts
        const criticalAlerts = await prisma.securityAlert.findMany({
            where: {
                severity: 'critical',
                createdAt: {
                    gte: startDate,
                },
            },
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
            take: 10,
        });

        // Get alerts timeline (daily counts)
        const timeline = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM "SecurityAlert"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

        // Get MFA Adoption Rate
        const totalUsers = await prisma.user.count();
        const usersWithMfa = await prisma.user.count({
            where: { twoFactorEnabled: true }
        });
        const mfaAdoptionRate = totalUsers > 0 ? (usersWithMfa / totalUsers) * 100 : 0;

        return NextResponse.json({
            totalAlerts,
            unacknowledgedAlerts,
            alertsBySeverity: alertsBySeverity.map(item => ({
                severity: item.severity,
                count: item._count.id,
            })),
            alertsByType: alertsByType.map(item => ({
                type: item.alertType,
                count: item._count.id,
            })),
            criticalAlerts,
            timeline: timeline.map(item => ({
                date: item.date,
                count: Number(item.count),
            })),
            mfaAdoptionRate,
            totalUsers
        });
    } catch (error) {
        console.error('Failed to fetch security stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch security stats' },
            { status: 500 }
        );
    }
}
