/**
 * Audit Service - Comprehensive Audit Trail
 * 
 * Sistema completo de auditoria para compliance e rastreabilidade
 */

export interface AuditLogEntry {
    id: string;
    action: string;
    userId: string;
    userEmail?: string;
    userRole?: string;
    resource: string;
    resourceId?: string;
    changes?: Record<string, { old: any; new: any }>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    success: boolean;
    errorMessage?: string;
}

export interface AuditFilters {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
}

export class AuditService {
    /**
     * Registra uma ação no audit log
     */
    async log(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
        const auditEntry: AuditLogEntry = {
            ...entry,
            id: this.generateId(),
            timestamp: new Date(),
        };

        try {
            // Salvar no banco de dados
            await this.saveToDatabase(auditEntry);

            // Em produção, também enviar para serviço externo
            if (process.env.NODE_ENV === "production") {
                await this.sendToExternalService(auditEntry);
            }
        } catch (error) {
            console.error("Failed to save audit log:", error);
            // Não falhar a operação principal se audit log falhar
        }
    }

    /**
     * Registra uma operação bem-sucedida
     */
    async logSuccess(
        action: string,
        userId: string,
        resource: string,
        details?: Partial<AuditLogEntry>,
    ): Promise<void> {
        await this.log({
            action,
            userId,
            resource,
            success: true,
            ...details,
        });
    }

    /**
     * Registra uma operação que falhou
     */
    async logFailure(
        action: string,
        userId: string,
        resource: string,
        error: Error,
        details?: Partial<AuditLogEntry>,
    ): Promise<void> {
        await this.log({
            action,
            userId,
            resource,
            success: false,
            errorMessage: error.message,
            ...details,
        });
    }

    /**
     * Registra acesso a dados sensíveis (LGPD)
     */
    async logDataAccess(
        userId: string,
        dataType: string,
        dataOwnerId: string,
        purpose: string,
    ): Promise<void> {
        await this.log({
            action: "data_access",
            userId,
            resource: dataType,
            resourceId: dataOwnerId,
            metadata: { purpose },
            success: true,
        });
    }

    /**
     * Registra alteração de dados pessoais (LGPD)
     */
    async logDataChange(
        userId: string,
        dataType: string,
        dataOwnerId: string,
        changes: Record<string, { old: any; new: any }>,
    ): Promise<void> {
        await this.log({
            action: "data_change",
            userId,
            resource: dataType,
            resourceId: dataOwnerId,
            changes: this.sanitizeChanges(changes),
            success: true,
        });
    }

    /**
     * Registra exclusão de dados (LGPD - Direito ao Esquecimento)
     */
    async logDataDeletion(
        userId: string,
        dataType: string,
        dataOwnerId: string,
        reason: string,
    ): Promise<void> {
        await this.log({
            action: "data_deletion",
            userId,
            resource: dataType,
            resourceId: dataOwnerId,
            metadata: { reason },
            success: true,
        });
    }

    /**
     * Registra exportação de dados (LGPD - Portabilidade)
     */
    async logDataExport(
        userId: string,
        dataOwnerId: string,
        format: string,
    ): Promise<void> {
        await this.log({
            action: "data_export",
            userId,
            resource: "personal_data",
            resourceId: dataOwnerId,
            metadata: { format },
            success: true,
        });
    }

    /**
     * Busca logs de auditoria
     */
    async getAuditTrail(filters: AuditFilters): Promise<AuditLogEntry[]> {
        // TODO: Implementar busca no banco de dados
        return [];
    }

    /**
     * Gera relatório de compliance
     */
    async generateComplianceReport(
        startDate: Date,
        endDate: Date,
    ): Promise<{
        totalActions: number;
        successRate: number;
        dataAccessCount: number;
        dataChangesCount: number;
        dataDeletionsCount: number;
        topUsers: Array<{ userId: string; actionCount: number }>;
        topActions: Array<{ action: string; count: number }>;
    }> {
        const logs = await this.getAuditTrail({ startDate, endDate });

        return {
            totalActions: logs.length,
            successRate: logs.filter((l) => l.success).length / logs.length,
            dataAccessCount: logs.filter((l) => l.action === "data_access").length,
            dataChangesCount: logs.filter((l) => l.action === "data_change").length,
            dataDeletionsCount: logs.filter((l) => l.action === "data_deletion").length,
            topUsers: this.aggregateByUser(logs),
            topActions: this.aggregateByAction(logs),
        };
    }

    /**
     * Helpers privados
     */

    private generateId(): string {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async saveToDatabase(entry: AuditLogEntry): Promise<void> {
        // TODO: Implementar salvamento real no banco
        // await prisma.auditLog.create({ data: entry });
        console.log("[Audit Log]", entry);
    }

    private async sendToExternalService(entry: AuditLogEntry): Promise<void> {
        // Enviar para serviço externo (Datadog, Splunk, etc)
        try {
            await fetch("/api/audit/external", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            });
        } catch (error) {
            console.error("Failed to send audit log to external service:", error);
        }
    }

    private sanitizeChanges(
        changes: Record<string, { old: any; new: any }>,
    ): Record<string, { old: any; new: any }> {
        const sensitiveFields = ["password", "creditCard", "ssn", "cpf"];
        const sanitized = { ...changes };

        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = {
                    old: "[REDACTED]",
                    new: "[REDACTED]",
                };
            }
        }

        return sanitized;
    }

    private aggregateByUser(
        logs: AuditLogEntry[],
    ): Array<{ userId: string; actionCount: number }> {
        const userCounts = new Map<string, number>();

        for (const log of logs) {
            userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
        }

        return Array.from(userCounts.entries())
            .map(([userId, actionCount]) => ({ userId, actionCount }))
            .sort((a, b) => b.actionCount - a.actionCount)
            .slice(0, 10);
    }

    private aggregateByAction(
        logs: AuditLogEntry[],
    ): Array<{ action: string; count: number }> {
        const actionCounts = new Map<string, number>();

        for (const log of logs) {
            actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
        }

        return Array.from(actionCounts.entries())
            .map(([action, count]) => ({ action, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
}

/**
 * Instância singleton
 */
export const auditService = new AuditService();

/**
 * Decorator para audit automático
 */
export function Auditable(action: string, resource: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const userId = (this as any).userId || "system";

            try {
                const result = await originalMethod.apply(this, args);

                await auditService.logSuccess(action, userId, resource, {
                    metadata: { method: propertyKey, args },
                });

                return result;
            } catch (error) {
                await auditService.logFailure(
                    action,
                    userId,
                    resource,
                    error as Error,
                    {
                        metadata: { method: propertyKey, args },
                    },
                );

                throw error;
            }
        };

        return descriptor;
    };
}
