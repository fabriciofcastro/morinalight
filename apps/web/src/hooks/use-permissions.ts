"use client";

import { useEffect, useState } from "react";
import { getAuthHeadersWithTenant, getAuthUser } from "../lib/auth-client";

// Cache de permissões em memória
const permissionsCache = new Map<
  string,
  { effective: string[]; denied: string[]; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function fetchUserPermissions(
  userId: string,
): Promise<{ effective: string[]; denied: string[] }> {
  try {
    const response = await fetch(`/api/users/${userId}/permissions/effective`, {
      headers: {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Erro ao buscar permissões, usando cache ou permissões padrão");
      return { effective: getDefaultPermissions(), denied: [] };
    }

    const data = await response.json();
    const effective = Array.isArray(data?.effective)
      ? data.effective.map((p: { permissionKey: string } | string) => 
          typeof p === "string" ? p : p.permissionKey
        )
      : [];
    const denied = Array.isArray(data?.denied) ? data.denied : [];
    
    // Debug: verificar se suppliers:view está nas permissões retornadas
    if (effective.length > 0) {
      console.log("📋 Permissões recebidas da API:", {
        total: effective.length,
        hasSuppliersView: effective.includes("suppliers:view"),
        hasSuppliersCreate: effective.includes("suppliers:create"),
        sample: effective.slice(0, 5),
      });
    }

    // Atualizar cache
    permissionsCache.set(userId, {
      effective,
      denied,
      timestamp: Date.now(),
    });

    return { effective, denied };
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return { effective: getDefaultPermissions(), denied: [] };
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

export function useHasPermission(permission: string): boolean {
  const [hasPermission, setHasPermission] = useState(true); // Default true para não bloquear UI
  const [ready, setReady] = useState(false);
  const user = getAuthUser();

  useEffect(() => {
    queueMicrotask(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !user || !permission) {
      // Se não tem permissão definida, retorna true (para itens sem permissão)
      if (!permission) {
        setHasPermission(true);
      }
      return;
    }

    // Verificar cache primeiro
    const cached = permissionsCache.get(user.userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const next = cached.effective.includes(permission) && !cached.denied.includes(permission);
      queueMicrotask(() => setHasPermission(next));
      
      // Debug para suppliers:view
      if (permission === "suppliers:view") {
        console.log("🔍 suppliers:view (cache):", {
          cached: cached.effective.includes(permission),
          denied: cached.denied.includes(permission),
          hasPermission: next,
          effectiveCount: cached.effective.length,
        });
      }
      return;
    }

    // Buscar permissões da API
    fetchUserPermissions(user.userId).then(({ effective, denied }) => {
      const hasPerm = effective.includes(permission) && !denied.includes(permission);
      // Debug para suppliers:view
      if (permission === "suppliers:view") {
        console.log("🔍 suppliers:view (API):", {
          effective,
          denied,
          hasPermission: hasPerm,
          includes: effective.includes(permission),
          denied: denied.includes(permission),
          effectiveCount: effective.length,
        });
      }
      setHasPermission(hasPerm);
    }).catch((error) => {
      console.error("Erro ao buscar permissões:", error);
      // Em caso de erro, usar permissões padrão
      const defaultPerms = getDefaultPermissions();
      const hasPerm = defaultPerms.includes(permission);
      setHasPermission(hasPerm);
    });
  }, [user, permission, ready]);

  return hasPermission;
}

export function usePermissions(): string[] {
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
      const next = cached.effective;
      queueMicrotask(() => setPermissions(next));
      return;
    }

    // Buscar permissões da API
    fetchUserPermissions(user.userId).then(({ effective }) => setPermissions(effective));
  }, [user, ready]);

  return permissions;
}
