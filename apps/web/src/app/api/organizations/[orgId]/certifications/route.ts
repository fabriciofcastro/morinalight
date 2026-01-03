import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { logger } from "@/lib/observability";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orgId: string }> }
) {
    try {
        const { orgId } = await params;
        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const orgCertifications = await prisma.organizationCertification.findMany({
            where: { orgId },
            include: {
                certification: true
            },
            orderBy: { certification: { title: "asc" } }
        });

        return NextResponse.json(orgCertifications);
    } catch (error) {
        logger.error("Failed to fetch organization certifications", error as Error);
        return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orgId: string }> }
) {
    try {
        const { orgId } = await params;
        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const body = await request.json();
        const { certificationId, status, progress, score, evidenceLinks } = body;

        if (!certificationId) {
            return NextResponse.json({ error: "Missing certificationId" }, { status: 400 });
        }

        const orgCert = await prisma.organizationCertification.upsert({
            where: {
                orgId_certificationId: {
                    orgId,
                    certificationId
                }
            },
            update: {
                status,
                progress,
                score,
                evidenceLinks,
                updatedAt: new Date()
            },
            create: {
                orgId,
                certificationId,
                status: status || "pending",
                progress: progress || 0,
                score: score || 0,
                evidenceLinks: evidenceLinks || []
            }
        });

        return NextResponse.json(orgCert);
    } catch (error) {
        logger.error("Failed to update organization certification", error as Error);
        return NextResponse.json({ error: "Failed to update certification" }, { status: 500 });
    }
}
