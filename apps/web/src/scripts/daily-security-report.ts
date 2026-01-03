/**
 * Daily Security Report Generator
 * 
 * Gera relatório diário automatizado de segurança
 * Uso: pnpm tsx src/scripts/daily-security-report.ts --email security@morinalight.com
 */

import { getPrismaClient } from "@/lib/prisma";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportOptions {
    email?: string;
    format?: "console" | "json" | "markdown";
}

async function generateDailyReport(options: ReportOptions = {}) {
    const prisma = await getPrismaClient();
    if (!prisma) {
        throw new Error("Não foi possível conectar ao banco de dados");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = subDays(today, 1);

    // 1. Alertas de Segurança
    const alerts = await prisma.securityAlert.findMany({
        where: {
            createdAt: {
                gte: today,
            },
        },
        select: {
            severity: true,
            alertType: true,
            acknowledged: true,
        },
    });

    const alertStats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === "critical").length,
        high: alerts.filter(a => a.severity === "high").length,
        medium: alerts.filter(a => a.severity === "medium").length,
        low: alerts.filter(a => a.severity === "low").length,
        unacknowledged: alerts.filter(a => !a.acknowledged).length,
    };

    // 2. Novos Dispositivos Confiáveis
    const newDevices = await prisma.trustedDevice.count({
        where: {
            createdAt: {
                gte: today,
            },
        },
    });

    // 3. Tentativas de Acesso Bloqueadas
    const blockedAttempts = alerts.filter(
        a => a.alertType === "login_failed" || a.alertType === "impossible_travel"
    ).length;

    // 4. Usuários com MFA Ativo
    const mfaStats = await prisma.user.groupBy({
        by: ["twoFactorEnabled"],
        _count: true,
    });

    const mfaEnabled = mfaStats.find(s => s.twoFactorEnabled)?._count || 0;
    const mfaDisabled = mfaStats.find(s => !s.twoFactorEnabled)?._count || 0;
    const mfaPercentage = mfaEnabled + mfaDisabled > 0
        ? ((mfaEnabled / (mfaEnabled + mfaDisabled)) * 100).toFixed(1)
        : "0.0";

    // 5. Comparação com dia anterior
    const yesterdayAlerts = await prisma.securityAlert.count({
        where: {
            createdAt: {
                gte: yesterday,
                lt: today,
            },
        },
    });

    const trend = yesterdayAlerts > 0
        ? (((alerts.length - yesterdayAlerts) / yesterdayAlerts) * 100).toFixed(1)
        : "N/A";

    // Gerar relatório
    const report = {
        date: format(today, "dd/MM/yyyy", { locale: ptBR }),
        alerts: alertStats,
        newDevices,
        blockedAttempts,
        mfa: {
            enabled: mfaEnabled,
            disabled: mfaDisabled,
            percentage: mfaPercentage,
        },
        trend: {
            yesterday: yesterdayAlerts,
            today: alerts.length,
            change: trend,
        },
    };

    // Formatar saída
    if (options.format === "json") {
        console.log(JSON.stringify(report, null, 2));
    } else if (options.format === "markdown") {
        printMarkdownReport(report);
    } else {
        printConsoleReport(report);
    }

    // Enviar email se solicitado
    if (options.email) {
        console.log(`\n📧 Email seria enviado para: ${options.email}`);
        console.log("   (Integração de email pendente - Fase 2)");
    }

    await prisma.$disconnect();
    return report;
}

function printConsoleReport(report: any) {
    console.log("\n" + "=".repeat(70));
    console.log("🛡️  RELATÓRIO DIÁRIO DE SEGURANÇA - MORINALIGHT");
    console.log("=".repeat(70));
    console.log(`\n📅 Data: ${report.date}\n`);

    console.log("📊 ALERTAS DE SEGURANÇA");
    console.log("-".repeat(70));
    console.log(`   Total: ${report.alerts.total}`);
    console.log(`   🔴 Críticos: ${report.alerts.critical}`);
    console.log(`   🟠 Altos: ${report.alerts.high}`);
    console.log(`   🟡 Médios: ${report.alerts.medium}`);
    console.log(`   🟢 Baixos: ${report.alerts.low}`);
    console.log(`   ⚠️  Não Reconhecidos: ${report.alerts.unacknowledged}`);

    console.log(`\n📱 DISPOSITIVOS CONFIÁVEIS`);
    console.log("-".repeat(70));
    console.log(`   Novos Dispositivos Hoje: ${report.newDevices}`);

    console.log(`\n🚫 ACESSOS BLOQUEADOS`);
    console.log("-".repeat(70));
    console.log(`   Tentativas Bloqueadas: ${report.blockedAttempts}`);

    console.log(`\n🔐 AUTENTICAÇÃO MULTIFATOR (MFA)`);
    console.log("-".repeat(70));
    console.log(`   Usuários com MFA: ${report.mfa.enabled}`);
    console.log(`   Usuários sem MFA: ${report.mfa.disabled}`);
    console.log(`   Cobertura: ${report.mfa.percentage}%`);

    console.log(`\n📈 TENDÊNCIA`);
    console.log("-".repeat(70));
    console.log(`   Alertas Ontem: ${report.trend.yesterday}`);
    console.log(`   Alertas Hoje: ${report.trend.today}`);
    console.log(`   Variação: ${report.trend.change}%`);

    console.log("\n" + "=".repeat(70));

    // Recomendações
    console.log("\n💡 RECOMENDAÇÕES\n");

    if (report.alerts.critical > 0) {
        console.log(`   ⚠️  ${report.alerts.critical} alertas críticos requerem atenção imediata`);
    }

    if (report.alerts.unacknowledged > 5) {
        console.log(`   ⚠️  ${report.alerts.unacknowledged} alertas não reconhecidos - revisar dashboard`);
    }

    if (parseFloat(report.mfa.percentage) < 80) {
        console.log(`   ⚠️  Cobertura de MFA abaixo de 80% - incentivar adoção`);
    }

    if (report.blockedAttempts > 10) {
        console.log(`   ⚠️  Alto número de tentativas bloqueadas - possível ataque em andamento`);
    }

    console.log("\n");
}

function printMarkdownReport(report: any) {
    console.log(`# Relatório Diário de Segurança - MorinaLight\n`);
    console.log(`**Data:** ${report.date}\n`);

    console.log(`## 📊 Alertas de Segurança\n`);
    console.log(`| Severidade | Quantidade |`);
    console.log(`|------------|------------|`);
    console.log(`| Total | ${report.alerts.total} |`);
    console.log(`| 🔴 Críticos | ${report.alerts.critical} |`);
    console.log(`| 🟠 Altos | ${report.alerts.high} |`);
    console.log(`| 🟡 Médios | ${report.alerts.medium} |`);
    console.log(`| 🟢 Baixos | ${report.alerts.low} |`);
    console.log(`| ⚠️ Não Reconhecidos | ${report.alerts.unacknowledged} |\n`);

    console.log(`## 📱 Dispositivos Confiáveis\n`);
    console.log(`- Novos dispositivos hoje: **${report.newDevices}**\n`);

    console.log(`## 🚫 Acessos Bloqueados\n`);
    console.log(`- Tentativas bloqueadas: **${report.blockedAttempts}**\n`);

    console.log(`## 🔐 MFA\n`);
    console.log(`- Usuários com MFA: **${report.mfa.enabled}**`);
    console.log(`- Usuários sem MFA: **${report.mfa.disabled}**`);
    console.log(`- Cobertura: **${report.mfa.percentage}%**\n`);

    console.log(`## 📈 Tendência\n`);
    console.log(`- Alertas ontem: ${report.trend.yesterday}`);
    console.log(`- Alertas hoje: ${report.trend.today}`);
    console.log(`- Variação: ${report.trend.change}%\n`);
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options: ReportOptions = {};

for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email" && args[i + 1]) {
        options.email = args[i + 1];
        i++;
    } else if (args[i] === "--format" && args[i + 1]) {
        options.format = args[i + 1] as "console" | "json" | "markdown";
        i++;
    }
}

// Execute
generateDailyReport(options).catch((error) => {
    console.error("❌ Erro ao gerar relatório:", error);
    process.exit(1);
});
