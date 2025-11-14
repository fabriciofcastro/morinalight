"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthUser, getAuthHeadersWithTenant } from "@/lib/auth-client";

// Cache de permissões em memória
const permissionsCache = new Map<string, { permissions: string[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function fetchUserPermissions(userId: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/users/${userId}/permissions`, {
      headers: {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Erro ao buscar permissões, usando cache ou permissões padrão");
      return getDefaultPermissions();
    }

    const data = await response.json();
    const permissionKeys = data.permissions?.map((p: { permissionKey: string }) => p.permissionKey) || [];
    
    // Atualizar cache
    permissionsCache.set(userId, {
      permissions: permissionKeys,
      timestamp: Date.now(),
    });

    return permissionKeys;
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return getDefaultPermissions();
  }
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
  const [mounted, setMounted] = useState(false);
  const user = getAuthUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user || !permission) {
      setHasPermission(true); // Permitir por padrão
      return;
    }

    // Verificar cache primeiro
    const cached = permissionsCache.get(user.userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setHasPermission(cached.permissions.includes(permission));
      return;
    }

    // Buscar permissões da API
    fetchUserPermissions(user.userId).then((permissions) => {
      setHasPermission(permissions.includes(permission));
    });
  }, [user, permission, mounted]);

  // Verificação rápida via API para permissões críticas
  const checkPermission = useCallback(async (perm: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/users/${user.userId}/permissions/check?permission=${encodeURIComponent(perm)}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.hasPermission === true;
      }
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
    }

    return false;
  }, [user]);

  return hasPermission;
}

export function usePermissions(): string[] {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const user = getAuthUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) {
      setPermissions([]);
      return;
    }

    // Verificar cache primeiro
    const cached = permissionsCache.get(user.userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setPermissions(cached.permissions);
      return;
    }

    // Buscar permissões da API
    fetchUserPermissions(user.userId).then(setPermissions);
  }, [user, mounted]);

  return permissions;
}

