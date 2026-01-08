#!/usr/bin/env node

/**
 * Script CLI para executar auditoria de permissões
 *
 * Uso:
 *   node audit-permissions.js --org-id <uuid> [opções]
 *
 * Opções:
 *   --org-id <uuid>        ID da organização (obrigatório)
 *   --user-id <uuid>       ID do usuário executor (opcional, usa 'system')
 *   --fix                  Aplicar correções automáticas
 *   --dry-run              Simular correções sem aplicar (padrão: true)
 *   --remove-orphaned      Remover permissões órfãs
 *   --resolve-conflicts    Resolver conflitos de permissões
 *   --remove-excessive     Remover permissões excessivas
 *   --backfill-audit       Preencher gaps de auditoria
 *   --output <file>        Salvar relatório em arquivo JSON
 *   --help                 Mostrar ajuda
 */

import { writeFileSync } from "fs";
import { AuditPermissionAnomaliesUseCase } from "../modules/permissions/application/use-cases/audit-permission-anomalies.use-case";
import { FixPermissionAnomaliesUseCase } from "../modules/permissions/application/use-cases/fix-permission-anomalies.use-case";
import { PrismaPermissionAuditLogRepository } from "../modules/permissions/infra/prisma/prisma-permission-audit-log.repository";

// Parse argumentos
const args = process.argv.slice(2);
const options = {
  orgId: "",
  userId: "system",
  fix: false,
  dryRun: true,
  removeOrphaned: false,
  resolveConflicts: false,
  removeExcessive: false,
  backfillAudit: false,
  output: "",
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--org-id":
      options.orgId = args[++i];
      break;
    case "--user-id":
      options.userId = args[++i];
      break;
    case "--fix":
      options.fix = true;
      break;
    case "--dry-run":
      options.dryRun = args[++i] !== "false";
      break;
    case "--remove-orphaned":
      options.removeOrphaned = true;
      break;
    case "--resolve-conflicts":
      options.resolveConflicts = true;
      break;
    case "--remove-excessive":
      options.removeExcessive = true;
      break;
    case "--backfill-audit":
      options.backfillAudit = true;
      break;
    case "--output":
      options.output = args[++i];
      break;
    case "--help":
      console.log(`
Auditoria de Permissões - Script CLI

Uso:
  node audit-permissions.js --org-id <uuid> [opções]

Opções:
  --org-id <uuid>        ID da organização (obrigatório)
  --user-id <uuid>       ID do usuário executor (opcional, usa 'system')
  --fix                  Aplicar correções automáticas
  --dry-run <bool>       Simular correções sem aplicar (padrão: true)
  --remove-orphaned      Remover permissões órfãs
  --resolve-conflicts    Resolver conflitos de permissões
  --remove-excessive     Remover permissões excessivas
  --backfill-audit       Preencher gaps de auditoria
  --output <file>        Salvar relatório em arquivo JSON
  --help                 Mostrar ajuda

Exemplos:
  # Executar auditoria completa
  node audit-permissions.js --org-id abc-123

  # Executar auditoria e simular correções
  node audit-permissions.js --org-id abc-123 --fix --remove-orphaned --dry-run true

  # Aplicar correções reais
  node audit-permissions.js --org-id abc-123 --fix --remove-orphaned --dry-run false

  # Salvar relatório em arquivo
  node audit-permissions.js --org-id abc-123 --output report.json
      `);
      process.exit(0);
  }
}

// Validar argumentos obrigatórios
if (!options.orgId) {
  console.error("❌ Erro: --org-id é obrigatório");
  console.error("Use --help para ver as opções disponíveis");
  process.exit(1);
}

// Executar auditoria
async function main() {
  const prisma = new PrismaClient();
  const auditLogRepository = new PrismaPermissionAuditLogRepository();

  try {
    console.log("🔍 Executando auditoria de permissões...\n");
    console.log(`Organização: ${options.orgId}`);
    console.log(`Executor: ${options.userId}\n`);

    // Executar auditoria
    const auditUseCase = new AuditPermissionAnomaliesUseCase({ prisma });
    const report = await auditUseCase.execute({
      orgId: options.orgId,
      actorId: options.userId,
      filters: {},
    });

    // Exibir resumo
    console.log("📊 RESUMO DA AUDITORIA");
    console.log("═".repeat(50));
    console.log(`Score de Conformidade: ${report.summary.conformityScore}%`);
    console.log(`Total de Anomalias: ${report.summary.anomaliesFound}`);
    console.log(`  • Críticas: ${report.summary.criticalIssues}`);
    console.log(`  • Alta Severidade: ${report.summary.highSeverityIssues}`);
    console.log(`  • Média Severidade: ${report.summary.mediumSeverityIssues}`);
    console.log(`  • Baixa Severidade: ${report.summary.lowSeverityIssues}`);
    console.log("");

    // Exibir detalhes por categoria
    console.log("📋 ANOMALIAS POR CATEGORIA");
    console.log("═".repeat(50));
    console.log(`Permissões Órfãs: ${report.orphanedPermissions.length}`);
    console.log(`Conflitos: ${report.conflicts.length}`);
    console.log(`Permissões Excessivas: ${report.excessivePermissions.length}`);
    console.log(`Inconsistências Hierárquicas: ${report.hierarchyIssues.length}`);
    console.log(`Gaps de Auditoria: ${report.auditGaps.length}`);
    console.log(`Permissões Obsoletas: ${report.obsoletePermissions.length}`);
    console.log(`Violações de SoD: ${report.sodViolations.length}`);
    console.log("");

    // Exibir recomendações
    if (report.recommendations.length > 0) {
      console.log("💡 RECOMENDAÇÕES");
      console.log("═".repeat(50));
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
      console.log("");
    }

    // Aplicar correções se solicitado
    if (options.fix) {
      console.log("🔧 APLICANDO CORREÇÕES");
      console.log("═".repeat(50));
      console.log(`Modo: ${options.dryRun ? "DRY-RUN (simulação)" : "REAL"}`);
      console.log("");

      const fixUseCase = new FixPermissionAnomaliesUseCase({
        prisma,
        auditLogRepository,
      });

      const fixResult = await fixUseCase.execute({
        orgId: options.orgId,
        actorId: options.userId,
        options: {
          removeOrphaned: options.removeOrphaned,
          resolveConflicts: options.resolveConflicts,
          removeExcessive: options.removeExcessive,
          backfillAudit: options.backfillAudit,
          dryRun: options.dryRun,
        },
        anomalies: {
          orphaned: report.orphanedPermissions,
          conflicts: report.conflicts,
          excessive: report.excessivePermissions,
          gaps: report.auditGaps,
        },
      });

      console.log(`✅ Itens corrigidos: ${fixResult.itemsFixed}`);

      if (fixResult.errors.length > 0) {
        console.log(`\n❌ Erros (${fixResult.errors.length}):`);
        fixResult.errors.forEach((err, i) => {
          console.log(`  ${i + 1}. ${err}`);
        });
      }

      if (fixResult.warnings.length > 0) {
        console.log(`\n⚠️  Avisos (${fixResult.warnings.length}):`);
        fixResult.warnings.forEach((warn, i) => {
          console.log(`  ${i + 1}. ${warn}`);
        });
      }

      console.log("");
    }

    // Salvar relatório em arquivo se solicitado
    if (options.output) {
      const reportData = {
        ...report,
        timestamp: report.timestamp.toISOString(),
      };
      writeFileSync(options.output, JSON.stringify(reportData, null, 2));
      console.log(`💾 Relatório salvo em: ${options.output}\n`);
    }

    // Status final
    let statusEmoji = "✅";
    let statusText = "EXCELENTE";

    if (report.summary.conformityScore < 95) {
      statusEmoji = "👍";
      statusText = "BOM";
    }
    if (report.summary.conformityScore < 80) {
      statusEmoji = "⚠️";
      statusText = "ATENÇÃO";
    }
    if (report.summary.conformityScore < 60) {
      statusEmoji = "🚨";
      statusText = "CRÍTICO";
    }

    console.log("═".repeat(50));
    console.log(`${statusEmoji} Status: ${statusText}`);
    console.log("═".repeat(50));

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar auditoria:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
