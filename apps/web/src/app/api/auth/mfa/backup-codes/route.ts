/**
 * MFA Backup Codes API Route
 * 
 * POST /api/auth/mfa/backup-codes
 * Gera novos backup codes para o usuário (requer MFA habilitado)
 */

import { generateBackupCodes, hashBackupCode } from "@/lib/auth/mfa";
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

        // TODO: Verificar se MFA está habilitado
        // const userFromDb = await userRepository.findById(user.id);
        // if (!userFromDb?.twoFactorEnabled) {
        //     return NextResponse.json(
        //         { error: "MFA not enabled" },
        //         { status: 400 }
        //     );
        // }

        // Gerar novos backup codes
        const backupCodes = generateBackupCodes(10);
        const hashedCodes = await Promise.all(
            backupCodes.map((code) => hashBackupCode(code))
        );

        // TODO: Salvar no banco
        // await userRepository.update(user.id, {
        //     twoFactorBackupCodes: JSON.stringify(hashedCodes),
        // });

        logger.info("New backup codes generated", { userId: user.id });

        return NextResponse.json({
            backupCodes, // Mostrar UMA VEZ para o usuário
        });
    } catch (error) {
        logger.error("Backup codes generation failed", error as Error);

        return NextResponse.json(
            { error: "Failed to generate backup codes" },
            { status: 500 }
        );
    }
}
