/**
 * Compliance Reports API
 * 
 * Generate SOC 2 and ISO 27001 compliance reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { soc2ReportGenerator, iso27001ReportGenerator } from '@/lib/compliance/report-generator';
import { requirePermission } from '@/lib/auth/middleware';
import { ACTIONS, RESOURCES } from '@/lib/auth/rbac';

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticação e permissões (precisa ser ADMIN ou superior para relatórios)
        const authResult = await requirePermission(ACTIONS.READ, RESOURCES.REPORTS)(request, { params: {} });
        if (authResult) return authResult;

        const { searchParams } = new URL(request.url);
        const framework = searchParams.get('framework') || 'soc2';
        const startDate = searchParams.get('startDate')
            ? new Date(searchParams.get('startDate')!)
            : new Date(new Date().getFullYear(), 0, 1); // Start of current year
        const endDate = searchParams.get('endDate')
            ? new Date(searchParams.get('endDate')!)
            : new Date(); // Today

        let report;

        if (framework === 'soc2') {
            report = await soc2ReportGenerator.generate(startDate, endDate);
        } else if (framework === 'iso27001') {
            report = await iso27001ReportGenerator.generate(startDate, endDate);
        } else {
            return NextResponse.json(
                { error: 'Invalid framework. Use "soc2" or "iso27001"' },
                { status: 400 }
            );
        }

        return NextResponse.json(report);
    } catch (error) {
        console.error('Failed to generate compliance report:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}

/**
 * USAGE:
 * 
 * GET /api/compliance/reports?framework=soc2
 * GET /api/compliance/reports?framework=iso27001
 * GET /api/compliance/reports?framework=soc2&startDate=2024-01-01&endDate=2024-12-31
 * 
 * Response:
 * {
 *   "framework": "SOC 2 Type II",
 *   "generatedAt": "2024-01-03T12:00:00.000Z",
 *   "period": {
 *     "start": "2024-01-01T00:00:00.000Z",
 *     "end": "2024-12-31T23:59:59.999Z"
 *   },
 *   "overallScore": 95.5,
 *   "controls": [...],
 *   "summary": {
 *     "total": 7,
 *     "implemented": 7,
 *     "partial": 0,
 *     "notImplemented": 0
 *   },
 *   "recommendations": []
 * }
 */
