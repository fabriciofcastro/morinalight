/**
 * API Route - Data Deletion Request (LGPD)
 * 
 * Endpoint para solicitar exclusão de dados
 */

import { NextRequest, NextResponse } from "next/server";
import { dataDeletionService } from "@/lib/lgpd";

export async function POST(request: NextRequest) {
    try {
        const { userId, reason } = await request.json();

        // TODO: Verificar autenticação
        // const currentUser = await getUserFromRequest(request);

        // Verificar se pode deletar
        const { canDelete, reasons } = await dataDeletionService.canDeleteData(userId);

        if (!canDelete) {
            return NextResponse.json(
                {
                    error: "Cannot delete data",
                    reasons,
                },
                { status: 400 },
            );
        }

        // Criar solicitação
        const deletionRequest = await dataDeletionService.requestDeletion(
            userId,
            userId, // currentUser.id
            reason,
        );

        return NextResponse.json({
            success: true,
            request: deletionRequest,
            message:
                "Solicitação de exclusão criada. Será processada em até 15 dias conforme LGPD.",
        });
    } catch (error) {
        console.error("Failed to request data deletion:", error);
        return NextResponse.json(
            { error: "Failed to request data deletion" },
            { status: 500 },
        );
    }
}
