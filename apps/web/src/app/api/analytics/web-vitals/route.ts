/**
 * API Route - Web Vitals Analytics
 * 
 * Endpoint para receber métricas de Web Vitals
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/observability";

export async function POST(request: NextRequest) {
    try {
        const metrics = await request.json();

        // Log das métricas
        logger.info("Web Vitals received", {
            metrics,
            userAgent: request.headers.get("user-agent"),
        });

        // Aqui você pode:
        // 1. Salvar no banco de dados
        // 2. Enviar para serviço de analytics (Google Analytics, Mixpanel, etc)
        // 3. Enviar para sistema de monitoring (Datadog, New Relic, etc)

        // Exemplo: Salvar no banco
        // await prisma.webVitals.create({
        //   data: {
        //     name: metrics.name,
        //     value: metrics.value,
        //     rating: metrics.rating,
        //     userAgent: request.headers.get("user-agent"),
        //   },
        // });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Failed to process web vitals", error as Error);
        return NextResponse.json({ error: "Failed to process metrics" }, { status: 500 });
    }
}
