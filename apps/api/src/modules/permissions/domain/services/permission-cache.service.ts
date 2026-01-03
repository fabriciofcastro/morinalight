/**
 * Permission Cache Service
 * Cache inteligente de permissões com invalidação automática
 */

export type CachedPermissionResult = {
  hasPermission: boolean;
  reason?: string;
  cachedAt: Date;
};

export type CachedEffectivePermissions = {
  userId: string;
  orgId: string;
  permissions: Array<{ permissionKey: string; granted: boolean }>;
  denied: string[];
  cachedAt: Date;
};

export interface PermissionCacheService {
  /**
   * Obter resultado de verificação de permissão do cache
   */
  getPermissionCheck(
    orgId: string,
    userId: string,
    permission: string,
  ): Promise<CachedPermissionResult | null>;

  /**
   * Armazenar resultado de verificação de permissão no cache
   */
  setPermissionCheck(
    orgId: string,
    userId: string,
    permission: string,
    result: { hasPermission: boolean; reason?: string },
    ttlSeconds?: number,
  ): Promise<void>;

  /**
   * Obter permissões efetivas do cache
   */
  getEffectivePermissions(
    orgId: string,
    userId: string,
  ): Promise<CachedEffectivePermissions | null>;

  /**
   * Armazenar permissões efetivas no cache
   */
  setEffectivePermissions(
    orgId: string,
    userId: string,
    permissions: Array<{ permissionKey: string; granted: boolean }>,
    denied: string[],
    ttlSeconds?: number,
  ): Promise<void>;

  /**
   * Invalidar cache de um usuário específico
   */
  invalidateUser(orgId: string, userId: string): Promise<void>;

  /**
   * Invalidar cache de uma organização
   */
  invalidateOrganization(orgId: string): Promise<void>;

  /**
   * Invalidar cache relacionado a uma permissão específica
   */
  invalidatePermission(orgId: string, permissionId: string): Promise<void>;

  /**
   * Invalidar cache relacionado a uma entidade (department, sector, position)
   */
  invalidateEntity(orgId: string, entityType: string, entityId: string): Promise<void>;

  /**
   * Limpar todo o cache
   */
  clear(): Promise<void>;
}









