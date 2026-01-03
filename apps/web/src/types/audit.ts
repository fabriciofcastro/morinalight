export interface CompanyAuditLog {
    id: string;
    orgId: string;
    action: "create" | "update" | "delete" | "restore";
    entity: string;
    fieldName?: string | null;
    fieldLabel?: string | null;
    oldValue?: any;
    newValue?: any;
    actorId: string;
    actorName?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    justification?: string | null;
    metadata?: Record<string, any> | null;
    createdAt: string;
}

export interface AuditLogListResponse {
    logs: CompanyAuditLog[];
    total: number;
    limit: number;
    offset: number;
}

export interface AuditLogFilters {
    limit?: number;
    offset?: number;
    fieldName?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
}
