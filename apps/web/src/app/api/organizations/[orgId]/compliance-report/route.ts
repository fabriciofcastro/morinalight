import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { protectedRouteMiddleware } from '@/lib/middleware/security-middleware';

/**
 * GET /api/organizations/[orgId]/compliance-report
 * Gera um relatório consolidado de conformidade para uma organização
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orgId: string }> }
) {
    try {
        // Autenticação e autorização básica
        const middlewareResult = await protectedRouteMiddleware(request, {});
        if (middlewareResult) return middlewareResult;

        const { orgId } = await params;
        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }

        // 1. Buscar Certificações e Progresso
        const certifications = await prisma.organizationCertification.findMany({
            where: { orgId },
            include: { certification: true }
        });

        // 2. Buscar Alertas de Segurança recentes (últimos 30 dias)
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const recentAlerts = await prisma.securityAlert.groupBy({
            by: ['severity'],
            where: {
                createdAt: { gte: last30Days }
            },
            _count: true
        });

        // 3. Status de MFA da Organização (usuários com MFA ativo)
        const userStats = await prisma.user.aggregate({
            _count: {
                id: true
            },
            where: {
                memberships: {
                    some: { organizationId: orgId }
                }
            }
        });

        // 4. Montar Relatório Consolidade
        const report = {
            organizationId: orgId,
            generatedAt: new Date().toISOString(),
            complianceScore: calculateComplianceScore(certifications),
            certifications: certifications.map(c => ({
                id: c.certification.id,
                title: c.certification.title,
                status: c.status,
                progress: c.progress,
                score: c.score,
                lastAuditedAt: c.lastAuditedAt
            })),
            securityMetrics: {
                last30DaysAlerts: recentAlerts.map(a => ({
                    severity: a.severity,
                    count: a._count
                })),
                totalUsers: userStats._count.id
            },
            status: 'valid',
            recommendations: generateRecommendations(certifications, recentAlerts)
        };

        return NextResponse.json(report);
    } catch (error) {
        console.error('[Compliance Report API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate compliance report' },
            { status: 500 }
        );
    }
}

function calculateComplianceScore(certifications: any[]): number {
    if (certifications.length === 0) return 0;
    const totalScore = certifications.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(totalScore / certifications.length);
}

function generateRecommendations(certifications: any[], alerts: any[]): string[] {
    const recommendations: string[] = [];

    // Alertas críticos?
    const criticals = alerts.find(a => a.severity === 'critical');
    if (criticals && criticals._count > 0) {
        recommendations.push("Revisar incidentes críticos de segurança pendentes.");
    }

    // Certificações atrasadas ou em progresso baixo
    const lowProgress = certifications.filter(c => c.progress < 30);
    if (lowProgress.length > 0) {
        recommendations.push(`Acelerar a coleta de evidências para: ${lowProgress.map(c => c.certification.title).join(', ')}.`);
    }

    if (recommendations.length === 0) {
        recommendations.push("Manter o monitoramento contínuo e a atualização de evidências.");
    }

    return recommendations;
}
