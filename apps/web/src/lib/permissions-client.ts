"use client";

import { getAuthHeadersWithTenant } from "./auth-client";

/**
 * Cliente para interagir com a API de permissões
 */
export class PermissionsClient {
  /**
   * Lista todas as permissões de um usuário
   */
  async listUserPermissions(userId: string): Promise<{
    permissions: Array<{
      userId: string;
      orgId: string;
      permissionId: string;
      granted: boolean;
      permissionKey: string;
      permissionName: string;
    }>;
    role: string | null;
    customPermissions: Array<{ permissionId: string; granted: boolean }>;
  }> {
    const response = await fetch(`/api/users/${userId}/permissions`, {
      headers: {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar permissões");
    }

    return response.json();
  }

  /**
   * Verifica se um usuário tem uma permissão específica
   */
  async checkPermission(
    userId: string,
    permission: string,
  ): Promise<{ hasPermission: boolean; reason?: string }> {
    const response = await fetch(
      `/api/users/${userId}/permissions/check?permission=${encodeURIComponent(permission)}`,
      {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Erro ao verificar permissão");
    }

    return response.json();
  }
}

export const permissionsClient = new PermissionsClient();


