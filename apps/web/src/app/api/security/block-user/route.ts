/**
 * Admin API: Block/Unblock User
 * 
 * POST /api/security/block-user
 */

import { NextRequest, NextResponse } from "next/server";
import { adminRouteMiddleware } from "@/lib/middleware/security-middleware";
import { getPrismaClient } from "@/lib/prisma";
import { logger } from "@/lib/observability";
import { z } from "zod";

const schema = z.object({
    userId: z.string().uuid(),
    minutes: z.number().int().min(0).max(525600), // Max 1 year (0 to unblock)
    reason: z.string().optional(),
});

export async function POST(request: NextRequest, context: any) {
    // 1. Aplicar Middleware de Admin
    const middlewareResult = await adminRouteMiddleware(request, context);
    if (middlewareResult) return middlewareResult;

    // 2. Verificar explicitamente se o usuário é admin
    const sessionUser = (request as any).user;
    if (!sessionUser || !["admin", "super_admin"].includes(sessionUser.role)) {
        return NextResponse.json(
            { error: "Forbidden - Administrator privileges required" },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request data", issues: parsed.error.format() },
                { status: 400 }
            );
        }

        const { userId, minutes, reason } = parsed.data;
        const prisma = await getPrismaClient();

        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const unblockAt = minutes > 0 ? new Date(Date.now() + minutes * 60000) : null;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { blockedUntil: unblockAt },
            select: { id: true, email: true, blockedUntil: true }
        });

        logger.info(`${minutes > 0 ? 'User blocked' : 'User unblocked'} by admin`, {
            adminId: sessionUser.id,
            targetUserId: userId,
            minutes,
            reason
        });

        return NextResponse.json({
            success: true,
            message: minutes > 0 ? `User blocked until ${unblockAt?.toISOString()}` : "User unblocked",
            user: updatedUser
        });

    } catch (error) {
        logger.error("Failed to update user block status", error as Error);
        return NextResponse.json(
            { error: "Failed to update block status" },
            { status: 500 }
        );
    }
}
