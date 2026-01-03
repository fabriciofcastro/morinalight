/**
 * Monitoring Dashboard CLI
 * 
 * Script para visualizar alertas críticos de segurança do dia
 * Uso: pnpm tsx src/scripts/monitoring-dashboard-cli.ts
 */

import { getPrismaClient } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SecurityAlert {
    id: string;
    userId: string;
    alertType: string;
    severity: string;
    description: string;
    acknowledged: boolean;
    createdAt: Date;
    ipAddress: string | null;
    country: string | null;
    city: string | null;
}

async function main() {
    console.log("\n🛡️  MORINALIGHT SECURITY DASHBOARD\n");
    console.log("=".repeat(60));

    const prisma = await getPrismaClient();
    if (!prisma) {
        console.error("❌ Erro: Não foi possível conectar ao banco de dados");
        process.exit(1);
    }

    // Data de hoje (início do dia)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar alertas do dia
    const alerts = await prisma.securityAlert.findMany({
        where: {
            createdAt: {
                gte: today,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            userId: true,
            alertType: true,
            severity: true,
            description: true,
            acknowledged: true,
            createdAt: true,
            ipAddress: true,
            country: true,
            city: true,
        },
    });

    // Estatísticas
    const stats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === "critical").length,
        high: alerts.filter(a => a.severity === "high").length,
        medium: alerts.filter(a => a.severity === "medium").length,
        low: alerts.filter(a => a.severity === "low").length,
        unacknowledged: alerts.filter(a => !a.acknowledged).length,
    };

    // Exibir estatísticas
    console.log(`\n📊 ESTATÍSTICAS DO DIA (${format(today, "dd/MM/yyyy", { locale: ptBR })})\n`);
    console.log(`   Total de Alertas: ${stats.total}`);
    console.log(`   🔴 Críticos: ${stats.critical}`);
    console.log(`   🟠 Altos: ${stats.high}`);
    console.log(`   🟡 Médios: ${stats.medium}`);
    console.log(`   🟢 Baixos: ${stats.low}`);
    console.log(`   ⚠️  Não Reconhecidos: ${stats.unacknowledged}`);

    // Alertas críticos não reconhecidos
    const criticalUnacknowledged = alerts.filter(
        a => a.severity === "critical" && !a.acknowledged
    );

    if (criticalUnacknowledged.length > 0) {
        console.log(`\n🚨 ALERTAS CRÍTICOS NÃO RECONHECIDOS (${criticalUnacknowledged.length})\n`);
        console.log("=".repeat(60));

        criticalUnacknowledged.forEach((alert, index) => {
            console.log(`\n${index + 1}. ${alert.alertType.toUpperCase()}`);
            console.log(`   Descrição: ${alert.description}`);
            console.log(`   Horário: ${format(alert.createdAt, "HH:mm:ss", { locale: ptBR })}`);
            console.log(`   Usuário: ${alert.userId}`);
            if (alert.ipAddress) {
                console.log(`   IP: ${alert.ipAddress}`);
            }
            if (alert.city && alert.country) {
                console.log(`   Localização: ${alert.city}, ${alert.country}`);
            }
            console.log(`   ID: ${alert.id}`);
        });
    }

    // Tipos de alerta mais comuns
    const alertTypes = alerts.reduce((acc, alert) => {
        acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topAlertTypes = Object.entries(alertTypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    if (topAlertTypes.length > 0) {
        console.log(`\n\n📈 TOP 5 TIPOS DE ALERTA\n`);
        console.log("=".repeat(60));
        topAlertTypes.forEach(([type, count], index) => {
            console.log(`${index + 1}. ${type}: ${count} ocorrências`);
        });
    }

    // Alertas recentes (últimas 10)
    console.log(`\n\n🕐 ALERTAS RECENTES (Últimos 10)\n`);
    console.log("=".repeat(60));

    const recentAlerts = alerts.slice(0, 10);
    recentAlerts.forEach((alert, index) => {
        const severityIcon = {
            critical: "🔴",
            high: "🟠",
            medium: "🟡",
            low: "🟢",
        }[alert.severity] || "⚪";

        const ackStatus = alert.acknowledged ? "✅" : "⏳";

        console.log(
            `${index + 1}. ${severityIcon} ${alert.alertType} | ` +
            `${format(alert.createdAt, "HH:mm:ss")} | ` +
            `${ackStatus} | ` +
            `${alert.description.substring(0, 50)}...`
        );
    });

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ Dashboard carregado com sucesso!\n");

    // Recomendações
    if (stats.unacknowledged > 0) {
        console.log("⚠️  AÇÃO NECESSÁRIA:");
        console.log(`   Você tem ${stats.unacknowledged} alertas não reconhecidos.`);
        console.log("   Acesse o Security Dashboard para revisar.\n");
    }

    if (stats.critical > 0) {
        console.log("🚨 ATENÇÃO:");
        console.log(`   ${stats.critical} alertas críticos detectados hoje.`);
        console.log("   Revise imediatamente no dashboard.\n");
    }

    await prisma.$disconnect();
}

main().catch((error) => {
    console.error("❌ Erro ao executar dashboard:", error);
    process.exit(1);
});
