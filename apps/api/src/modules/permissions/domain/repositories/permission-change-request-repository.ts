export type PermissionChangeRequest = {
  id: string;
  orgId: string;
  entityType: "position" | "sector" | "department" | "user";
  entityId: string;
  permissionId: string;
  granted: boolean | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  requestedBy: string;
  decidedBy: string | null;
  decidedAt: Date | null;
  decisionReason: string | null;
  slaDueAt: Date | null;
  slaNotifiedAt: Date | null;
  slaBreachedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PermissionChangeRequestFilter = {
  status?: "pending" | "approved" | "rejected" | "cancelled";
  entityType?: "position" | "sector" | "department" | "user";
  entityId?: string;
  permissionId?: string;
  requestedBy?: string;
  cursor?: string;
  limite?: number;
};

export type PermissionChangeRequestPage = {
  itens: PermissionChangeRequest[];
  proximoCursor?: string;
};

export interface PermissionChangeRequestRepository {
  criar(req: PermissionChangeRequest): Promise<void>;
  encontrarPorId(orgId: string, id: string): Promise<PermissionChangeRequest | null>;
  listar(
    orgId: string,
    filtro?: PermissionChangeRequestFilter,
  ): Promise<PermissionChangeRequestPage>;
  salvar(req: PermissionChangeRequest): Promise<void>;
}
