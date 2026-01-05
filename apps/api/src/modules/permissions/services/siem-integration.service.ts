import { Injectable } from '@nestjs/common';
import * as splunk from 'splunk-sdk';
import type { AuditReport } from '../domain/types/audit-types';

export interface SIEMEvent {
    timestamp: Date;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    userId?: string;
    orgId: string;
    details: Record<string, any>;
}

export interface SIEMConfig {
    type: 'splunk' | 'elk' | 'sentinel' | 'custom';
    host: string;
    port: number;
    token?: string;
    username?: string;
    password?: string;
    index?: string;
}

/**
 * Serviço de integração com sistemas SIEM
 * Suporta Splunk, ELK Stack, Microsoft Sentinel e webhooks customizados
 */
@Injectable()
export class SIEMIntegrationService {
    private splunkService: any = null;
    private config: SIEMConfig | null = null;

    /**
     * Configura conexão com SIEM
     */
    async configure(config: SIEMConfig): Promise<void> {
        this.config = config;

        if (config.type === 'splunk') {
            this.splunkService = new splunk.Service({
                host: config.host,
                port: config.port,
                username: config.username,
                password: config.password,
                scheme: 'https',
            });

            // Autenticar
            await new Promise((resolve, reject) => {
                this.splunkService.login((err: any) => {
                    if (err) {
                        console.error('Erro ao conectar ao Splunk:', err);
                        reject(err);
                    } else {
                        console.log('Conectado ao Splunk com sucesso');
                        resolve(true);
                    }
                });
            });
        }
    }

    /**
     * Envia evento de auditoria para SIEM
     */
    async sendAuditEvent(report: AuditReport): Promise<void> {
        if (!this.config) {
            console.warn('SIEM não configurado');
            return;
        }

        const event: SIEMEvent = {
            timestamp: new Date(),
            eventType: 'permission_audit_completed',
            severity: this.calculateEventSeverity(report),
            source: 'permission_audit_system',
            orgId: report.orgId,
            details: {
                auditId: report.id,
                conformityScore: report.summary.conformityScore,
                totalAnomalies: report.summary.anomaliesFound,
                criticalIssues: report.summary.criticalIssues,
                anomaliesByType: {
                    orphaned: report.orphanedPermissions.length,
                    conflicts: report.conflicts.length,
                    excessive: report.excessivePermissions.length,
                    hierarchy: report.hierarchyIssues.length,
                    auditGaps: report.auditGaps.length,
                    obsolete: report.obsoletePermissions.length,
                    sodViolations: report.sodViolations.length,
                },
            },
        };

        await this.sendEvent(event);
    }

    /**
     * Envia evento de anomalia crítica
     */
    async sendCriticalAnomaly(anomaly: any, userId: string, orgId: string): Promise<void> {
        const event: SIEMEvent = {
            timestamp: new Date(),
            eventType: 'critical_permission_anomaly',
            severity: 'critical',
            source: 'permission_audit_system',
            userId,
            orgId,
            details: {
                anomalyType: anomaly.type,
                description: anomaly.description,
                affectedResources: anomaly.resources,
            },
        };

        await this.sendEvent(event);
    }

    /**
     * Envia evento de violação de SoD
     */
    async sendSoDViolation(violation: any, orgId: string): Promise<void> {
        const event: SIEMEvent = {
            timestamp: new Date(),
            eventType: 'sod_violation_detected',
            severity: violation.severity || 'high',
            source: 'permission_audit_system',
            userId: violation.userId,
            orgId,
            details: {
                policyId: violation.policyId,
                policyName: violation.policyName,
                conflictingPermissions: violation.conflictingPermissions,
                userEmail: violation.userEmail,
            },
        };

        await this.sendEvent(event);
    }

    /**
     * Envia evento genérico para SIEM
     */
    private async sendEvent(event: SIEMEvent): Promise<void> {
        if (!this.config) {
            return;
        }

        try {
            switch (this.config.type) {
                case 'splunk':
                    await this.sendToSplunk(event);
                    break;
                case 'elk':
                    await this.sendToELK(event);
                    break;
                case 'sentinel':
                    await this.sendToSentinel(event);
                    break;
                case 'custom':
                    await this.sendToCustomWebhook(event);
                    break;
                default:
                    console.warn(`Tipo de SIEM não suportado: ${this.config.type}`);
            }
        } catch (error) {
            console.error('Erro ao enviar evento para SIEM:', error);
        }
    }

    /**
     * Envia evento para Splunk
     */
    private async sendToSplunk(event: SIEMEvent): Promise<void> {
        if (!this.splunkService) {
            throw new Error('Splunk não configurado');
        }

        return new Promise((resolve, reject) => {
            const index = this.config?.index || 'main';

            this.splunkService.indexes().fetch((err: any, indexes: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                const targetIndex = indexes.item(index);
                if (!targetIndex) {
                    reject(new Error(`Índice ${index} não encontrado`));
                    return;
                }

                targetIndex.submitEvent(
                    JSON.stringify(event),
                    {
                        sourcetype: 'permission_audit',
                        host: 'permission_audit_system',
                    },
                    (submitErr: any) => {
                        if (submitErr) {
                            reject(submitErr);
                        } else {
                            console.log('Evento enviado para Splunk com sucesso');
                            resolve();
                        }
                    },
                );
            });
        });
    }

    /**
     * Envia evento para ELK Stack (Elasticsearch)
     */
    private async sendToELK(event: SIEMEvent): Promise<void> {
        // Implementação para Elasticsearch
        const url = `https://${this.config!.host}:${this.config!.port}/permission-audit/_doc`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config!.token}`,
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) {
            throw new Error(`Erro ao enviar para ELK: ${response.statusText}`);
        }

        console.log('Evento enviado para ELK com sucesso');
    }

    /**
     * Envia evento para Microsoft Sentinel
     */
    private async sendToSentinel(event: SIEMEvent): Promise<void> {
        // Implementação para Microsoft Sentinel (Azure Monitor)
        const url = `https://${this.config!.host}/api/logs?api-version=2016-04-01`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `SharedKey ${this.config!.token}`,
                'Log-Type': 'PermissionAudit',
            },
            body: JSON.stringify([event]),
        });

        if (!response.ok) {
            throw new Error(`Erro ao enviar para Sentinel: ${response.statusText}`);
        }

        console.log('Evento enviado para Sentinel com sucesso');
    }

    /**
     * Envia evento para webhook customizado
     */
    private async sendToCustomWebhook(event: SIEMEvent): Promise<void> {
        const url = `https://${this.config!.host}:${this.config!.port}/webhook`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config!.token}`,
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) {
            throw new Error(`Erro ao enviar para webhook: ${response.statusText}`);
        }

        console.log('Evento enviado para webhook customizado com sucesso');
    }

    /**
     * Calcula severidade do evento baseado no relatório
     */
    private calculateEventSeverity(
        report: AuditReport,
    ): 'low' | 'medium' | 'high' | 'critical' {
        if (report.summary.criticalIssues > 0) return 'critical';
        if (report.summary.conformityScore < 60) return 'critical';
        if (report.summary.conformityScore < 80) return 'high';
        if (report.summary.anomaliesFound > 10) return 'medium';
        return 'low';
    }

    /**
     * Testa conexão com SIEM
     */
    async testConnection(): Promise<{ success: boolean; message: string }> {
        if (!this.config) {
            return { success: false, message: 'SIEM não configurado' };
        }

        try {
            const testEvent: SIEMEvent = {
                timestamp: new Date(),
                eventType: 'connection_test',
                severity: 'low',
                source: 'permission_audit_system',
                orgId: 'test',
                details: { test: true },
            };

            await this.sendEvent(testEvent);

            return { success: true, message: 'Conexão testada com sucesso' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Envia batch de eventos
     */
    async sendBatch(events: SIEMEvent[]): Promise<void> {
        for (const event of events) {
            await this.sendEvent(event);
        }
    }
}
