/**
 * MFA Verify API Route
 * 
 * POST /api/auth/mfa/verify
 * Verifica o código TOTP e ativa o MFA para o usuário
 */

import { NextRequest, NextResponse } from "next/server";
import { protectedRouteMiddleware } from "@/lib/middleware/security-middleware";
import { mfaService } from "@/lib/auth/mfa";
import { logger } from "@/lib/observability";

export async function POST(request: NextRequest, context: any) {
    // Aplicar middleware de segurança
    const middlewareResult = await protectedRouteMiddleware(request, context);
    if (middlewareResult) return middlewareResult;

    try {
        const user = (request as any).user;

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
                { error: "Token is required" },
                { status: 400 }
            );
        }

        // Verificar e ativar MFA
        const isValid = await mfaService.confirmMFA(user.id, token);

        if (!isValid) {
            logger.warn("Invalid MFA token during setup", { userId: user.id });

            return NextResponse.json(
                { error: "Invalid token" },
                { status: 400 }
            );
        }

        logger.info("MFA enabled successfully", { userId: user.id });

        return NextResponse.json({
            success: true,
            message: "MFA enabled successfully",
        });
    } catch (error) {
        logger.error("MFA verification failed", error as Error);

        return NextResponse.json(
            { error: "Failed to verify MFA" },
            { status: 500 }
        );
    }
}
