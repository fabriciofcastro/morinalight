export type OrganizationalStructureAuditLogFilter = {
  entityType?: "unit" | "department" | "team" | "branch" | "sector" | "position" | "subdepartment";
  entityId?: string;
  action?: string;
  cursor?: string;
  limite?: number;
};

export type OrganizationalStructureAuditLogPage = {
  itens: OrganizationalStructureAuditLog[];
  proximoCursor?: string;
};

export type OrganizationalStructureAuditLog = {
  id: string;
  orgId: string;
  entityType: "unit" | "department" | "team" | "branch" | "sector" | "position" | "subdepartment";
  entityId: string;
  action: string;
  actorId: string;
  payload: Record<string, unknown> | null;
  createdAt: Date;
};

export interface OrganizationalStructureAuditLogRepository {
  registrar(log: OrganizationalStructureAuditLog): Promise<void>;
  listar(
    orgId: string,
    filtro?: OrganizationalStructureAuditLogFilter,
  ): Promise<OrganizationalStructureAuditLogPage>;
}
