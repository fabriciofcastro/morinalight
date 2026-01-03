/**
 * Verify Cron Execution
 * 
 * Valida execução do security monitor cron job
 * Uso: pnpm tsx src/scripts/verify-cron-execution.ts
 */

import { getRedisClient } from "@/lib/redis/client";
import { getPrismaClient } from "@/lib/prisma";
import { format, subMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

const CRON_HEALTH_KEY = "cron:security-monitor:last-run";
const EXPECTED_INTERVAL_MINUTES = 5;
const WARNING_THRESHOLD_MINUTES = 7; // 5min + 2min buffer
const CRITICAL_THRESHOLD_MINUTES = 15;

async function verifyCronExecution() {
    console.log("\n🔍 VERIFICAÇÃO DE CRON JOB - Security Monitor\n");
    console.log("=".repeat(60));

    const redis = getRedisClient();
    const prisma = await getPrismaClient();

    let lastRunTimestamp: string | null = null;
    let lastRunDate: Date | null = null;

    // 1. Verificar timestamp no Redis
    if (redis) {
        try {
            lastRunTimestamp = await redis.get(CRON_HEALTH_KEY);
            if (lastRunTimestamp) {
                lastRunDate = new Date(lastRunTimestamp);
                console.log(`\n✅ Última execução registrada no Redis:`);
                console.log(`   ${format(lastRunDate, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}`);
            } else {
                console.log(`\n⚠️  Nenhuma execução registrada no Redis`);
                console.log(`   Chave: ${CRON_HEALTH_KEY}`);
            }
        } catch (error) {
            console.log(`\n⚠️  Erro ao acessar Redis:`, error);
        }
    } else {
        console.log(`\n⚠️  Redis não configurado - usando fallback`);
    }

    // 2. Verificar alertas recentes no banco (fallback)
    if (prisma) {
        const recentAlerts = await prisma.securityAlert.findFirst({
            where: {
                alertType: "cron_execution",
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                createdAt: true,
                description: true,
            },
        });

        if (recentAlerts) {
            console.log(`\n✅ Última execução via banco de dados:`);
            console.log(`   ${format(recentAlerts.createdAt, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}`);
            console.log(`   Descrição: ${recentAlerts.description}`);

            if (!lastRunDate) {
                lastRunDate = recentAlerts.createdAt;
            }
        }
    }

    // 3. Calcular tempo desde última execução
    if (lastRunDate) {
        const now = new Date();
        const minutesSinceLastRun = Math.floor(
            (now.getTime() - lastRunDate.getTime()) / (1000 * 60)
        );

        console.log(`\n⏱️  Tempo desde última execução: ${minutesSinceLastRun} minutos`);
        console.log(`   Intervalo esperado: ${EXPECTED_INTERVAL_MINUTES} minutos`);

        // Status
        if (minutesSinceLastRun <= EXPECTED_INTERVAL_MINUTES) {
            console.log(`\n✅ STATUS: SAUDÁVEL`);
            console.log(`   Cron está executando conforme esperado`);
        } else if (minutesSinceLastRun <= WARNING_THRESHOLD_MINUTES) {
            console.log(`\n⚠️  STATUS: ATENÇÃO`);
            console.log(`   Cron atrasado em ${minutesSinceLastRun - EXPECTED_INTERVAL_MINUTES} minutos`);
            console.log(`   Ainda dentro do limite aceitável`);
        } else if (minutesSinceLastRun <= CRITICAL_THRESHOLD_MINUTES) {
            console.log(`\n🟠 STATUS: ALERTA`);
            console.log(`   Cron atrasado em ${minutesSinceLastRun - EXPECTED_INTERVAL_MINUTES} minutos`);
            console.log(`   Verificar logs do Vercel`);
        } else {
            console.log(`\n🔴 STATUS: CRÍTICO`);
            console.log(`   Cron NÃO executou nos últimos ${minutesSinceLastRun} minutos`);
            console.log(`   AÇÃO NECESSÁRIA: Verificar configuração Vercel`);
        }

        // Próxima execução esperada
        const nextExpectedRun = new Date(lastRunDate.getTime() + EXPECTED_INTERVAL_MINUTES * 60 * 1000);
        console.log(`\n📅 Próxima execução esperada:`);
        console.log(`   ${format(nextExpectedRun, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}`);

    } else {
        console.log(`\n🔴 STATUS: CRÍTICO`);
        console.log(`   Nenhuma execução detectada`);
        console.log(`   Verificar se o cron está configurado no Vercel`);
    }

    // 4. Verificar configuração do Vercel
    console.log(`\n\n📋 CHECKLIST DE CONFIGURAÇÃO\n`);
    console.log("=".repeat(60));

    console.log(`\n1. Arquivo vercel.json:`);
    console.log(`   [ ] Cron configurado com schedule "0 */5 * * * *"`);
    console.log(`   [ ] Path correto: /api/cron/security-monitor`);

    console.log(`\n2. Variáveis de Ambiente (Vercel Dashboard):`);
    console.log(`   [ ] CRON_SECRET configurada`);
    console.log(`   [ ] DATABASE_URL configurada`);
    console.log(`   [ ] IDS_ENABLED=true`);

    console.log(`\n3. Logs do Vercel:`);
    console.log(`   Comando: vercel logs --follow --filter=/api/cron/security-monitor`);
    console.log(`   [ ] Verificar execuções recentes`);
    console.log(`   [ ] Verificar erros`);

    // 5. Comandos úteis
    console.log(`\n\n🛠️  COMANDOS ÚTEIS\n`);
    console.log("=".repeat(60));
    console.log(`\n# Ver logs em tempo real`);
    console.log(`vercel logs --follow --filter=/api/cron/security-monitor\n`);
    console.log(`# Ver últimas 100 linhas`);
    console.log(`vercel logs --limit=100 --filter=/api/cron/security-monitor\n`);
    console.log(`# Testar endpoint manualmente (com CRON_SECRET)`);
    console.log(`curl -X POST https://your-domain.vercel.app/api/cron/security-monitor \\`);
    console.log(`  -H "Authorization: Bearer \${CRON_SECRET}"\n`);

    console.log("\n" + "=".repeat(60) + "\n");

    // Cleanup
    if (prisma) {
        await prisma.$disconnect();
    }
}

verifyCronExecution().catch((error) => {
    console.error("❌ Erro ao verificar cron:", error);
    process.exit(1);
});
