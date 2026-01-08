export type AuditoriaSupplierRecord = {
  id: string;
  supplierId: string;
  orgId: string;
  acao: string;
  campo?: string | null;
  estadoAnterior?: unknown | null;
  estadoNovo?: unknown | null;
  actorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  justificativa?: string | null;
  metadata?: unknown | null;
  createdAt: Date;
};

export type CreateAuditoriaSupplierInput = {
  supplierId: string;
  orgId: string;
  acao: string;
  campo?: string | null;
  estadoAnterior?: unknown | null;
  estadoNovo?: unknown | null;
  actorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  justificativa?: string | null;
  metadata?: unknown | null;
};

export type AuditoriaSupplierFilter = {
  supplierId?: string;
  orgId?: string;
  actorId?: string;
  acao?: string;
  dataInicio?: Date;
  dataFim?: Date;
  limite?: number;
  cursor?: string;
};

export type AuditoriaSupplierPage = {
  itens: AuditoriaSupplierRecord[];
  proximoCursor?: string;
};

export interface AuditoriaSupplierRepository {
  create(input: CreateAuditoriaSupplierInput): Promise<AuditoriaSupplierRecord>;
  findBySupplierId(
    supplierId: string,
    filtro?: AuditoriaSupplierFilter,
  ): Promise<AuditoriaSupplierPage>;
  findByOrgId(orgId: string, filtro?: AuditoriaSupplierFilter): Promise<AuditoriaSupplierPage>;
}
