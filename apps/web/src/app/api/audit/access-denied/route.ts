/**
 * API Route - Audit Access Denied
 * 
 * Endpoint para registrar acessos negados
 */

import { NextRequest, NextResponse } from "next/server";
import { auditService } from "@/lib/audit/audit-service";

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        await auditService.log({
            action: "access_denied",
            userId: data.userId,
            userRole: data.userRole,
            resource: data.resource,
            resourceId: data.resourceId,
            metadata: {
                path: data.path,
                method: data.method,
                attemptedAction: data.action,
            },
            ipAddress: data.ip,
            userAgent: data.userAgent,
            success: false,
            errorMessage: "Access denied - insufficient permissions",
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to log access denied:", error);
        return NextResponse.json(
            { error: "Failed to log access denied" },
            { status: 500 },
        );
    }
}
