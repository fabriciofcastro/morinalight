import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { CERTIFICATIONS } from "@/components/certifications/constants";
import { logger } from "@/lib/observability";

export async function POST(request: NextRequest) {
    try {
        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        // Criar as certificações globais
        for (const cert of CERTIFICATIONS) {
            await prisma.certification.upsert({
                where: { id: cert.id },
                update: {
                    title: cert.title,
                    description: cert.description,
                    category: cert.category,
                    icon: cert.icon,
                    benefits: cert.details?.benefits || [],
                    evidence: cert.details?.evidence || [],
                    baseScore: cert.details?.score || 0,
                    isActive: true,
                },
                create: {
                    id: cert.id,
                    title: cert.title,
                    description: cert.description,
                    category: cert.category,
                    icon: cert.icon,
                    benefits: cert.details?.benefits || [],
                    evidence: cert.details?.evidence || [],
                    baseScore: cert.details?.score || 0,
                    isActive: true,
                }
            });
        }

        // Se houver uma organização selecionada no cookie, criar os registros dela também
        const selectedOrgId = request.cookies.get("selected_org_id")?.value;
        if (selectedOrgId) {
            for (const cert of CERTIFICATIONS) {
                await prisma.organizationCertification.upsert({
                    where: {
                        orgId_certificationId: {
                            orgId: selectedOrgId,
                            certificationId: cert.id
                        }
                    },
                    update: {
                        status: cert.status,
                        progress: cert.progress,
                        score: cert.details?.score || 0,
                    },
                    create: {
                        orgId: selectedOrgId,
                        certificationId: cert.id,
                        status: cert.status,
                        progress: cert.progress,
                        score: cert.details?.score || 0,
                    }
                });
            }
        }

        return NextResponse.json({ success: true, message: "Certifications seeded" });
    } catch (error) {
        logger.error("Failed to seed certifications", error as Error);
        return NextResponse.json({ error: "Failed to seed certifications" }, { status: 500 });
    }
}
