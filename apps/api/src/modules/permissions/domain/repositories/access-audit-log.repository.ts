/**
 * Access Audit Log Repository Interface
 * Registra verificações de acesso (quando o sistema verifica se um usuário tem uma permissão)
 */

export type AccessAuditLog = {
  id: string;
  orgId: string;
  userId: string;
  permission: string;
  granted: boolean;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  resource?: string | null;
  endpoint?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
};

export type AccessAuditLogFilter = {
  orgId: string;
  userId?: string;
  permission?: string;
  granted?: boolean;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
  cursor?: string;
  limit?: number;
};

export type AccessAuditLogPage = {
  itens: AccessAuditLog[];
  nextCursor?: string | null;
  hasMore: boolean;
};

export interface AccessAuditLogRepository {
  registrar(log: Omit<AccessAuditLog, "id" | "createdAt">): Promise<AccessAuditLog>;
  listar(filtro: AccessAuditLogFilter): Promise<AccessAuditLogPage>;
  contarAcessosNegados(orgId: string, userId: string, startDate: Date, endDate: Date): Promise<number>;
  contarAcessosPorPermissao(orgId: string, permission: string, startDate: Date, endDate: Date): Promise<number>;
  listarIpsSuspeitos(orgId: string, threshold: number, startDate: Date): Promise<Array<{ ipAddress: string; count: number }>>;
}









