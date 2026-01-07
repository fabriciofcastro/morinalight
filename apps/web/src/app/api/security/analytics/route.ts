/**
 * Security Analytics API
 * 
 * Provides aggregated security metrics and analytics data
 */

import { adminRouteMiddleware } from '@/lib/middleware/security-middleware';
import { getPrismaClient } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Apply security middleware
    const middlewareResult = await adminRouteMiddleware(request, {});
    if (middlewareResult) return middlewareResult;

    // Check admin role
    const sessionUser = (request as any).user;
    if (!sessionUser || !['admin', 'super_admin'].includes(sessionUser.role)) {
        return NextResponse.json(
            { error: 'Forbidden - Administrator privileges required' },
            { status: 403 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json(
                { error: 'Database unavailable' },
                { status: 503 }
            );
        }

        // Get all alerts in time range
        const alerts = await prisma.securityAlert.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                user: {
                    select: {
                        email: true,
                        displayName: true,
                    },
                },
            },
        });

        // Time series data (alerts per day)
        const timeSeriesMap = new Map<string, number>();
        alerts.forEach(alert => {
            const date = alert.createdAt.toISOString().split('T')[0]!;
            timeSeriesMap.set(date, (timeSeriesMap.get(date) || 0) + 1);
        });

        const timeSeries = Array.from(timeSeriesMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Alert type distribution
        const typeDistribution = alerts.reduce((acc, alert) => {
            acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Severity distribution
        const severityDistribution = alerts.reduce((acc, alert) => {
            acc[alert.severity] = (acc[alert.severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Geographic distribution
        const geoDistribution = alerts.reduce((acc, alert) => {
            const country = alert.country || (alert.metadata as any)?.country;
            if (country) {
                acc[country] = (acc[country] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // Top affected users
        const userAlerts = alerts.reduce((acc, alert) => {
            const email = alert.user.email;
            if (!acc[email]) {
                acc[email] = {
                    email,
                    displayName: alert.user.displayName,
                    count: 0,
                    critical: 0,
                };
            }
            acc[email].count++;
            if (alert.severity === 'critical') {
                acc[email].critical++;
            }
            return acc;
        }, {} as Record<string, any>);

        const topUsers = Object.values(userAlerts)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 10);

        // Blocked users/IPs
        const blockedUsers = await prisma.user.count({
            where: {
                blockedUntil: {
                    gte: new Date(),
                },
            },
        });

        const blockedIPs = await prisma.blockedIP.count({
            where: {
                OR: [
                    { expiresAt: { gte: new Date() } },
                    { expiresAt: null },
                ],
            },
        });

        // Summary stats
        const summary = {
            totalAlerts: alerts.length,
            criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
            highAlerts: alerts.filter(a => a.severity === 'high').length,
            blockedUsers,
            blockedIPs,
            uniqueUsers: new Set(alerts.map(a => a.userId)).size,
        };

        // Trend analysis (compare with previous period)
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - days);

        const previousAlerts = await prisma.securityAlert.count({
            where: {
                createdAt: {
                    gte: previousStartDate,
                    lt: startDate,
                },
            },
        });

        const trend = {
            current: alerts.length,
            previous: previousAlerts,
            change: previousAlerts > 0
                ? ((alerts.length - previousAlerts) / previousAlerts) * 100
                : 0,
            direction: alerts.length > previousAlerts ? 'up' : 'down',
        };

        return NextResponse.json({
            summary,
            timeSeries,
            typeDistribution,
            severityDistribution,
            geoDistribution,
            topUsers,
            trend,
            period: {
                days,
                startDate: startDate.toISOString(),
                endDate: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('[Security Analytics] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}
