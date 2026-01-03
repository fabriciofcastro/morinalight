/**
 * Security Monitor Cron Job
 * 
 * Executa análises de segurança periódicas e limpeza de bloqueios expirados
 * Recomendado: Executar a cada 5 minutos
 */

import { intrusionDetector } from '@/lib/security/intrusion-detection';
import { getPrismaClient } from '@/lib/prisma';

/**
 * Executa análise de segurança para todos os usuários ativos
 */
export async function runSecurityAnalysis(): Promise<void> {
    try {
        const prisma = await getPrismaClient();
        if (!prisma) {
            console.warn('[Security Monitor] Prisma client unavailable, skipping analysis');
            return;
        }

        const ids = intrusionDetector;

        // Buscar usuários ativos (que fizeram login nas últimas 24 horas)
        const activeUsers = await prisma.user.findMany({
            where: {
                lastLoginAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
                },
            },
            select: {
                id: true,
                email: true,
            },
        });

        console.log(`[Security Monitor] Analyzing ${activeUsers.length} active users`);

        // Analisar cada usuário
        for (const user of activeUsers) {
            try {
                await ids.analyzeUserSecurity(user.id);
            } catch (error) {
                console.error(`[Security Monitor] Failed to analyze user ${user.id}:`, error);
            }
        }

        console.log('[Security Monitor] Analysis complete');
    } catch (error) {
        console.error('[Security Monitor] Failed to run security analysis:', error);
    }
}

/**
 * Limpa bloqueios de usuários que já expiraram
 */
export async function cleanupExpiredBlocks(): Promise<void> {
    try {
        const prisma = await getPrismaClient();
        if (!prisma) {
            console.warn('[Security Monitor] Prisma client unavailable, skipping cleanup');
            return;
        }

        const now = new Date();

        // Encontrar usuários com bloqueio expirado
        const result = await prisma.user.updateMany({
            where: {
                blockedUntil: {
                    lte: now,
                },
            },
            data: {
                blockedUntil: null,
            },
        });

        if (result.count > 0) {
            console.log(`[Security Monitor] Unblocked ${result.count} users with expired blocks`);
        }
    } catch (error) {
        console.error('[Security Monitor] Failed to cleanup expired blocks:', error);
    }
}

/**
 * Limpa alertas de segurança antigos (mais de 90 dias)
 */
export async function cleanupOldAlerts(): Promise<void> {
    try {
        const prisma = await getPrismaClient();
        if (!prisma) {
            console.warn('[Security Monitor] Prisma client unavailable, skipping cleanup');
            return;
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 dias atrás

        const result = await prisma.securityAlert.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
                acknowledged: true, // Apenas deletar alertas já reconhecidos
            },
        });

        if (result.count > 0) {
            console.log(`[Security Monitor] Deleted ${result.count} old security alerts`);
        }
    } catch (error) {
        console.error('[Security Monitor] Failed to cleanup old alerts:', error);
    }
}

/**
 * Gera relatório de estatísticas de segurança
 */
export async function generateSecurityStats(): Promise<void> {
    try {
        const prisma = await getPrismaClient();
        if (!prisma) {
            console.warn('[Security Monitor] Prisma client unavailable, skipping stats');
            return;
        }

        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Contar alertas nas últimas 24 horas
        const recentAlerts = await prisma.securityAlert.count({
            where: {
                createdAt: {
                    gte: last24Hours,
                },
            },
        });

        // Contar alertas críticos não reconhecidos
        const criticalAlerts = await prisma.securityAlert.count({
            where: {
                severity: 'critical',
                acknowledged: false,
            },
        });

        // Contar usuários bloqueados
        const blockedUsers = await prisma.user.count({
            where: {
                blockedUntil: {
                    gt: now,
                },
            },
        });

        console.log('[Security Monitor] Stats:', {
            recentAlerts24h: recentAlerts,
            criticalUnacknowledged: criticalAlerts,
            currentlyBlocked: blockedUsers,
        });

        // Se houver alertas críticos, enviar notificação detalhada
        if (criticalAlerts > 0) {
            console.warn('\n========================================');
            console.warn('🚨 CRITICAL SECURITY ALERTS DETECTED 🚨');
            console.warn('========================================');
            console.warn(`Total Critical Unacknowledged: ${criticalAlerts}`);
            console.warn('----------------------------------------');

            // Buscar detalhes dos alertas críticos
            const criticalAlertDetails = await prisma.securityAlert.findMany({
                where: {
                    severity: 'critical',
                    acknowledged: false,
                },
                take: 10, // Limitar a 10 alertas mais recentes
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            displayName: true,
                        },
                    },
                },
            });

            criticalAlertDetails.forEach((alert, index) => {
                console.warn(`\n[${index + 1}] ${alert.alertType.toUpperCase()}`);
                console.warn(`    User: ${alert.user.displayName || alert.user.email}`);
                console.warn(`    Description: ${alert.description}`);
                console.warn(`    Created: ${alert.createdAt.toISOString()}`);
                if (alert.metadata) {
                    console.warn(`    Metadata: ${JSON.stringify(alert.metadata)}`);
                }
            });

            console.warn('\n========================================');
            console.warn('⚠️  IMMEDIATE ADMIN ACTION REQUIRED  ⚠️');
            console.warn('========================================\n');

            // TODO: Integrar com serviço de email/SMS quando disponível
            // await notificationService.send('email', {
            //     to: process.env.SECURITY_ADMIN_EMAIL,
            //     subject: `CRITICAL: ${criticalAlerts} Security Alerts`,
            //     body: formatAlertsEmail(criticalAlertDetails)
            // });
        }
    } catch (error) {
        console.error('[Security Monitor] Failed to generate stats:', error);
    }
}

/**
 * Executa todas as tarefas de monitoramento
 */
export async function runSecurityMonitor(): Promise<void> {
    console.log('[Security Monitor] Starting security monitor run...');

    const startTime = Date.now();

    // Executar todas as tarefas em paralelo
    const { auditEngine } = await import('@/lib/security/audit-engine');

    await Promise.all([
        runSecurityAnalysis(),
        cleanupExpiredBlocks(),
        cleanupOldAlerts(),
        generateSecurityStats(),
        auditEngine.executeGlobalAudit(),
    ]);

    const duration = Date.now() - startTime;
    console.log(`[Security Monitor] Completed in ${duration}ms`);
}

/**
 * EXEMPLO DE USO COM CRON:
 * 
 * // Usando node-cron
 * import cron from 'node-cron';
 * import { runSecurityMonitor } from './lib/cron/security-monitor';
 * 
 * // Executar a cada 5 minutos
 * cron.schedule('*\/5 * * * *', async () => {
 *   await runSecurityMonitor();
 * });
 * 
 * // OU usando Vercel Cron Jobs (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/security-monitor",
 *     "schedule": "*\/5 * * * *"
 *   }]
 * }
 * 
 * // Criar rota API: app/api/cron/security-monitor/route.ts
 * import { NextResponse } from 'next/server';
 * import { runSecurityMonitor } from '@/lib/cron/security-monitor';
 * 
 * export async function GET(request: Request) {
 *   // Verificar token de autorização do cron
 *   const authHeader = request.headers.get('authorization');
 *   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   
 *   await runSecurityMonitor();
 *   return NextResponse.json({ success: true });
 * }
 */
