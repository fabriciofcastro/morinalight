/**
 * API Route: Track Errors
 * 
 * Recebe erros do frontend e salva para analytics
 */

import { NextRequest, NextResponse } from "next/server";

interface ErrorPayload {
    code: string;
    message: string;
    statusCode: number;
    category: string;
    severity: string;
    correlationId?: string;
    traceId?: string;
    requestId?: string;
    context?: Record<string, unknown>;
    userContext?: {
        userId?: string;
        orgId?: string;
        userAgent?: string;
        url?: string;
        timestamp?: string;
    };
    timestamp: string;
}

interface TrackErrorsRequest {
    errors: ErrorPayload[];
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as TrackErrorsRequest;
        const { errors } = body;

        if (!errors || !Array.isArray(errors) || errors.length === 0) {
            return NextResponse.json(
                { error: "Invalid request: errors array is required" },
                { status: 400 }
            );
        }

        // TODO: Salvar erros no banco de dados
        // Por enquanto, apenas logamos no console
        console.log(`[Error Analytics] Received ${errors.length} error(s):`, errors);

        // Aqui você pode:
        // 1. Salvar no banco de dados (Prisma)
        // 2. Enviar para serviço externo (Sentry, LogRocket, etc)
        // 3. Processar para métricas e analytics

        // Exemplo de estrutura para salvar no banco:
        // await prisma.errorLog.createMany({
        //   data: errors.map(error => ({
        //     code: error.code,
        //     message: error.message,
        //     statusCode: error.statusCode,
        //     category: error.category,
        //     severity: error.severity,
        //     correlationId: error.correlationId,
        //     traceId: error.traceId,
        //     requestId: error.requestId,
        //     context: error.context,
        //     userContext: error.userContext,
        //     timestamp: new Date(error.timestamp),
        //   })),
        // });

        return NextResponse.json(
            {
                success: true,
                tracked: errors.length,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[Error Analytics] Failed to track errors:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
