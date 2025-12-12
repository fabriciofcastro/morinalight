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
      ? data.effective.map((p: { permissionKey: string }) => p.permissionKey)
      : [];
    const denied = Array.isArray(data?.denied) ? data.denied : [];

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
    return;
  }
  permissionsCache.clear();
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
      return;
    }

    // Verificar cache primeiro
    const cached = permissionsCache.get(user.userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const next = cached.effective.includes(permission) && !cached.denied.includes(permission);
      queueMicrotask(() => setHasPermission(next));
      return;
    }

    // Buscar permissões da API
    fetchUserPermissions(user.userId).then(({ effective, denied }) => {
      setHasPermission(effective.includes(permission) && !denied.includes(permission));
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
