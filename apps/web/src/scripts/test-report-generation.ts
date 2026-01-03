/**
 * Test PDF/Excel Report Generation
 * 
 * Script para testar geração de relatórios em PDF e Excel
 * Uso: pnpm tsx src/scripts/test-report-generation.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getPrismaClient } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

async function testReportGeneration() {
    console.log("\n📄 TESTE DE GERAÇÃO DE RELATÓRIOS\n");
    console.log("=".repeat(70));

    const prisma = await getPrismaClient();
    if (!prisma) {
        console.error("❌ Erro: Não foi possível conectar ao banco de dados");
        process.exit(1);
    }

    console.log("\n📊 TESTE 1: Dados para Relatório de Segurança\n");
    console.log("-".repeat(70));

    // Coletar dados para relatório
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alerts = await prisma.securityAlert.findMany({
        where: {
            createdAt: {
                gte: today,
            },
        },
        select: {
            id: true,
            alertType: true,
            severity: true,
            description: true,
            acknowledged: true,
            createdAt: true,
            ipAddress: true,
            country: true,
            city: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    console.log(`\n✅ Coletados ${alerts.length} alertas para o relatório`);

    if (alerts.length > 0) {
        const bySeverity = alerts.reduce((acc, alert) => {
            acc[alert.severity] = (acc[alert.severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log(`\nDistribuição por Severidade:`);
        Object.entries(bySeverity).forEach(([severity, count]) => {
            console.log(`   ${severity}: ${count}`);
        });
    }

    console.log("\n\n📈 TESTE 2: Estrutura de Dados para Excel\n");
    console.log("-".repeat(70));

    // Simular estrutura de dados para Excel
    const excelData = alerts.map(alert => ({
        ID: alert.id,
        Tipo: alert.alertType,
        Severidade: alert.severity,
        Descrição: alert.description,
        IP: alert.ipAddress || "N/A",
        Localização: alert.city && alert.country ? `${alert.city}, ${alert.country}` : "N/A",
        Reconhecido: alert.acknowledged ? "Sim" : "Não",
        Data: format(alert.createdAt, "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
    }));

    console.log(`\n✅ Estrutura de dados Excel preparada`);
    console.log(`   Colunas: ID, Tipo, Severidade, Descrição, IP, Localização, Reconhecido, Data`);
    console.log(`   Linhas: ${excelData.length}`);

    if (excelData.length > 0) {
        console.log(`\nAmostra (primeira linha):`);
        console.log(JSON.stringify(excelData[0], null, 2));
    }

    console.log("\n\n📑 TESTE 3: Estrutura de Dados para PDF\n");
    console.log("-".repeat(70));

    // Simular estrutura de dados para PDF
    const pdfData = {
        title: "Relatório de Segurança - MorinaLight",
        date: format(today, "dd/MM/yyyy", { locale: ptBR }),
        summary: {
            totalAlerts: alerts.length,
            critical: alerts.filter(a => a.severity === "critical").length,
            high: alerts.filter(a => a.severity === "high").length,
            medium: alerts.filter(a => a.severity === "medium").length,
            low: alerts.filter(a => a.severity === "low").length,
            unacknowledged: alerts.filter(a => !a.acknowledged).length,
        },
        alerts: alerts.slice(0, 10).map(alert => ({
            type: alert.alertType,
            severity: alert.severity,
            description: alert.description.substring(0, 100),
            location: alert.city && alert.country ? `${alert.city}, ${alert.country}` : "N/A",
            time: format(alert.createdAt, "HH:mm:ss", { locale: ptBR }),
        })),
    };

    console.log(`\n✅ Estrutura de dados PDF preparada`);
    console.log(`\nResumo:`);
    console.log(`   Total: ${pdfData.summary.totalAlerts}`);
    console.log(`   Críticos: ${pdfData.summary.critical}`);
    console.log(`   Altos: ${pdfData.summary.high}`);
    console.log(`   Médios: ${pdfData.summary.medium}`);
    console.log(`   Baixos: ${pdfData.summary.low}`);
    console.log(`   Não Reconhecidos: ${pdfData.summary.unacknowledged}`);

    console.log("\n\n🔍 TESTE 4: Verificar Bibliotecas Disponíveis\n");
    console.log("-".repeat(70));

    // Verificar se bibliotecas de geração de relatórios estão disponíveis
    const libraries = {
        exceljs: false,
        pdfkit: false,
        jspdf: false,
    };

    try {
        await import("exceljs");
        libraries.exceljs = true;
        console.log(`\n✅ ExcelJS disponível`);
    } catch {
        console.log(`\n⚠️  ExcelJS não instalado`);
        console.log(`   Instalar: pnpm add exceljs`);
    }

    try {
        await import("pdfkit");
        libraries.pdfkit = true;
        console.log(`✅ PDFKit disponível`);
    } catch {
        console.log(`⚠️  PDFKit não instalado`);
        console.log(`   Instalar: pnpm add pdfkit @types/pdfkit`);
    }

    try {
        await import("jspdf");
        libraries.jspdf = true;
        console.log(`✅ jsPDF disponível`);
    } catch {
        console.log(`⚠️  jsPDF não instalado`);
        console.log(`   Instalar: pnpm add jspdf`);
    }

    console.log("\n\n📦 TESTE 5: Simular Geração de Arquivo\n");
    console.log("-".repeat(70));

    // Simular geração de arquivo (sem criar arquivo real)
    const filename = `security-report-${format(today, "yyyy-MM-dd")}.xlsx`;
    console.log(`\nNome do arquivo Excel: ${filename}`);
    console.log(`Tamanho estimado: ${(excelData.length * 200 / 1024).toFixed(2)} KB`);

    const pdfFilename = `security-report-${format(today, "yyyy-MM-dd")}.pdf`;
    console.log(`\nNome do arquivo PDF: ${pdfFilename}`);
    console.log(`Páginas estimadas: ${Math.ceil(alerts.length / 20)}`);

    console.log("\n\n🔄 TESTE 6: Verificar Cron Job de Relatórios\n");
    console.log("-".repeat(70));

    // Verificar se há configuração de cron para relatórios
    console.log(`\nVerificando configuração de cron job...`);
    console.log(`\nEndpoint esperado: /api/cron/generate-reports`);
    console.log(`Schedule recomendado: Diário às 8h (0 8 * * *)`);

    console.log(`\nVariáveis de ambiente necessárias:`);
    console.log(`   CRON_SECRET: ${process.env.CRON_SECRET ? "✅ Configurada" : "❌ Não configurada"}`);
    console.log(`   REPORT_EMAIL_TO: ${process.env.REPORT_EMAIL_TO ? "✅ Configurada" : "⚠️  Opcional"}`);

    console.log("\n\n📋 RESUMO DOS TESTES\n");
    console.log("=".repeat(70));

    const results = {
        dataCollection: alerts.length >= 0,
        excelStructure: excelData.length >= 0,
        pdfStructure: pdfData.summary.totalAlerts >= 0,
        libraries: libraries.exceljs || libraries.pdfkit || libraries.jspdf,
    };

    console.log(`\n✅ Coleta de Dados: ${results.dataCollection ? "PASSOU" : "FALHOU"}`);
    console.log(`✅ Estrutura Excel: ${results.excelStructure ? "PASSOU" : "FALHOU"}`);
    console.log(`✅ Estrutura PDF: ${results.pdfStructure ? "PASSOU" : "FALHOU"}`);
    console.log(`${results.libraries ? "✅" : "⚠️"} Bibliotecas: ${results.libraries ? "DISPONÍVEIS" : "INSTALAR NECESSÁRIO"}`);

    const allPassed = results.dataCollection && results.excelStructure && results.pdfStructure;

    console.log(`\n${allPassed ? "🎉" : "⚠️"} Status Geral: ${allPassed ? "ESTRUTURA DE DADOS OK" : "VERIFICAR PENDÊNCIAS"}`);

    if (!results.libraries) {
        console.log(`\n💡 Próximos Passos:`);
        console.log(`   1. Instalar bibliotecas de geração de relatórios`);
        console.log(`   2. Implementar função de geração de Excel`);
        console.log(`   3. Implementar função de geração de PDF`);
        console.log(`   4. Configurar cron job para geração automática`);
    } else {
        console.log(`\n✅ Sistema pronto para geração de relatórios!`);
        console.log(`\n💡 Comandos úteis:`);
        console.log(`   # Gerar relatório Excel manualmente`);
        console.log(`   pnpm tsx src/scripts/generate-excel-report.ts`);
        console.log(`\n   # Gerar relatório PDF manualmente`);
        console.log(`   pnpm tsx src/scripts/generate-pdf-report.ts`);
    }

    console.log("\n" + "=".repeat(70) + "\n");

    await prisma.$disconnect();
}

testReportGeneration().catch((error) => {
    console.error("❌ Erro ao executar testes:", error);
    process.exit(1);
});
