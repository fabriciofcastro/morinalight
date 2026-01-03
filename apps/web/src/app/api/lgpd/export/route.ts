/**
 * API Route - Data Export (LGPD)
 * 
 * Endpoint para exportar dados pessoais
 */

import { NextRequest, NextResponse } from "next/server";
import { dataPortabilityService } from "@/lib/lgpd";

export async function POST(request: NextRequest) {
    try {
        const { userId, format = "json" } = await request.json();

        // TODO: Verificar autenticação e autorização
        // const currentUser = await getUserFromRequest(request);
        // if (currentUser.id !== userId && currentUser.role !== 'admin') {
        //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        const blob = await dataPortabilityService.exportUserData(
            userId,
            userId,
            format as "json" | "csv" | "xml",
        );

        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const filename = `dados-pessoais-${userId}.${format}`;

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": blob.type,
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Failed to export data:", error);
        return NextResponse.json(
            { error: "Failed to export data" },
            { status: 500 },
        );
    }
}
