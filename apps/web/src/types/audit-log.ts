export interface AuditLogEntry {
    id: string;
    entityType: string;       // "branch", "user", etc.
    entityId: string;
    action: "create" | "update" | "delete";
    userId: string;
    userName: string;
    userEmail?: string;
    timestamp: string;
    changes?: FieldChange[];
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

export interface FieldChange {
    field: string;
    fieldLabel: string;
    oldValue: any;
    newValue: any;
    valueType: "string" | "number" | "boolean" | "date" | "object" | "array";
}

export interface AuditLogFilter {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: "create" | "update" | "delete";
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}
