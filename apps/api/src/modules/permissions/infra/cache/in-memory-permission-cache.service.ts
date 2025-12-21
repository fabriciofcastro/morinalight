/**
 * In-Memory Permission Cache Service Implementation
 * Cache em memória com TTL e invalidação automática
 */

import type {
  CachedEffectivePermissions,
  CachedPermissionResult,
  PermissionCacheService,
} from "../../domain/services/permission-cache.service";

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const DEFAULT_TTL_SECONDS = 300; // 5 minutos
const MAX_CACHE_SIZE = 10000; // Máximo de 10k entradas

export class InMemoryPermissionCacheService implements PermissionCacheService {
  private permissionCheckCache = new Map<string, CacheEntry<CachedPermissionResult>>();
  private effectivePermissionsCache = new Map<string, CacheEntry<CachedEffectivePermissions>>();
  private userKeys = new Map<string, Set<string>>(); // userId -> Set<keys>
  private orgKeys = new Map<string, Set<string>>(); // orgId -> Set<keys>
  private permissionKeys = new Map<string, Set<string>>(); // permissionId -> Set<keys>
  private entityKeys = new Map<string, Set<string>>(); // entityType:entityId -> Set<keys>

  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Limpeza periódica de entradas expiradas
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // A cada 1 minuto
  }

  private getPermissionCheckKey(orgId: string, userId: string, permission: string): string {
    return `permission:check:${orgId}:${userId}:${permission}`;
  }

  private getEffectivePermissionsKey(orgId: string, userId: string): string {
    return `permission:effective:${orgId}:${userId}`;
  }

  private registerKey(key: string, userId: string, orgId: string, permissionId?: string, entityKey?: string) {
    // Registrar por usuário
    if (!this.userKeys.has(userId)) {
      this.userKeys.set(userId, new Set());
    }
    this.userKeys.get(userId)!.add(key);

    // Registrar por organização
    if (!this.orgKeys.has(orgId)) {
      this.orgKeys.set(orgId, new Set());
    }
    this.orgKeys.get(orgId)!.add(key);

    // Registrar por permissão
    if (permissionId) {
      if (!this.permissionKeys.has(permissionId)) {
        this.permissionKeys.set(permissionId, new Set());
      }
      this.permissionKeys.get(permissionId)!.add(key);
    }

    // Registrar por entidade
    if (entityKey) {
      if (!this.entityKeys.has(entityKey)) {
        this.entityKeys.set(entityKey, new Set());
      }
      this.entityKeys.get(entityKey)!.add(key);
    }
  }

  private cleanup() {
    const now = Date.now();

    // Limpar permission check cache
    for (const [key, entry] of this.permissionCheckCache.entries()) {
      if (entry.expiresAt < now) {
        this.permissionCheckCache.delete(key);
      }
    }

    // Limpar effective permissions cache
    for (const [key, entry] of this.effectivePermissionsCache.entries()) {
      if (entry.expiresAt < now) {
        this.effectivePermissionsCache.delete(key);
      }
    }

    // Limitar tamanho do cache (LRU simples)
    if (this.permissionCheckCache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(this.permissionCheckCache.entries());
      entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
      const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
      for (const [key] of toRemove) {
        this.permissionCheckCache.delete(key);
      }
    }

    if (this.effectivePermissionsCache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(this.effectivePermissionsCache.entries());
      entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
      const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
      for (const [key] of toRemove) {
        this.effectivePermissionsCache.delete(key);
      }
    }
  }

  async getPermissionCheck(
    orgId: string,
    userId: string,
    permission: string,
  ): Promise<CachedPermissionResult | null> {
    const key = this.getPermissionCheckKey(orgId, userId, permission);
    const entry = this.permissionCheckCache.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.permissionCheckCache.delete(key);
      return null;
    }

    return entry.data;
  }

  async setPermissionCheck(
    orgId: string,
    userId: string,
    permission: string,
    result: { hasPermission: boolean; reason?: string },
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    const key = this.getPermissionCheckKey(orgId, userId, permission);
    const expiresAt = Date.now() + ttlSeconds * 1000;

    this.permissionCheckCache.set(key, {
      data: {
        ...result,
        cachedAt: new Date(),
      },
      expiresAt,
    });

    this.registerKey(key, userId, orgId, permission);
  }

  async getEffectivePermissions(
    orgId: string,
    userId: string,
  ): Promise<CachedEffectivePermissions | null> {
    const key = this.getEffectivePermissionsKey(orgId, userId);
    const entry = this.effectivePermissionsCache.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.effectivePermissionsCache.delete(key);
      return null;
    }

    return entry.data;
  }

  async setEffectivePermissions(
    orgId: string,
    userId: string,
    permissions: Array<{ permissionKey: string; granted: boolean }>,
    denied: string[],
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    const key = this.getEffectivePermissionsKey(orgId, userId);
    const expiresAt = Date.now() + ttlSeconds * 1000;

    this.effectivePermissionsCache.set(key, {
      data: {
        userId,
        orgId,
        permissions,
        denied,
        cachedAt: new Date(),
      },
      expiresAt,
    });

    this.registerKey(key, userId, orgId);
  }

  async invalidateUser(orgId: string, userId: string): Promise<void> {
    const keys = this.userKeys.get(userId);
    if (!keys) {
      return;
    }

    for (const key of keys) {
      this.permissionCheckCache.delete(key);
      this.effectivePermissionsCache.delete(key);
    }

    this.userKeys.delete(userId);
  }

  async invalidateOrganization(orgId: string): Promise<void> {
    const keys = this.orgKeys.get(orgId);
    if (!keys) {
      return;
    }

    for (const key of keys) {
      this.permissionCheckCache.delete(key);
      this.effectivePermissionsCache.delete(key);
    }

    this.orgKeys.delete(orgId);
  }

  async invalidatePermission(orgId: string, permissionId: string): Promise<void> {
    const keys = this.permissionKeys.get(permissionId);
    if (!keys) {
      return;
    }

    for (const key of keys) {
      this.permissionCheckCache.delete(key);
      this.effectivePermissionsCache.delete(key);
    }

    this.permissionKeys.delete(permissionId);
  }

  async invalidateEntity(orgId: string, entityType: string, entityId: string): Promise<void> {
    const entityKey = `${entityType}:${entityId}`;
    const keys = this.entityKeys.get(entityKey);
    if (!keys) {
      return;
    }

    for (const key of keys) {
      this.permissionCheckCache.delete(key);
      this.effectivePermissionsCache.delete(key);
    }

    this.entityKeys.delete(entityKey);
  }

  async clear(): Promise<void> {
    this.permissionCheckCache.clear();
    this.effectivePermissionsCache.clear();
    this.userKeys.clear();
    this.orgKeys.clear();
    this.permissionKeys.clear();
    this.entityKeys.clear();
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}



