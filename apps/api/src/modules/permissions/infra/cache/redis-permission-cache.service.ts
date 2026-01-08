/**
 * Redis Permission Cache Service Implementation
 * Cache persistente e distribuído usando Redis
 */

import { getRedisClient } from "../../../../infra/cache/redis.service";
import type {
  CachedEffectivePermissions,
  CachedPermissionResult,
  PermissionCacheService,
} from "../../domain/services/permission-cache.service";

const DEFAULT_TTL_SECONDS = 300; // 5 minutos
const KEY_PREFIX = "perm:";

export class RedisPermissionCacheService implements PermissionCacheService {
  private redis = getRedisClient();

  private getPermissionCheckKey(orgId: string, userId: string, permission: string): string {
    return `${KEY_PREFIX}check:${orgId}:${userId}:${permission}`;
  }

  private getEffectivePermissionsKey(orgId: string, userId: string): string {
    return `${KEY_PREFIX}eff:${orgId}:${userId}`;
  }

  private getUserKeysSet(userId: string): string {
    return `${KEY_PREFIX}user:${userId}:keys`;
  }

  private getOrgKeysSet(orgId: string): string {
    return `${KEY_PREFIX}org:${orgId}:keys`;
  }

  private getPermissionKeysSet(permissionId: string): string {
    return `${KEY_PREFIX}perm:${permissionId}:keys`;
  }

  private getEntityKeysSet(entityType: string, entityId: string): string {
    return `${KEY_PREFIX}entity:${entityType}:${entityId}:keys`;
  }

  private async registerKeys(
    key: string,
    orgId: string,
    userId: string,
    permission?: string,
    entityType?: string,
    entityId?: string,
  ) {
    const multi = this.redis.multi();
    multi.sadd(this.getUserKeysSet(userId), key);
    multi.sadd(this.getOrgKeysSet(orgId), key);
    if (permission) multi.sadd(this.getPermissionKeysSet(permission), key);
    if (entityType && entityId) multi.sadd(this.getEntityKeysSet(entityType, entityId), key);
    await multi.exec();
  }

  async getPermissionCheck(
    orgId: string,
    userId: string,
    permission: string,
  ): Promise<CachedPermissionResult | null> {
    try {
      const key = this.getPermissionCheckKey(orgId, userId, permission);
      const data = await this.redis.get(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return {
        ...parsed,
        cachedAt: new Date(parsed.cachedAt),
      };
    } catch (error) {
      console.error("Redis Cache Error (GetPermissionCheck):", error);
      return null;
    }
  }

  async setPermissionCheck(
    orgId: string,
    userId: string,
    permission: string,
    result: { hasPermission: boolean; reason?: string },
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    try {
      const key = this.getPermissionCheckKey(orgId, userId, permission);
      const data = JSON.stringify({
        ...result,
        cachedAt: new Date(),
      });

      await this.redis.set(key, data, "EX", ttlSeconds);
      await this.registerKeys(key, orgId, userId, permission);
    } catch (error) {
      console.error("Redis Cache Error (SetPermissionCheck):", error);
    }
  }

  async getEffectivePermissions(
    orgId: string,
    userId: string,
  ): Promise<CachedEffectivePermissions | null> {
    try {
      const key = this.getEffectivePermissionsKey(orgId, userId);
      const data = await this.redis.get(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return {
        ...parsed,
        cachedAt: new Date(parsed.cachedAt),
      };
    } catch (error) {
      console.error("Redis Cache Error (GetEffectivePermissions):", error);
      return null;
    }
  }

  async setEffectivePermissions(
    orgId: string,
    userId: string,
    permissions: Array<{ permissionKey: string; granted: boolean }>,
    denied: string[],
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    try {
      const key = this.getEffectivePermissionsKey(orgId, userId);
      const data = JSON.stringify({
        userId,
        orgId,
        permissions,
        denied,
        cachedAt: new Date(),
      });

      await this.redis.set(key, data, "EX", ttlSeconds);
      await this.registerKeys(key, orgId, userId);
    } catch (error) {
      console.error("Redis Cache Error (SetEffectivePermissions):", error);
    }
  }

  async invalidateUser(orgId: string, userId: string): Promise<void> {
    try {
      const setKey = this.getUserKeysSet(userId);
      const keys = await this.redis.smembers(setKey);
      if (keys.length > 0) {
        await this.redis.del(...keys, setKey);
      }
    } catch (error) {
      console.error("Redis Cache Error (InvalidateUser):", error);
    }
  }

  async invalidateOrganization(orgId: string): Promise<void> {
    try {
      const setKey = this.getOrgKeysSet(orgId);
      const keys = await this.redis.smembers(setKey);
      if (keys.length > 0) {
        await this.redis.del(...keys, setKey);
      }
    } catch (error) {
      console.error("Redis Cache Error (InvalidateOrganization):", error);
    }
  }

  async invalidatePermission(orgId: string, permissionId: string): Promise<void> {
    try {
      const setKey = this.getPermissionKeysSet(permissionId);
      const keys = await this.redis.smembers(setKey);
      if (keys.length > 0) {
        await this.redis.del(...keys, setKey);
      }
    } catch (error) {
      console.error("Redis Cache Error (InvalidatePermission):", error);
    }
  }

  async invalidateEntity(orgId: string, entityType: string, entityId: string): Promise<void> {
    try {
      const setKey = this.getEntityKeysSet(entityType, entityId);
      const keys = await this.redis.smembers(setKey);
      if (keys.length > 0) {
        await this.redis.del(...keys, setKey);
      }
    } catch (error) {
      console.error("Redis Cache Error (InvalidateEntity):", error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${KEY_PREFIX}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error("Redis Cache Error (Clear):", error);
    }
  }
}
