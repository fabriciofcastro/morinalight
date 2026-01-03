import { NextRequest, NextResponse } from 'next/server';
import { runSecurityMonitor } from '@/lib/cron/security-monitor';

/**
 * GET /api/cron/security-monitor
 * Endpoint para executar o monitoramento de segurança via cron job
 * 
 * Configurar no vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/security-monitor",
 *     "schedule": "0 *\/5 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
    try {
        // Verificar token de autorização do cron
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Se CRON_SECRET estiver configurado, validar
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Executar monitoramento
        await runSecurityMonitor();

        return NextResponse.json({
            success: true,
            message: 'Security monitor executed successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Security monitor cron failed:', error);
        return NextResponse.json(
            {
                error: 'Security monitor failed',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
