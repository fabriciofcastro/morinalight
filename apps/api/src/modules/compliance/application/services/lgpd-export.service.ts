/**
 * LGPD Export Service
 * Implementa o direito de portabilidade e acesso aos dados (Art. 18 da LGPD)
 */

import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();
import { siemExporter } from "../../../../lib/siem/siem-exporter";

export interface LgpdExportData {
    metadata: {
        exportedAt: string;
        version: string;
        userId: string;
    };
    profile: {
        id: string;
        email: string;
        displayName: string | null;
        status: string;
        createdAt: Date;
        lastLoginAt: Date | null;
    } | null;
    organizations: Array<{
        id: string;
        name: string;
        role: string;
        joinedAt: Date;
    }>;
    activityLogs: Array<{
        id: string;
        action: string;
        timestamp: Date;
        ipAddress: string | null;
        metadata: any;
    }>;
    securityAlerts: Array<{
        id: string;
        alertType: string;
        severity: string;
        timestamp: Date;
        description: string;
    }>;
    notifications: Array<{
        id: string;
        type: string;
        title: string;
        createdAt: Date;
        read: boolean;
    }>;
    consents: Array<{
        action: string;
        timestamp: Date;
        payload: any;
    }>;
}

export class LgpdExportService {
    /**
     * Coleta todos os dados pessoais associados a um usuário em um formato portátil.
     */
    async generateExport(userId: string, orgId?: string): Promise<LgpdExportData> {
        const exportResult: LgpdExportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                version: "1.0.0",
                userId,
            },
            profile: null,
            organizations: [],
            activityLogs: [],
            securityAlerts: [],
            notifications: [],
            consents: []
        };

        const [
            user,
            memberships,
            auditLogs,
            securityAlerts,
            notifications,
            consentLogs
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    status: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
            }),
            prisma.organizationMembership.findMany({
                where: { userId },
                include: { organization: true },
            }),
            prisma.organizationAuditLog.findMany({
                where: {
                    OR: [
                        { actorId: userId },
                        { targetId: userId }
                    ],
                    orgId: orgId // Se fornecido, filtra por org
                },
                orderBy: { createdAt: "desc" },
                take: 500,
            }),
            prisma.securityAlert.findMany({
                where: { userId },
                orderBy: { timestamp: "desc" },
            }),
            prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 200,
            }),
            prisma.organizationAuditLog.findMany({
                where: {
                    actorId: userId,
                    action: "lgpd.consent"
                },
                orderBy: { createdAt: "desc" }
            })
        ]);

        exportResult.profile = user;
        exportResult.organizations = memberships.map((m) => ({
            id: m.organizationId,
            name: m.organization.name,
            role: m.role,
            joinedAt: m.createdAt,
        }));
        exportResult.activityLogs = auditLogs.map((log) => ({
            id: log.id,
            action: log.action,
            timestamp: log.createdAt,
            ipAddress: (log.payload as any)?.ipAddress || null,
            metadata: log.payload,
        }));
        exportResult.securityAlerts = securityAlerts.map((alert) => ({
            id: alert.id,
            alertType: alert.alertType,
            severity: alert.severity,
            timestamp: alert.timestamp,
            description: alert.description,
        }));
        exportResult.notifications = notifications.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            createdAt: n.createdAt,
            read: n.read,
        }));
        exportResult.consents = consentLogs.map((log) => ({
            action: log.action,
            timestamp: log.createdAt,
            payload: log.payload,
        }));

        // Registrar auditoria da exportação
        await prisma.organizationAuditLog.create({
            data: {
                orgId: orgId || "system",
                action: "lgpd.data_export",
                actorId: userId,
                targetId: userId,
                payload: {
                    timestamp: new Date().toISOString(),
                    type: "full_portability_json"
                }
            }
        });

        // SIEM Log
        siemExporter.log({
            timestamp: new Date().toISOString(),
            source: "compliance",
            action: "lgpd.data_export",
            severity: "medium",
            actorId: userId,
            orgId: orgId,
            payload: { type: "full_portability_json" }
        });

        return exportResult;
    }
}

export const lgpdExportService = new LgpdExportService();
