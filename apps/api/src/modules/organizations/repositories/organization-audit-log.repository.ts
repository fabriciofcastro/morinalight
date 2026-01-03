export type OrganizationAuditLogRecord = {
  id: string;
  orgId: string;
  action: string;
  actorId: string;
  targetId?: string | null;
  payload?: Record<string, unknown> | null;
  createdAt: Date;
};

export type OrganizationAuditLogFilter = {
  cursor?: string;
  limite?: number;
  inicio?: Date;
  fim?: Date;
  acao?: string;
};

export type OrganizationAuditLogPage = {
  itens: OrganizationAuditLogRecord[];
  proximoCursor?: string;
};

export interface OrganizationAuditLogRepository {
  registrar(entry: {
    orgId: string;
    action: string;
    actorId: string;
    targetId?: string | null;
    payload?: Record<string, unknown> | null;
    createdAt?: Date;
  }): Promise<void>;

  listar(orgId: string, filtro?: OrganizationAuditLogFilter): Promise<OrganizationAuditLogPage>;
}
