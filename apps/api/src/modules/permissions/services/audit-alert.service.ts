import { Injectable, Logger } from '@nestjs/common';
import type { AuditReport } from '../domain/types/audit-types';

/**
 * Serviço de notificações para alertas de auditoria
 * 
 * Envia notificações por email e Slack quando anomalias críticas
 * são detectadas.
 */
@Injectable()
export class AuditAlertService {
    private readonly logger = new Logger(AuditAlertService.name);

    /**
     * Processa relatório de auditoria e envia alertas se necessário
     */
    async processAuditReport(report: AuditReport, orgName: string) {
        // Verificar se há problemas críticos
        if (report.summary.criticalIssues > 0) {
            await this.sendCriticalAlert(report, orgName);
        }

        // Verificar se score de conformidade está baixo
        if (report.summary.conformityScore < 60) {
            await this.sendLowConformityAlert(report, orgName);
        }

        // Verificar violações de SoD
        if (report.sodViolations.length > 0) {
            await this.sendSoDViolationAlert(report, orgName);
        }
    }

    /**
     * Envia alerta crítico
     */
    private async sendCriticalAlert(report: AuditReport, orgName: string) {
        this.logger.warn(
            `🚨 ALERTA CRÍTICO: ${report.summary.criticalIssues} problemas críticos em ${orgName}`,
        );

        const message = this.buildCriticalMessage(report, orgName);

        // Enviar por email
        await this.sendEmail({
            to: process.env.SECURITY_ALERT_EMAIL || 'security@example.com',
            subject: `🚨 ALERTA CRÍTICO: Auditoria de Permissões - ${orgName}`,
            body: message,
        });

        // Enviar por Slack
        await this.sendSlack({
            channel: process.env.SLACK_SECURITY_CHANNEL || '#security-alerts',
            message,
        });
    }

    /**
     * Envia alerta de baixa conformidade
     */
    private async sendLowConformityAlert(report: AuditReport, orgName: string) {
        this.logger.warn(
            `⚠️  Baixa conformidade em ${orgName}: ${report.summary.conformityScore}%`,
        );

        const message = `
⚠️ **Alerta de Conformidade**

Organização: ${orgName}
Score de Conformidade: ${report.summary.conformityScore}%
Total de Anomalias: ${report.summary.anomaliesFound}

Recomendações:
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Executado em: ${new Date(report.timestamp).toLocaleString('pt-BR')}
    `.trim();

        await this.sendEmail({
            to: process.env.COMPLIANCE_ALERT_EMAIL || 'compliance@example.com',
            subject: `⚠️  Baixa Conformidade: ${orgName}`,
            body: message,
        });
    }

    /**
     * Envia alerta de violação de SoD
     */
    private async sendSoDViolationAlert(report: AuditReport, orgName: string) {
        this.logger.error(
            `🔴 Violações de SoD detectadas em ${orgName}: ${report.sodViolations.length}`,
        );

        const message = `
🔴 **VIOLAÇÕES DE SEGREGAÇÃO DE FUNÇÕES**

Organização: ${orgName}
Violações Detectadas: ${report.sodViolations.length}

Detalhes:
${report.sodViolations
                .slice(0, 5)
                .map(
                    (v, i) =>
                        `${i + 1}. Usuário: ${v.userName || v.userId}\n   Severidade: ${v.severity}\n   Descrição: ${v.description}`,
                )
                .join('\n\n')}

${report.sodViolations.length > 5 ? `\n... e mais ${report.sodViolations.length - 5} violações` : ''}

⚠️  AÇÃO IMEDIATA NECESSÁRIA

Executado em: ${new Date(report.timestamp).toLocaleString('pt-BR')}
    `.trim();

        await this.sendEmail({
            to: process.env.SECURITY_ALERT_EMAIL || 'security@example.com',
            subject: `🔴 VIOLAÇÕES DE SoD: ${orgName}`,
            body: message,
            priority: 'high',
        });

        await this.sendSlack({
            channel: process.env.SLACK_SECURITY_CHANNEL || '#security-alerts',
            message,
            priority: 'high',
        });
    }

    /**
     * Constrói mensagem de alerta crítico
     */
    private buildCriticalMessage(report: AuditReport, orgName: string): string {
        return `
🚨 **ALERTA CRÍTICO DE SEGURANÇA**

Organização: ${orgName}
Score de Conformidade: ${report.summary.conformityScore}%

**Problemas Críticos: ${report.summary.criticalIssues}**
- Alta Severidade: ${report.summary.highSeverityIssues}
- Média Severidade: ${report.summary.mediumSeverityIssues}
- Baixa Severidade: ${report.summary.lowSeverityIssues}

**Anomalias Detectadas:**
- Permissões Órfãs: ${report.orphanedPermissions.length}
- Conflitos: ${report.conflicts.length}
- Permissões Excessivas: ${report.excessivePermissions.length}
- Violações de SoD: ${report.sodViolations.length}
- Inconsistências Hierárquicas: ${report.hierarchyIssues.length}
- Gaps de Auditoria: ${report.auditGaps.length}

**Recomendações Urgentes:**
${report.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join('\n')}

Executado em: ${new Date(report.timestamp).toLocaleString('pt-BR')}

🔗 Acesse o dashboard para mais detalhes e ações corretivas.
    `.trim();
    }

    /**
     * Envia email (mock - implementar com serviço real)
     */
    private async sendEmail(options: {
        to: string;
        subject: string;
        body: string;
        priority?: string;
    }) {
        // TODO: Implementar com Nodemailer, SendGrid, AWS SES, etc.
        this.logger.log(`📧 Email enviado para ${options.to}: ${options.subject}`);

        // Exemplo com Nodemailer:
        // const transporter = nodemailer.createTransport({...});
        // await transporter.sendMail({
        //   from: process.env.SMTP_FROM,
        //   to: options.to,
        //   subject: options.subject,
        //   text: options.body,
        //   priority: options.priority || 'normal',
        // });
    }

    /**
     * Envia mensagem para Slack (mock - implementar com webhook real)
     */
    private async sendSlack(options: {
        channel: string;
        message: string;
        priority?: string;
    }) {
        // TODO: Implementar com @slack/webhook
        this.logger.log(`💬 Slack enviado para ${options.channel}`);

        // Exemplo com Slack Webhook:
        // const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
        // await webhook.send({
        //   channel: options.channel,
        //   text: options.message,
        //   icon_emoji: options.priority === 'high' ? ':rotating_light:' : ':warning:',
        // });
    }
}
