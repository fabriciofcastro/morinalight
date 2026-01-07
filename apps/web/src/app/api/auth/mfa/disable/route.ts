/**
 * MFA Disable API Route
 * 
 * POST /api/auth/mfa/disable
 * Desabilita o MFA para o usuário (requer token de confirmação)
 */

import { mfaService } from "@/lib/auth/mfa";
import { AuthenticatedRequest, protectedRouteMiddleware } from "@/lib/middleware/security-middleware";
import { logger } from "@/lib/observability";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, context: unknown) {
    // Aplicar middleware de segurança
    const middlewareResult = await protectedRouteMiddleware(request, context);
    if (middlewareResult) return middlewareResult;

    try {
        const user = (request as AuthenticatedRequest).user;

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: "Token is required to disable MFA" },
                { status: 400 }
            );
        }

        // Desabilitar MFA (requer token válido)
        const isValid = await mfaService.disableMFA(user.id, token);

        if (!isValid) {
            logger.warn("Invalid token during MFA disable", { userId: user.id });

            return NextResponse.json(
                { error: "Invalid token" },
                { status: 400 }
            );
        }

        logger.info("MFA disabled", { userId: user.id });

        return NextResponse.json({
            success: true,
            message: "MFA disabled successfully",
        });
    } catch (error) {
        logger.error("MFA disable failed", error as Error);

        return NextResponse.json(
            { error: "Failed to disable MFA" },
            { status: 500 }
        );
    }
}
