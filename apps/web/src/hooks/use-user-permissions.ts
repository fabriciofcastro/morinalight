"use client";

import { useState, useCallback } from "react";
import { getAuthHeadersWithTenant } from "@/lib/api/base";

export interface UserPermission {
  permissionId: string;
  permissionCode: string;
  permissionName: string;
  module: string;
  granted: boolean;
  source: "direct" | "position" | "sector" | "department" | "role";
  sourceId?: string;
  sourceName?: string;
}

export interface EffectivePermission {
  permissionId: string;
  permissionCode: string;
  permissionName: string;
  module: string;
  granted: boolean;
  sources: Array<{
    type: "direct" | "position" | "sector" | "department" | "role";
    id: string;
    name: string;
  }>;
}

export interface AssignPermissionRequest {
  permissionId: string;
  granted: boolean;
}

export function useUserPermissions(userId: string) {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${userId}/permissions`, {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao carregar permissões" }));
        throw new Error(errorData.message || "Não foi possível carregar as permissões.");
      }

      const data = (await response.json()) as { permissions: UserPermission[] };
      setPermissions(data.permissions ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao carregar permissões.";
      setError(errorMessage);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchEffectivePermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${userId}/permissions/effective`, {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao carregar permissões efetivas" }));
        throw new Error(errorData.message || "Não foi possível carregar as permissões efetivas.");
      }

      const data = (await response.json()) as { permissions: EffectivePermission[] };
      setEffectivePermissions(data.permissions ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao carregar permissões efetivas.";
      setError(errorMessage);
      setEffectivePermissions([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const assignPermission = useCallback(async (request: AssignPermissionRequest): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao atribuir permissão" }));
        throw new Error(errorData.message || "Não foi possível atribuir a permissão.");
      }

      // Refresh permissions after assignment
      await fetchPermissions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao atribuir permissão.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchPermissions]);

  const removePermission = useCallback(async (permissionId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${userId}/permissions/${permissionId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao remover permissão" }));
        throw new Error(errorData.message || "Não foi possível remover a permissão.");
      }

      // Refresh permissions after removal
      await fetchPermissions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao remover permissão.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchPermissions]);

  return {
    permissions,
    effectivePermissions,
    loading,
    error,
    fetchPermissions,
    fetchEffectivePermissions,
    assignPermission,
    removePermission,
  };
}







