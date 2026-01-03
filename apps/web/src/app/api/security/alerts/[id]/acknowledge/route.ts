import { NextRequest, NextResponse } from 'next/server';
import { protectedRouteMiddleware } from '@/lib/middleware/security-middleware';
import { getPrismaClient } from '@/lib/prisma';

/**
 * POST /api/security/alerts/[id]/acknowledge
 * Mark a security alert as acknowledged
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // ... Aplicar middleware de segurança ...
        const middlewareResult = await protectedRouteMiddleware(request, {});
        if (middlewareResult) return middlewareResult;

        const { id } = await params;
        const userId = request.headers.get('x-user-id') || 'system';

        // Update alert
        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json(
                { error: 'Database unavailable' },
                { status: 503 }
            );
        }

        const alert = await prisma.securityAlert.update({
            where: { id },
            data: {
                acknowledged: true,
                acknowledgedAt: new Date(),
                acknowledgedBy: userId,
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
        });

        return NextResponse.json({
            success: true,
            alert,
        });
    } catch (error) {
        console.error('Failed to acknowledge alert:', error);
        return NextResponse.json(
            { error: 'Failed to acknowledge alert' },
            { status: 500 }
        );
    }
}
