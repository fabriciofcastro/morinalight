/**
 * Audit Logger - Sistema de Logs de Auditoria
 * 
 * Registra todas as mudanças em permissões condicionais
 * para compliance e rastreabilidade.
 */

export interface AuditLog {
    id: string;
    timestamp: Date;
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE';
    resourceType: 'CONDITIONAL_PERMISSION' | 'DEPARTMENT' | 'USER';
    resourceId: string;
    changes?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

class AuditLogger {
    private logs: AuditLog[] = [];

    /**
     * Registra uma ação de auditoria
     */
    log(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
        const auditLog: AuditLog = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            ...entry,
        };

        this.logs.push(auditLog);

        // Em produção, enviar para backend/database
        console.log('[AUDIT]', auditLog);

        return auditLog;
    }

    /**
     * Registra criação de permissão condicional
     */
    logPermissionCreated(
        userId: string,
        permission: string,
        conditions: any
    ): AuditLog {
        return this.log({
            userId,
            action: 'CREATE',
            resourceType: 'CONDITIONAL_PERMISSION',
            resourceId: permission,
            metadata: {
                conditions,
                reason: 'Nova permissão condicional criada',
            },
        });
    }

    /**
     * Registra atualização de permissão condicional
     */
    logPermissionUpdated(
        userId: string,
        permission: string,
        oldConditions: any,
        newConditions: any
    ): AuditLog {
        const changes = this.detectChanges(oldConditions, newConditions);

        return this.log({
            userId,
            action: 'UPDATE',
            resourceType: 'CONDITIONAL_PERMISSION',
            resourceId: permission,
            changes,
            metadata: {
                reason: 'Permissão condicional atualizada',
            },
        });
    }

    /**
     * Registra exclusão de permissão condicional
     */
    logPermissionDeleted(
        userId: string,
        permission: string,
        reason?: string
    ): AuditLog {
        return this.log({
            userId,
            action: 'DELETE',
            resourceType: 'CONDITIONAL_PERMISSION',
            resourceId: permission,
            metadata: {
                reason: reason || 'Permissão condicional removida',
            },
        });
    }

    /**
     * Registra ativação/desativação de permissão
     */
    logPermissionToggled(
        userId: string,
        permission: string,
        isActive: boolean
    ): AuditLog {
        return this.log({
            userId,
            action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
            resourceType: 'CONDITIONAL_PERMISSION',
            resourceId: permission,
            metadata: {
                reason: isActive ? 'Permissão ativada' : 'Permissão desativada',
            },
        });
    }

    /**
     * Registra aplicação de sugestão de IA
     */
    logAISuggestionApplied(
        userId: string,
        suggestionType: string,
        suggestionData: any
    ): AuditLog {
        return this.log({
            userId,
            action: 'CREATE',
            resourceType: 'DEPARTMENT',
            resourceId: suggestionData.name || 'unknown',
            metadata: {
                source: 'AI_SUGGESTION',
                suggestionType,
                suggestionData,
                reason: 'Sugestão de IA aplicada automaticamente',
            },
        });
    }

    /**
     * Detecta mudanças entre dois objetos
     */
    private detectChanges(oldObj: any, newObj: any): AuditLog['changes'] {
        const changes: AuditLog['changes'] = [];

        const allKeys = new Set([
            ...Object.keys(oldObj || {}),
            ...Object.keys(newObj || {}),
        ]);

        allKeys.forEach(key => {
            const oldValue = oldObj?.[key];
            const newValue = newObj?.[key];

            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes.push({
                    field: key,
                    oldValue,
                    newValue,
                });
            }
        });

        return changes;
    }

    /**
     * Retorna logs filtrados
     */
    getLogs(filter?: {
        userId?: string;
        action?: AuditLog['action'];
        resourceType?: AuditLog['resourceType'];
        startDate?: Date;
        endDate?: Date;
    }): AuditLog[] {
        let filtered = [...this.logs];

        if (filter?.userId) {
            filtered = filtered.filter(log => log.userId === filter.userId);
        }

        if (filter?.action) {
            filtered = filtered.filter(log => log.action === filter.action);
        }

        if (filter?.resourceType) {
            filtered = filtered.filter(log => log.resourceType === filter.resourceType);
        }

        if (filter?.startDate) {
            filtered = filtered.filter(log => log.timestamp >= filter.startDate!);
        }

        if (filter?.endDate) {
            filtered = filtered.filter(log => log.timestamp <= filter.endDate!);
        }

        return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    /**
     * Limpa logs (apenas para testes)
     */
    clear(): void {
        this.logs = [];
    }
}

// Singleton instance
export const auditLogger = new AuditLogger();
