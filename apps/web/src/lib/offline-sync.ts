"use client";

import { getAuthHeaders } from "@/lib/auth-client";
import {
    cleanupOldOperations,
    getPendingOperations,
    type OfflineOperation,
    removeOperation,
    updateOperationStatus,
} from "./offline-queue";

export type SyncProgress = {
  total: number;
  completed: number;
  failed: number;
  current?: OfflineOperation;
};

export type SyncCallbacks = {
  onProgress?: (progress: SyncProgress) => void;
  onComplete?: (stats: { synced: number; failed: number }) => void;
  onError?: (error: Error) => void;
};

/**
 * Sincroniza todas as operações pendentes com o backend
 */
export async function syncOfflineOperations(callbacks?: SyncCallbacks): Promise<void> {
  try {
    const operations = await getPendingOperations();

    if (operations.length === 0) {
      callbacks?.onComplete?.({ synced: 0, failed: 0 });
      return;
    }

    const progress: SyncProgress = {
      total: operations.length,
      completed: 0,
      failed: 0,
    };

    callbacks?.onProgress?.(progress);

    for (const operation of operations) {
      progress.current = operation;

      try {
        // Marcar como sincronizando
        await updateOperationStatus(operation.id, "syncing");

        // Executar a operação no backend
        const success = await executeOperation(operation);

        if (success) {
          // Remover da fila após sucesso
          await removeOperation(operation.id);
          progress.completed++;
        } else {
          // Incrementar tentativas e marcar como falha se exceder limite
          await updateOperationStatus(
            operation.id,
            operation.retries >= 3 ? "failed" : "pending",
            true,
          );
          progress.failed++;
        }
      } catch (error) {
        console.error(`Erro ao sincronizar operação ${operation.id}:`, error);
        await updateOperationStatus(
          operation.id,
          operation.retries >= 3 ? "failed" : "pending",
          true,
        );
        progress.failed++;
      }

      callbacks?.onProgress?.(progress);
    }

    // Limpar operações antigas
    await cleanupOldOperations();

    callbacks?.onComplete?.({
      synced: progress.completed,
      failed: progress.failed,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    callbacks?.onError?.(err);
    throw err;
  }
}

/**
 * Executa uma operação no backend via BFF
 */
async function executeOperation(operation: OfflineOperation): Promise<boolean> {
  const { type, resource, resourceId, data } = operation;

  try {
    // Mapear recursos para rotas BFF
    const bffResourceMap: Record<string, string> = {
      organizations: "organizations",
      users: "users",
      products: "catalogo/produtos", // "products" mapeia para "catalogo/produtos" na rota BFF
      suppliers: "suppliers",
    };

    const bffResource = bffResourceMap[resource] || resource;
    let url = `/api/${bffResource}`;
    let method = "POST";
    let body: string | undefined = JSON.stringify(data);

    if (type === "update" && resourceId) {
      url = `/api/${bffResource}/${resourceId}`;
      method = "PUT";
    } else if (type === "delete" && resourceId) {
      url = `/api/${bffResource}/${resourceId}`;
      method = "DELETE";
      body = undefined;
    }

    const response = await fetch(url, {
      method,
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body,
    });

    return response.ok;
  } catch (error) {
    console.error(`Erro ao executar operação ${operation.id}:`, error);
    return false;
  }
}

/**
 * Hook para sincronização automática quando a conexão é restabelecida
 */
export function createAutoSync() {
  let isSyncing = false;
  let syncInterval: NodeJS.Timeout | null = null;

  const start = (intervalMs = 30000) => {
    if (syncInterval) return;

    // Sincronizar imediatamente
    void sync();

    // Sincronizar periodicamente
    syncInterval = setInterval(() => {
      if (navigator.onLine && !isSyncing) {
        void sync();
      }
    }, intervalMs);
  };

  const stop = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  };

  const sync = async () => {
    if (isSyncing || !navigator.onLine) return;

    isSyncing = true;
    try {
      await syncOfflineOperations();
    } catch (error) {
      console.error("Erro na sincronização automática:", error);
    } finally {
      isSyncing = false;
    }
  };

  return { start, stop, sync };
}
