"use client";

/**
 * Sistema de fila offline usando IndexedDB para armazenar operações pendentes
 */

export type OfflineOperation = {
  id: string;
  type: "create" | "update" | "delete";
  resource: string; // Ex: "organizations", "users", "products", "suppliers"
  resourceId?: string; // ID do recurso (para update/delete)
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  status: "pending" | "syncing" | "synced" | "failed";
};

const DB_NAME = "morina-offline-queue";
const DB_VERSION = 1;
const STORE_NAME = "operations";

let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("resource", "resource", { unique: false });
      }
    };
  });
}

/**
 * Adiciona uma operação à fila offline
 */
export async function enqueueOperation(
  operation: Omit<OfflineOperation, "id" | "timestamp" | "retries" | "status">,
): Promise<string> {
  const db = await getDB();
  const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const fullOperation: OfflineOperation = {
    ...operation,
    id,
    timestamp: Date.now(),
    retries: 0,
    status: "pending",
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(fullOperation);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtém todas as operações pendentes
 */
export async function getPendingOperations(): Promise<OfflineOperation[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("status");
    const request = index.getAll("pending");

    request.onsuccess = () => {
      const operations = request.result as OfflineOperation[];
      // Ordenar por timestamp (mais antigas primeiro)
      operations.sort((a, b) => a.timestamp - b.timestamp);
      resolve(operations);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Atualiza o status de uma operação
 */
export async function updateOperationStatus(
  id: string,
  status: OfflineOperation["status"],
  incrementRetries = false,
): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const operation = getRequest.result as OfflineOperation;
      if (!operation) {
        reject(new Error("Operation not found"));
        return;
      }

      operation.status = status;
      if (incrementRetries) {
        operation.retries += 1;
      }

      const putRequest = store.put(operation);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Remove uma operação da fila (após sincronização bem-sucedida)
 */
export async function removeOperation(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Limpa operações antigas já sincronizadas (mais de 7 dias)
 */
export async function cleanupOldOperations(): Promise<void> {
  const db = await getDB();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("status");
    const request = index.getAll("synced");

    request.onsuccess = () => {
      const operations = request.result as OfflineOperation[];
      const toDelete = operations.filter((op) => op.timestamp < sevenDaysAgo);

      if (toDelete.length === 0) {
        resolve();
        return;
      }

      let completed = 0;
      let errors = 0;

      toDelete.forEach((op) => {
        const deleteRequest = store.delete(op.id);
        deleteRequest.onsuccess = () => {
          completed++;
          if (completed + errors === toDelete.length) {
            if (errors === 0) {
              resolve();
            } else {
              reject(new Error("Some deletions failed"));
            }
          }
        };
        deleteRequest.onerror = () => {
          errors++;
          if (completed + errors === toDelete.length) {
            reject(new Error("Some deletions failed"));
          }
        };
      });
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtém estatísticas da fila
 */
export async function getQueueStats(): Promise<{
  pending: number;
  syncing: number;
  synced: number;
  failed: number;
}> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("status");

    const stats = { pending: 0, syncing: 0, synced: 0, failed: 0 };
    let completed = 0;

    ["pending", "syncing", "synced", "failed"].forEach((status) => {
      const request = index.count(status);
      request.onsuccess = () => {
        stats[status as keyof typeof stats] = request.result;
        completed++;
        if (completed === 4) {
          resolve(stats);
        }
      };
      request.onerror = () => {
        completed++;
        if (completed === 4) {
          reject(new Error("Failed to get stats"));
        }
      };
    });
  });
}
