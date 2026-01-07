/**
 * Intrusion Detection System
 * 
 * Sistema de detecção de intrusão e atividades suspeitas
 */

import { auditService } from "@/lib/audit/audit-service";
import { logger } from "@/lib/observability";
import { getPrismaClient } from "@/lib/prisma";
import { securityNotificationService } from "@/lib/security/notifications";
import { siemExporter } from "@/lib/siem/siem-exporter";

export interface SecurityAlert {
    userId: string;
    alertType: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    metadata?: Record<string, any>;
    timestamp: Date;
    ipAddress?: string;
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
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

        const failedLogins = recentLogs.filter((l) => l.status === 'FAILURE');

        const maxFailedLogins = parseInt(process.env.IDS_MAX_FAILED_LOGINS || "5");

        if (failedLogins.length >= maxFailedLogins) {
            await this.createAlert({
                userId,
                alertType: "multiple_failed_logins",
                severity: "high",
                description: `${failedLogins.length} failed login attempts in the last hour`,
                metadata: { attempts: failedLogins.length },
                timestamp: new Date(),
            });

            // Bloquear usuário temporariamente
            const blockDuration = parseInt(process.env.IDS_BLOCK_DURATION_MINUTES || "30");
            await this.blockUser(userId, blockDuration);
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
     * Detecta viagem impossível (impossible travel)
     */
    async detectImpossibleTravel(userId: string, currentIP: string): Promise<void> {
        try {
            const { geolocationService } = await import('@/lib/services/geolocation-service');

            // Get current location
            const currentLocation = await geolocationService.getLocation(currentIP);
            if (!currentLocation || currentLocation.countryCode === 'LOCAL') {
                return; // Skip for local IPs
            }

            // Get recent logins
            const prisma = await getPrismaClient();
            if (!prisma) return;

            const recentLogins = await prisma.securityAlert.findMany({
                where: {
                    userId,
                    alertType: 'login_location',
                    latitude: { not: null },
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            });

            if (recentLogins.length === 0) {
                // First login, just record location
                await this.createAlert({
                    userId,
                    alertType: 'login_location',
                    severity: 'low',
                    description: `Login from ${geolocationService.getLocationSummary(currentLocation)}`,
                    ipAddress: currentIP,
                    timestamp: new Date(),
                });
                return;
            }

            const lastLogin = recentLogins[0]!;

            if (!lastLogin.latitude || !lastLogin.longitude) {
                return; // No location data to compare
            }

            const lastLocation = {
                latitude: lastLogin.latitude,
                longitude: lastLogin.longitude,
                city: lastLogin.city,
                country: lastLogin.country,
            };

            // Calculate time difference in minutes
            const timeDiff = (new Date().getTime() - lastLogin.createdAt.getTime()) / (1000 * 60);

            // Check for impossible travel
            const isImpossible = geolocationService.detectImpossibleTravel(
                { ...currentLocation, ip: currentIP },
                { ...currentLocation, ...lastLocation, ip: lastLogin.ipAddress || '' } as any,
                timeDiff
            );

            if (isImpossible) {
                const distance = geolocationService.calculateDistance(
                    lastLocation.latitude,
                    lastLocation.longitude,
                    currentLocation.latitude,
                    currentLocation.longitude
                );

                await this.createAlert({
                    userId,
                    alertType: 'impossible_travel',
                    severity: 'critical',
                    description: `Impossible travel detected: ${Math.round(distance)}km in ${Math.round(timeDiff)} minutes`,
                    ipAddress: currentIP,
                    metadata: {
                        currentLocation: geolocationService.getLocationSummary(currentLocation),
                        previousLocation: `${lastLocation.city}, ${lastLocation.country}`,
                        distance: Math.round(distance),
                        timeMinutes: Math.round(timeDiff),
                    },
                    timestamp: new Date(),
                });

                // Auto-block for impossible travel
                await this.blockUser(userId, 60); // 1 hour
            } else {
                // Normal login, record location
                await this.createAlert({
                    userId,
                    alertType: 'login_location',
                    severity: 'low',
                    description: `Login from ${geolocationService.getLocationSummary(currentLocation)}`,
                    ipAddress: currentIP,
                    timestamp: new Date(),
                });
            }
        } catch (error) {
            console.error('[IDS] Impossible travel detection error:', error);
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

            // Notificar equipe de segurança via múltiplos canais
            await securityNotificationService.sendMultiple(["email", "slack"], {
                to: "security-team",
                subject: `ALERT: Suspicious After-Hours Access`,
                message: `User ${userId} accessed sensitive data (${sensitiveAccess.length} times) outside of business hours at ${hour}:00.`,
                priority: "high"
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
            (l) => l.action === "access_denied" && l.status === 'FAILURE',
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
            await securityNotificationService.sendMultiple(["email", "slack"], {
                to: "security-team",
                subject: "CRITICAL: Privilege Escalation Attempt",
                message: `User ${userId} attempted privilege escalation with ${deniedAccess.length} denied access attempts in the last hour. User has been blocked for 2 hours.`,
                priority: "critical"
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
     * Helpers
     */

    public async createAlert(alert: SecurityAlert): Promise<void> {
        logger.warn("Security alert created", alert);

        // Export to SIEM if enabled
        try {
            await siemExporter.exportSecurityAlert(alert);
        } catch (siemError) {
            logger.error("Failed to export security alert to SIEM", siemError as Error);
        }

        try {
            const prisma = await getPrismaClient();
            if (prisma) {
                // Tentar obter geolocalização se houver IP e os campos não estiverem preenchidos
                if (alert.ipAddress && (!alert.country || !alert.latitude)) {
                    try {
                        const { geolocationService } = await import('@/lib/services/geolocation-service');
                        const location = await geolocationService.getLocation(alert.ipAddress);
                        if (location) {
                            alert.country = location.country;
                            alert.city = location.city;
                            alert.latitude = location.latitude;
                            alert.longitude = location.longitude;
                        }
                    } catch (geoError) {
                        console.error('[IDS] Geolocation resolution failed for alert', geoError);
                    }
                }

                // Remover timestamp da interface para usar createdAt do banco ou mapear
                const { timestamp, ...alertData } = alert;
                const createdAlert = await prisma.securityAlert.create({
                    data: {
                        ...alertData,
                        createdAt: timestamp
                    }
                });

                // Trigger automated threat response
                try {
                    const { threatResponseEngine } = await import('@/lib/security/threat-response-engine');
                    await threatResponseEngine.processAlert({
                        id: createdAlert.id,
                        userId: alert.userId,
                        alertType: alert.alertType,
                        severity: alert.severity,
                        metadata: alert.metadata,
                    });
                } catch (engineError) {
                    console.error('[IDS] Threat response engine error:', engineError);
                }
            }
        } catch (error) {
            logger.error("Failed to persist security alert", error as Error);
        }

        // Notificar se crítico
        if (alert.severity === "critical") {
            await securityNotificationService.sendMultiple(["email", "slack"], {
                to: "security-team",
                subject: `CRITICAL SECURITY ALERT: ${alert.alertType}`,
                message: `${alert.description}. Time: ${alert.timestamp.toISOString()}. IP: ${alert.ipAddress || 'Unknown'}.`,
                priority: "critical"
            });
        }
    }

    private async blockUser(userId: string, minutes: number): Promise<void> {
        const unblockAt = new Date(Date.now() + minutes * 60000);

        logger.warn("User blocked", { userId, minutes, unblockAt });

        try {
            const prisma = await getPrismaClient();
            if (prisma) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { blockedUntil: unblockAt },
                });
            }
        } catch (error) {
            logger.error("Failed to block user in database", error as Error);
        }

        // Audit log
        await auditService.log({
            action: "user_blocked",
            userId: "system",
            resource: "user",
            resourceId: userId,
            metadata: { minutes, reason: "Security alert" },
            status: "SUCCESS",
            userRole: "system",
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
