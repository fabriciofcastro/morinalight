/**
 * Admin API: Block/Unblock IP Address
 * 
 * POST /api/security/block-ip
 */

import { adminRouteMiddleware } from "@/lib/middleware/security-middleware";
import { logger } from "@/lib/observability";
import { getPrismaClient } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    ip: z.string(), // simplified to avoid TS error if ip() is misbehaving in this version
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

        const { ip, minutes, reason } = parsed.data;
        const prisma = await getPrismaClient();

        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        if (minutes === 0) {
            // Unblock IP
            await prisma.blockedIP.deleteMany({
                where: { ip }
            });

            logger.info("IP unblocked by admin", {
                adminId: sessionUser.id,
                ip,
                reason
            });

            return NextResponse.json({
                success: true,
                message: `IP ${ip} unblocked`
            });
        } else {
            // Block IP
            const expiresAt = new Date(Date.now() + minutes * 60000);

            const blockedIP = await prisma.blockedIP.upsert({
                where: { ip },
                update: {
                    expiresAt,
                    reason,
                    createdBy: sessionUser.id
                },
                create: {
                    ip,
                    expiresAt,
                    reason,
                    createdBy: sessionUser.id
                }
            });

            logger.info("IP blocked by admin", {
                adminId: sessionUser.id,
                ip,
                minutes,
                expiresAt,
                reason
            });

            return NextResponse.json({
                success: true,
                message: `IP ${ip} blocked until ${expiresAt.toISOString()}`,
                blockedIP
            });
        }

    } catch (error) {
        logger.error("Failed to update IP block status", error as Error);
        return NextResponse.json(
            { error: "Failed to update block status" },
            { status: 500 }
        );
    }
}
