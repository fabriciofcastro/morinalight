import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Job, Queue } from 'bull';
import type { AuditReport } from '../domain/types/audit-types';

export interface AuditJob {
    orgId: string;
    userId?: string;
    options?: {
        fix?: boolean;
        dryRun?: boolean;
        notifyOnComplete?: boolean;
    };
}

export interface BatchAuditJob {
    orgIds: string[];
    options?: {
        parallel?: number;
        notifyOnComplete?: boolean;
    };
}

export interface AuditJobResult {
    orgId: string;
    report?: AuditReport;
    error?: string;
    duration: number;
}

/**
 * Serviço de fila para processamento paralelo de auditorias
 * Permite processar 10x mais usuários simultaneamente
 */
@Injectable()
export class AuditQueueService {
    constructor(
        @InjectQueue('audit') private auditQueue: Queue,
    ) { }

    /**
     * Adiciona auditoria à fila
     */
    async queueAudit(job: AuditJob, priority: number = 0): Promise<Job<AuditJob>> {
        return this.auditQueue.add('run-audit', job, {
            priority,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: 100, // Manter últimos 100 jobs completos
            removeOnFail: 500, // Manter últimos 500 jobs com falha
        });
    }

    /**
     * Adiciona múltiplas auditorias em batch
     */
    async queueBatchAudit(job: BatchAuditJob): Promise<Job<BatchAuditJob>> {
        return this.auditQueue.add('batch-audit', job, {
            priority: 5, // Maior prioridade para batches
            attempts: 1, // Não retry em batches
        });
    }

    /**
     * Agenda auditoria para execução futura
     */
    async scheduleAudit(
        job: AuditJob,
        delay: number, // Delay em milissegundos
    ): Promise<Job<AuditJob>> {
        return this.auditQueue.add('run-audit', job, {
            delay,
            attempts: 3,
        });
    }

    /**
     * Agenda auditoria recorrente
     */
    async scheduleRecurringAudit(
        job: AuditJob,
        cron: string, // Expressão cron
    ): Promise<Job<AuditJob>> {
        return this.auditQueue.add('run-audit', job, {
            repeat: {
                cron,
            },
        });
    }

    /**
     * Obtém status de um job
     */
    async getJobStatus(jobId: string): Promise<{
        state: string;
        progress: number;
        result?: any;
        error?: string;
    }> {
        const job = await this.auditQueue.getJob(jobId);

        if (!job) {
            throw new Error('Job not found');
        }

        const state = await job.getState();
        const progress = job.progress();

        return {
            state,
            progress: typeof progress === 'number' ? progress : 0,
            result: job.returnvalue,
            error: job.failedReason,
        };
    }

    /**
     * Obtém progresso de um batch
     */
    async getBatchProgress(jobId: string): Promise<{
        total: number;
        completed: number;
        failed: number;
        pending: number;
        percentage: number;
    }> {
        const job = await this.auditQueue.getJob(jobId);

        if (!job) {
            throw new Error('Job not found');
        }

        const progress = job.progress() as any;

        return {
            total: progress.total || 0,
            completed: progress.completed || 0,
            failed: progress.failed || 0,
            pending: progress.pending || 0,
            percentage: progress.percentage || 0,
        };
    }

    /**
     * Cancela um job
     */
    async cancelJob(jobId: string): Promise<void> {
        const job = await this.auditQueue.getJob(jobId);

        if (!job) {
            throw new Error('Job not found');
        }

        await job.remove();
    }

    /**
     * Pausa a fila
     */
    async pauseQueue(): Promise<void> {
        await this.auditQueue.pause();
    }

    /**
     * Resume a fila
     */
    async resumeQueue(): Promise<void> {
        await this.auditQueue.resume();
    }

    /**
     * Limpa jobs completos
     */
    async cleanCompleted(grace: number = 0): Promise<void> {
        await this.auditQueue.clean(grace, 'completed');
    }

    /**
     * Limpa jobs com falha
     */
    async cleanFailed(grace: number = 0): Promise<void> {
        await this.auditQueue.clean(grace, 'failed');
    }

    /**
     * Obtém estatísticas da fila
     */
    async getQueueStats(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        paused: boolean;
    }> {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            this.auditQueue.getWaitingCount(),
            this.auditQueue.getActiveCount(),
            this.auditQueue.getCompletedCount(),
            this.auditQueue.getFailedCount(),
            this.auditQueue.getDelayedCount(),
        ]);

        const isPaused = await this.auditQueue.isPaused();

        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
            paused: isPaused,
        };
    }

    /**
     * Obtém jobs ativos
     */
    async getActiveJobs(): Promise<Job<AuditJob>[]> {
        return this.auditQueue.getActive();
    }

    /**
     * Obtém jobs aguardando
     */
    async getWaitingJobs(): Promise<Job<AuditJob>[]> {
        return this.auditQueue.getWaiting();
    }

    /**
     * Obtém jobs com falha
     */
    async getFailedJobs(start = 0, end = 10): Promise<Job<AuditJob>[]> {
        return this.auditQueue.getFailed(start, end);
    }

    /**
     * Retry de um job com falha
     */
    async retryJob(jobId: string): Promise<void> {
        const job = await this.auditQueue.getJob(jobId);

        if (!job) {
            throw new Error('Job not found');
        }

        await job.retry();
    }

    /**
     * Retry de todos os jobs com falha
     */
    async retryAllFailed(): Promise<number> {
        const failed = await this.auditQueue.getFailed();

        for (const job of failed) {
            await job.retry();
        }

        return failed.length;
    }

    /**
     * Remove todos os jobs
     */
    async obliterate(): Promise<void> {
        await this.auditQueue.obliterate({ force: true });
    }
}
