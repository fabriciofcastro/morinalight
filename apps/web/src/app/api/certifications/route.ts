import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { logger } from "@/lib/observability";

export async function GET(request: NextRequest) {
    try {
        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const certifications = await prisma.certification.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json(certifications);
    } catch (error) {
        logger.error("Failed to fetch certifications", error as Error);
        return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const body = await request.json();
        const { title, description, category, icon, benefits, evidence, baseScore } = body;

        if (!title || !description || !category || !icon) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const certification = await prisma.certification.create({
            data: {
                title,
                description,
                category,
                icon,
                benefits,
                evidence,
                baseScore: baseScore || 0,
            }
        });

        return NextResponse.json(certification, { status: 201 });
    } catch (error) {
        logger.error("Failed to create certification", error as Error);
        return NextResponse.json({ error: "Failed to create certification" }, { status: 500 });
    }
}
