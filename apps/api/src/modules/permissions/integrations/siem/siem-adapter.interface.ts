export interface AuditEvent {
  eventType: "anomaly" | "correction" | "audit_run" | "sod_violation";
  timestamp: Date;
  orgId: string;
  userId?: string;
  severity: "low" | "medium" | "high" | "critical";
  details: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SIEMAdapter {
  name: string;
  sendEvent(event: AuditEvent): Promise<void>;
  sendBatch(events: AuditEvent[]): Promise<void>;
  formatEvent(event: AuditEvent): any;
  testConnection(): Promise<boolean>;
}
