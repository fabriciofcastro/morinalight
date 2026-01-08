import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import type { PrismaService } from "../../../infra/database/prisma.service";
import { AuditPermissionAnomaliesUseCase } from "../application/use-cases/audit-permission-anomalies.use-case";
import { FixPermissionAnomaliesUseCase } from "../application/use-cases/fix-permission-anomalies.use-case";
import { PrismaPermissionAuditLogRepository } from "../infra/prisma/prisma-permission-audit-log.repository";

/**
 * Serviço de automação para auditoria de permissões
 *
 * Executa auditorias periódicas e aplica correções automáticas
 * quando configurado.
 */
@Injectable()
export class PermissionAuditScheduler {
  private readonly logger = new Logger(PermissionAuditScheduler.name);
  private readonly auditLogRepository: PrismaPermissionAuditLogRepository;

  constructor(private readonly prisma: PrismaService) {
    this.auditLogRepository = new PrismaPermissionAuditLogRepository();
  }

  /**
   * Executa auditoria diária às 2h da manhã
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyAudit() {
    this.logger.log("Iniciando auditoria diária de permissões...");

    try {
      // Buscar todas as organizações ativas
      const organizations = await this.prisma.organization.findMany({
        select: { id: true, name: true },
      });

      this.logger.log(`Auditando ${organizations.length} organizações...`);

      for (const org of organizations) {
        try {
          await this.auditOrganization(org.id, org.name);
        } catch (error) {
          this.logger.error(`Erro ao auditar organização ${org.name} (${org.id}):`, error);
        }
      }

      this.logger.log("Auditoria diária concluída com sucesso");
    } catch (error) {
      this.logger.error("Erro na auditoria diária:", error);
    }
  }

  /**
   * Executa auditoria semanal completa aos domingos às 3h
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyAudit() {
    this.logger.log("Iniciando auditoria semanal completa...");

    try {
      const organizations = await this.prisma.organization.findMany({
        select: { id: true, name: true },
      });

      for (const org of organizations) {
        try {
          const report = await this.auditOrganization(org.id, org.name);

          // Aplicar correções automáticas para anomalias de baixa severidade
          if (report && report.summary.lowSeverityIssues > 0) {
            await this.autoFixLowSeverityIssues(org.id, report);
          }
        } catch (error) {
          this.logger.error(`Erro na auditoria semanal de ${org.name}:`, error);
        }
      }

      this.logger.log("Auditoria semanal concluída");
    } catch (error) {
      this.logger.error("Erro na auditoria semanal:", error);
    }
  }

  /**
   * Audita uma organização específica
   */
  private async auditOrganization(orgId: string, orgName: string) {
    this.logger.log(`Auditando organização: ${orgName}`);

    const useCase = new AuditPermissionAnomaliesUseCase({
      prisma: this.prisma,
    });

    const report = await useCase.execute({
      orgId,
      actorId: "system-scheduler",
      filters: {},
    });

    this.logger.log(
      `Auditoria de ${orgName} concluída: ${report.summary.anomaliesFound} anomalias encontradas (Score: ${report.summary.conformityScore}%)`,
    );

    // Alertar se houver problemas críticos
    if (report.summary.criticalIssues > 0) {
      this.logger.warn(
        `⚠️  CRÍTICO: ${report.summary.criticalIssues} problemas críticos em ${orgName}`,
      );
      // TODO: Enviar notificação por email/Slack
    }

    return report;
  }

  /**
   * Aplica correções automáticas para problemas de baixa severidade
   */
  private async autoFixLowSeverityIssues(orgId: string, report: any) {
    this.logger.log(`Aplicando correções automáticas para ${orgId}...`);

    const fixUseCase = new FixPermissionAnomaliesUseCase({
      prisma: this.prisma,
      auditLogRepository: this.auditLogRepository,
    });

    // Filtrar apenas anomalias de baixa severidade
    const lowSeverityExcessive = report.excessivePermissions.filter(
      (e: any) => e.severity === "low",
    );

    const result = await fixUseCase.execute({
      orgId,
      actorId: "system-auto-fix",
      options: {
        removeOrphaned: true,
        resolveConflicts: false, // Não resolver conflitos automaticamente
        removeExcessive: true,
        backfillAudit: true,
        dryRun: false,
      },
      anomalies: {
        orphaned: report.orphanedPermissions,
        conflicts: [],
        excessive: lowSeverityExcessive,
        gaps: report.auditGaps,
      },
    });

    this.logger.log(`Correções aplicadas: ${result.itemsFixed} itens corrigidos`);

    if (result.errors.length > 0) {
      this.logger.error(`Erros durante correção automática: ${result.errors.join(", ")}`);
    }

    return result;
  }

  /**
   * Método manual para executar auditoria de uma organização
   */
  async runManualAudit(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    });

    if (!org) {
      throw new Error(`Organização ${orgId} não encontrada`);
    }

    return this.auditOrganization(orgId, org.name);
  }
}
