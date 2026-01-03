/**
 * API Route - Logs
 * 
 * Endpoint para receber logs estruturados do cliente
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const logEntry = await request.json();

        // Em produção, você pode:
        // 1. Salvar no banco de dados
        // 2. Enviar para serviço de logging (Logtail, Papertrail, etc)
        // 3. Processar e agregar logs

        // Exemplo: Console log estruturado
        console.log(JSON.stringify({
            ...logEntry,
            userAgent: request.headers.get("user-agent"),
            ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        }));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to process log:", error);
        return NextResponse.json({ error: "Failed to process log" }, { status: 500 });
    }
}
