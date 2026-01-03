/**
 * MFA Setup API Route
 * 
 * POST /api/auth/mfa/setup
 * Inicia o processo de configuração de MFA para o usuário
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

        // Gerar secret, QR code e backup codes
        const { secret, qrCodeDataUrl, backupCodes } = await mfaService.enableMFA(
            user.id,
            user.email
        );

        logger.info("MFA setup initiated", { userId: user.id });

        return NextResponse.json({
            secret, // Retornar secret para armazenar temporariamente
            qrCodeDataUrl,
            backupCodes, // Mostrar UMA VEZ para o usuário
        });
    } catch (error) {
        logger.error("MFA setup failed", error as Error);

        return NextResponse.json(
            { error: "Failed to setup MFA" },
            { status: 500 }
        );
    }
}
