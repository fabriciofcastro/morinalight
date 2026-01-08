"use client";

import type { ObjectAccessEntry, SecurityPolicy } from "@morina/shared-kernel";
import { getAuthHeadersWithTenant } from "../lib/auth-client";

// Cache de permissões em memória
export type PermissionGrant = {
  permissionKey: string;
  granted: boolean;
  source?: string;
  sourceEntityId?: string;
};

type CachedPermissions = {
  effective: PermissionGrant[];
  denied: string[];
  role: string | null;
  policies?: SecurityPolicy[];
  aclEntries?: ObjectAccessEntry[];
  context?: {
    departmentId?: string;
    sectorId?: string;
    positionId?: string;
    attributes?: Record<string, any>;
    mfaVerified?: boolean;
  };
  timestamp: number;
};

const permissionsCache = new Map<string, CachedPermissions>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function fetchUserPermissions(
  userId: string,
): Promise<Omit<CachedPermissions, 'timestamp'>> {
  try {
    const response = await fetch(`/api/users/${userId}/permissions/effective`, {
      headers: {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Erro ao buscar permissões, usando cache ou permissões padrão");
      return { effective: [], denied: [], role: null };
    }

    const data = await response.json();

    // Garantir formato correto
    const effective: PermissionGrant[] = Array.isArray(data?.effective) ? data.effective : [];
    const denied: string[] = Array.isArray(data?.denied) ? data.denied : [];
    const role: string | null = data?.role || null;
    const context = data?.context;
    const policies: SecurityPolicy[] = data?.policies || [];
    const aclEntries: ObjectAccessEntry[] = data?.aclEntries || [];

    // Atualizar cache
    permissionsCache.set(userId, {
      effective,
      denied,
      role,
      context,
      policies,
      aclEntries,
      timestamp: Date.now(),
    });

    return { effective, denied, role, context, policies, aclEntries };
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return { effective: [], denied: [], role: null, context: undefined };
  }
}

export function invalidatePermissionsCache(userId?: string) {
  if (userId) {
    permissionsCache.delete(userId);
    console.log("🗑️ Cache de permissões invalidado para userId:", userId);
    return;
  }
  permissionsCache.clear();
  console.log("🗑️ Cache de permissões completamente limpo");
}

export async function refreshPermissionsCache(userId: string) {
  const result = await fetchUserPermissions(userId);
  return result;
}

export function getPermissionsCacheSnapshot() {
  return Array.from(permissionsCache.entries()).map(([userId, value]) => ({
    userId,
    effectiveCount: value.effective.length,
    deniedCount: value.denied.length,
    timestamp: value.timestamp,
  }));
}

function getDefaultPermissions(): string[] {
  // Permissões padrão para desenvolvimento/fallback
  return [
    "dashboard:view",
    "products:view",
    "products:create",
    "products:edit",
    "catalog:view",
    "clients:view",
    "clients:create",
    "clients:edit",
    "representatives:view",
    "representatives:create",
    "commissions:view",
    "suppliers:view",
    "suppliers:create",
    "sales:view",
    "reports:view",
    "settings:view",
    "settings:company:view",
    "settings:team:view",
    "settings:permissions:view",
  ];
}




