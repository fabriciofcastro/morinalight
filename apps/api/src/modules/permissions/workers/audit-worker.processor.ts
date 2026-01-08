import type { Job } from "bull";

import type { AuditPermissionAnomaliesUseCase } from "../use-cases/audit-permission-anomalies.use-case";
import type { FixPermissionAnomaliesUseCase } from "../use-cases/fix-permission-anomalies.use-case";
import type { AuditAlertService } from "./audit-alert.service";
import type { AuditCacheService } from "./audit-cache.service";
import type { AuditJob, AuditJobResult, BatchAuditJob } from "./audit-queue.service";

/**
 * Processador de jobs de auditoria
 * Executa auditorias em background com processamento paralelo
 */
@Processor("audit")
@Injectable()
export class AuditWorkerProcessor {
  constructor(
    private readonly auditUseCase: AuditPermissionAnomaliesUseCase,
    private readonly fixUseCase: FixPermissionAnomaliesUseCase,
    private readonly cacheService: AuditCacheService,
    private readonly alertService: AuditAlertService,
  ) {}

  /**
   * Processa auditoria individual
   */
  @Process("run-audit")
  async processAudit(job: Job<AuditJob>): Promise<AuditJobResult> {
    const startTime = Date.now();
    const { orgId, userId, options } = job.data;

    try {
      // Atualizar progresso
      await job.progress(10);

      // Executar auditoria
      const report = await this.auditUseCase.execute({ orgId });
      await job.progress(60);

      // Aplicar correções se solicitado
      if (options?.fix) {
        const fixResult = await this.fixUseCase.execute({
          orgId,
          dryRun: options.dryRun ?? true,
        });
        await job.progress(90);

        // Adicionar resultado de correções ao report
        (report as any).fixResult = fixResult;
      }

      // Armazenar em cache
      await this.cacheService.cacheAuditReport(orgId, report);
      await job.progress(95);

      // Enviar alertas se configurado
      if (options?.notifyOnComplete) {
        await this.alertService.sendAuditCompletedAlert(orgId, report);
      }

      await job.progress(100);

      const duration = Date.now() - startTime;

      return {
        orgId,
        report,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Log error
      console.error(`Audit job failed for org ${orgId}:`, error);

      return {
        orgId,
        error: error.message,
        duration,
      };
    }
  }

  /**
   * Processa batch de auditorias
   */
  @Process("batch-audit")
  async processBatchAudit(job: Job<BatchAuditJob>): Promise<AuditJobResult[]> {
    const { orgIds, options } = job.data;
    const parallel = options?.parallel || 5; // Processar 5 por vez por padrão
    const results: AuditJobResult[] = [];

    const total = orgIds.length;
    let completed = 0;
    let failed = 0;

    // Processar em chunks paralelos
    for (let i = 0; i < orgIds.length; i += parallel) {
      const chunk = orgIds.slice(i, i + parallel);

      const chunkResults = await Promise.allSettled(
        chunk.map(async (orgId) => {
          const startTime = Date.now();

          try {
            const report = await this.auditUseCase.execute({ orgId });
            await this.cacheService.cacheAuditReport(orgId, report);

            completed++;
            return {
              orgId,
              report,
              duration: Date.now() - startTime,
            };
          } catch (error: any) {
            failed++;
            return {
              orgId,
              error: error.message,
              duration: Date.now() - startTime,
            };
          }
        }),
      );

      // Adicionar resultados
      for (const result of chunkResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        }
      }

      // Atualizar progresso
      const percentage = Math.floor(((completed + failed) / total) * 100);
      await job.progress({
        total,
        completed,
        failed,
        pending: total - completed - failed,
        percentage,
      });
    }

    // Enviar notificação de conclusão se configurado
    if (options?.notifyOnComplete) {
      await this.alertService.sendBatchAuditCompletedAlert({
        total,
        completed,
        failed,
      });
    }

    return results;
  }

  /**
   * Handler para jobs com falha
   */
  @Process({ name: "run-audit", concurrency: 10 })
  async onFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed:`, error);

    // Enviar alerta de falha
    const { orgId } = job.data as AuditJob;
    await this.alertService.sendAuditFailedAlert(orgId, error.message);
  }

  /**
   * Handler para jobs completados
   */
  @Process({ name: "run-audit", concurrency: 10 })
  async onCompleted(job: Job, result: AuditJobResult) {
    console.log(`Job ${job.id} completed in ${result.duration}ms`);

    // Limpar cache antigo se necessário
    if (result.report) {
      // Manter apenas últimas 10 auditorias em cache
      // Implementar lógica de limpeza aqui
    }
  }
}
