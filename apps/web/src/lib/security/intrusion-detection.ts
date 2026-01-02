/**
 * Intrusion Detection System
 * 
 * Sistema de detecção de intrusão e atividades suspeitas
 */

import { auditService } from "@/lib/audit/audit-service";
import { logger } from "@/lib/observability";
import { notificationService } from "@/lib/patterns";

export interface SecurityAlert {
    userId: string;
    alertType: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}

export class IntrusionDetector {
    /**
     * Detecta múltiplas falhas de login
     */
    async detectFailedLogins(userId: string): Promise<void> {
        const recentLogs = await auditService.getAuditTrail({
            userId,
            action: "user_login",
            startDate: new Date(Date.now() - 3600000), // 1 hora
        });

        const failedLogins = recentLogs.filter((l) => !l.success);

        if (failedLogins.length >= 5) {
            await this.createAlert({
                userId,
                alertType: "multiple_failed_logins",
                severity: "high",
                description: `${failedLogins.length} failed login attempts in the last hour`,
                metadata: { attempts: failedLogins.length },
                timestamp: new Date(),
            });

            // Bloquear usuário temporariamente
            await this.blockUser(userId, 30); // 30 minutos
        }
    }

    /**
     * Detecta mudanças suspeitas de IP
     */
    async detectSuspiciousIPs(userId: string): Promise<void> {
        const recentLogs = await auditService.getAuditTrail({
            userId,
            startDate: new Date(Date.now() - 3600000), // 1 hora
        });

        const ips = new Set(recentLogs.map((l) => l.ipAddress).filter(Boolean));

        if (ips.size > 3) {
            await this.createAlert({
                userId,
                alertType: "multiple_ips",
                severity: "medium",
                description: `Access from ${ips.size} different IPs in the last hour`,
                metadata: { ips: Array.from(ips) },
                timestamp: new Date(),
            });
        }
    }

    /**
     * Detecta acesso a dados sensíveis fora do horário
     */
    async detectAfterHoursAccess(userId: string): Promise<void> {
        const hour = new Date().getHours();

        // Horário comercial: 6h - 22h
        if (hour >= 6 && hour <= 22) {
            return;
        }

        const recentLogs = await auditService.getAuditTrail({
            userId,
            action: "data_access",
            startDate: new Date(Date.now() - 600000), // 10 minutos
        });

        const sensitiveAccess = recentLogs.filter(
            (l) => l.resource === "personal_data" || l.resource === "financial_data",
        );

        if (sensitiveAccess.length > 0) {
            await this.createAlert({
                userId,
                alertType: "after_hours_sensitive_access",
                severity: "high",
                description: `Access to sensitive data at ${hour}:00`,
                metadata: { hour, accessCount: sensitiveAccess.length },
                timestamp: new Date(),
            });

            // Notificar equipe de segurança
            await notificationService.sendMultiple(["email", "sms"], {
                to: "security-team",
                message: `ALERT: User ${userId} accessed sensitive data at ${hour}:00`,
            });
        }
    }

    /**
     * Detecta volume anormal de requisições
     */
    async detectAbnormalVolume(userId: string): Promise<void> {
        const recentLogs = await auditService.getAuditTrail({
            userId,
            startDate: new Date(Date.now() - 60000), // 1 minuto
        });

        // Mais de 100 requisições por minuto é suspeito
        if (recentLogs.length > 100) {
            await this.createAlert({
                userId,
                alertType: "abnormal_request_volume",
                severity: "critical",
                description: `${recentLogs.length} requests in the last minute`,
                metadata: { requestCount: recentLogs.length },
                timestamp: new Date(),
            });

            // Rate limit agressivo
            await this.blockUser(userId, 60); // 1 hora
        }
    }

    /**
     * Detecta tentativas de privilege escalation
     */
    async detectPrivilegeEscalation(userId: string): Promise<void> {
        const recentLogs = await auditService.getAuditTrail({
            userId,
            startDate: new Date(Date.now() - 3600000), // 1 hora
        });

        const deniedAccess = recentLogs.filter(
            (l) => l.action === "access_denied" && !l.success,
        );

        // Múltiplas tentativas de acesso negado
        if (deniedAccess.length > 10) {
            await this.createAlert({
                userId,
                alertType: "privilege_escalation_attempt",
                severity: "critical",
                description: `${deniedAccess.length} denied access attempts`,
                metadata: { attempts: deniedAccess.length },
                timestamp: new Date(),
            });

            // Bloquear e notificar
            await this.blockUser(userId, 120); // 2 horas
            await notificationService.send("email", {
                to: "security-team",
                subject: "CRITICAL: Privilege Escalation Attempt",
                message: `User ${userId} attempted privilege escalation`,
            });
        }
    }

    /**
     * Análise completa de segurança
     */
    async analyzeUserSecurity(userId: string): Promise<void> {
        await Promise.all([
            this.detectFailedLogins(userId),
            this.detectSuspiciousIPs(userId),
            this.detectAfterHoursAccess(userId),
            this.detectAbnormalVolume(userId),
            this.detectPrivilegeEscalation(userId),
        ]);
    }

    /**
     * Helpers privados
     */

    private async createAlert(alert: SecurityAlert): Promise<void> {
        logger.warn("Security alert created", alert);

        // Salvar alerta
        // await prisma.securityAlert.create({ data: alert });

        // Notificar se crítico
        if (alert.severity === "critical") {
            await notificationService.send("email", {
                to: "security-team",
                subject: `CRITICAL SECURITY ALERT: ${alert.alertType}`,
                message: alert.description,
            });
        }
    }

    private async blockUser(userId: string, minutes: number): Promise<void> {
        const unblockAt = new Date(Date.now() + minutes * 60000);

        logger.warn("User blocked", { userId, minutes, unblockAt });

        // Bloquear usuário
        // await prisma.user.update({
        //   where: { id: userId },
        //   data: { blockedUntil: unblockAt },
        // });

        // Audit log
        await auditService.log({
            action: "user_blocked",
            userId: "system",
            resource: "user",
            resourceId: userId,
            metadata: { minutes, reason: "Security alert" },
            success: true,
        });
    }
}

export const intrusionDetector = new IntrusionDetector();

/**
 * EXEMPLO DE USO:
 * 
 * // Após login
 * await intrusionDetector.detectFailedLogins(userId);
 * 
 * // Após qualquer ação
 * await intrusionDetector.analyzeUserSecurity(userId);
 * 
 * // Cron job (a cada 5 minutos)
 * setInterval(async () => {
 *   const activeUsers = await getActiveUsers();
 *   for (const user of activeUsers) {
 *     await intrusionDetector.analyzeUserSecurity(user.id);
 *   }
 * }, 5 * 60 * 1000);
 */
