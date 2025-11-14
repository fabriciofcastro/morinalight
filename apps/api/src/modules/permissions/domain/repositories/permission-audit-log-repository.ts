export type PermissionAuditLog = {
  id: string;
  orgId: string;
  entityType: "position" | "sector" | "department" | "user";
  entityId: string;
  permissionId: string;
  action: "granted" | "denied" | "removed";
  granted: boolean | null;
  previousValue: boolean | null;
  actorId: string;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};

export type PermissionAuditLogFilter = {
  entityType?: "position" | "sector" | "department" | "user";
  entityId?: string;
  permissionId?: string;
  action?: "granted" | "denied" | "removed";
  actorId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  cursor?: string;
  limite?: number;
};

export type PermissionAuditLogPage = {
  itens: PermissionAuditLog[];
  proximoCursor?: string;
};

export interface PermissionAuditLogRepository {
  registrar(log: PermissionAuditLog): Promise<void>;
  listar(orgId: string, filtro?: PermissionAuditLogFilter): Promise<PermissionAuditLogPage>;
  contar(orgId: string, filtro?: PermissionAuditLogFilter): Promise<number>;
}


