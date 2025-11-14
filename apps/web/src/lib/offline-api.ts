"use client";

import { getAuthHeaders } from "@/lib/auth-client";
import { enqueueOperation } from "./offline-queue";

/**
 * Wrapper para chamadas de API que suporta modo offline
 */
export async function offlineFetch(
  resource: string,
  options: {
    method?: string;
    body?: unknown;
    resourceId?: string;
    skipOfflineQueue?: boolean;
  } = {}
): Promise<Response> {
  const { method = "GET", body, resourceId, skipOfflineQueue = false } = options;

  // Verificar se está online
  const isOnline = navigator.onLine;

  // Se estiver offline e não for GET, enfileirar a operação
  if (!isOnline && !skipOfflineQueue && method !== "GET") {
    const operationType =
      method === "POST" ? "create" : method === "PUT" ? "update" : "delete";

    await enqueueOperation({
      type: operationType,
      resource,
      resourceId,
      data: body as Record<string, unknown>,
    });

    // Retornar uma resposta simulada de sucesso
    return new Response(
      JSON.stringify({
        message: "Operação enfileirada para sincronização offline",
        queued: true,
      }),
      {
        status: 202, // Accepted
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Se estiver online, fazer a requisição via BFF
  try {
    // Mapear recursos para rotas BFF
    const bffResourceMap: Record<string, string> = {
      organizations: "organizations",
      users: "users",
      products: "catalogo/produtos",
      suppliers: "suppliers",
    };

    const bffResource = bffResourceMap[resource] || resource;
    let url = `/api/${bffResource}`;
    if (resourceId && (method === "PUT" || method === "DELETE")) {
      url = `/api/${bffResource}/${resourceId}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return response;
  } catch (error) {
    // Se falhar e não for GET, tentar enfileirar
    if (!skipOfflineQueue && method !== "GET") {
      const operationType =
        method === "POST" ? "create" : method === "PUT" ? "update" : "delete";

      await enqueueOperation({
        type: operationType,
        resource,
        resourceId,
        data: body as Record<string, unknown>,
      });

      return new Response(
        JSON.stringify({
          message: "Operação enfileirada após falha na requisição",
          queued: true,
        }),
        {
          status: 202,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    throw error;
  }
}

/**
 * Helpers específicos para cada recurso
 */
export const offlineApi = {
  organizations: {
    list: () => offlineFetch("organizations"),
    create: (data: unknown) =>
      offlineFetch("organizations", { method: "POST", body: data }),
    update: (id: string, data: unknown) =>
      offlineFetch("organizations", { method: "PUT", body: data, resourceId: id }),
    delete: (id: string) =>
      offlineFetch("organizations", { method: "DELETE", resourceId: id }),
  },
  users: {
    list: () => offlineFetch("users"),
    create: (data: unknown) =>
      offlineFetch("users", { method: "POST", body: data }),
    update: (id: string, data: unknown) =>
      offlineFetch("users", { method: "PUT", body: data, resourceId: id }),
    delete: (id: string) =>
      offlineFetch("users", { method: "DELETE", resourceId: id }),
  },
  products: {
    list: () => offlineFetch("products"),
    create: (data: unknown) =>
      offlineFetch("products", { method: "POST", body: data }),
    update: (id: string, data: unknown) =>
      offlineFetch("products", { method: "PUT", body: data, resourceId: id }),
    delete: (id: string) =>
      offlineFetch("products", { method: "DELETE", resourceId: id }),
  },
  suppliers: {
    list: () => offlineFetch("suppliers"),
    create: (data: unknown) =>
      offlineFetch("suppliers", { method: "POST", body: data }),
    update: (id: string, data: unknown) =>
      offlineFetch("suppliers", { method: "PUT", body: data, resourceId: id }),
    delete: (id: string) =>
      offlineFetch("suppliers", { method: "DELETE", resourceId: id }),
  },
};

