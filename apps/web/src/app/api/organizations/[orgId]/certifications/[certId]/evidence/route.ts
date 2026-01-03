import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { adminRouteMiddleware } from '@/lib/middleware/security-middleware';

/**
 * POST /api/organizations/[orgId]/certifications/[certId]/evidence
 * Adiciona uma evidência (link/referência) a uma certificação
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orgId: string, certId: string }> }
) {
    try {
        // Apenas admins podem adicionar evidências
        const middlewareResult = await adminRouteMiddleware(request, {});
        if (middlewareResult) return middlewareResult;

        const { orgId, certId } = await params;
        const body = await request.json();
        const { title, url, type, description } = body;

        if (!title || !url) {
            return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
        }

        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }

        // Buscar registro atual
        const orgCert = await prisma.organizationCertification.findUnique({
            where: {
                orgId_certificationId: {
                    orgId,
                    certificationId: certId
                }
            }
        });

        if (!orgCert) {
            return NextResponse.json({ error: 'Certification progress not found' }, { status: 404 });
        }

        // Atualizar lista de evidências
        const currentEvidence = (orgCert.evidenceLinks as any[]) || [];
        const newEvidence = {
            id: crypto.randomUUID(),
            title,
            url,
            type: type || 'document',
            description,
            uploadedAt: new Date().toISOString(),
            version: currentEvidence.length + 1
        };

        const updatedEvidence = [...currentEvidence, newEvidence];

        // Atualizar no banco
        await prisma.organizationCertification.update({
            where: { id: orgCert.id },
            data: {
                evidenceLinks: updatedEvidence,
                // Aumentar progresso se antes era 0
                progress: Math.max(orgCert.progress, 10),
                status: orgCert.status === 'pending' ? 'in-progress' : orgCert.status
            }
        });

        return NextResponse.json({
            success: true,
            evidence: newEvidence
        });
    } catch (error) {
        console.error('[Evidence API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to add evidence' },
            { status: 500 }
        );
    }
}
