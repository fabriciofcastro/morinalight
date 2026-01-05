"use client";

import { useEffect, useState } from "react";
import { getAuthHeadersWithTenant, getAuthUser } from "../lib/auth-client";
import type { SecurityPolicy, ObjectAccessEntry } from "@morina/shared-kernel";

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

import { useAbility } from "../lib/auth/CaslContext";
import { parsePermissionKey } from "../lib/auth/ability";

/**
 * @deprecated Use useAbility() from @/lib/auth/CaslContext instead.
 * Example: const ability = useAbility(); const canView = ability.can('read', 'Product');
 */
export function useHasPermission(permission: string): boolean {
  const ability = useAbility();

  // Compatibilidade: se não passar permissão, retorna true (comportamento antigo)
  if (!permission) return true;

  const { action, subject } = parsePermissionKey(permission);

  if (!action || !subject) {
    // Se não conseguir fazer o parse (ex: permissão customizada antiga), 
    // retorna false por segurança
    return false;
  }

  return ability.can(action, subject);
}

/**
 * @deprecated This hook returns raw strings. Use useAbility() for robust checks.
 */
export function usePermissions(): string[] {
  // Mantemos a implementação antiga por enquanto para não quebrar quem lista permissões,
  // mas o ideal é migrar para usar o Ability.
  // Como o usePermissions retorna array de strings, não tem como mapear 1:1 do ability (que é um objeto de regras).
  // Vamos manter a lógica existente de fetch/cache mas marcar como deprecated.

  const [permissions, setPermissions] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const user = getAuthUser();

  useEffect(() => {
    queueMicrotask(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !user) {
      return;
    }

    // Verificar cache primeiro
    const cached = permissionsCache.get(user.userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Map back to strings for backward compatibility
      const next = cached.effective.filter(p => p.granted).map(p => p.permissionKey);
      queueMicrotask(() => setPermissions(next));
      return;
    }

    // Buscar permissões da API
    fetchUserPermissions(user.userId).then(({ effective }) => {
      const next = effective.filter(p => p.granted).map(p => p.permissionKey);
      setPermissions(next);
    });
  }, [user, ready]);

  return permissions;
}
