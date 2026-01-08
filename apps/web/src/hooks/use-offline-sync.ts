"use client";

import { getQueueStats } from "@/lib/offline-queue";
import { createAutoSync, syncOfflineOperations, type SyncProgress } from "@/lib/offline-sync";
import { useCallback, useEffect, useState } from "react";
import { useConnectionStatus } from "./use-connection-status";

export function useOfflineSync() {
  const { backendOnline, isOnline } = useConnectionStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [queueStats, setQueueStats] = useState({
    pending: 0,
    syncing: 0,
    synced: 0,
    failed: 0,
  });

  const updateStats = useCallback(async () => {
    try {
      const stats = await getQueueStats();
      setQueueStats(stats);
    } catch (error) {
      console.error("Erro ao obter estatísticas da fila:", error);
    }
  }, []);

  const sync = useCallback(async () => {
    if (isSyncing || !backendOnline || !isOnline) return;

    setIsSyncing(true);
    setProgress(null);

    try {
      await syncOfflineOperations({
        onProgress: (prog) => {
          setProgress(prog);
        },
        onComplete: () => {
          setProgress(null);
          void updateStats();
        },
        onError: (error) => {
          console.error("Erro na sincronização:", error);
        },
      });
    } finally {
      setIsSyncing(false);
      void updateStats();
    }
  }, [isSyncing, backendOnline, isOnline, updateStats]);

  useEffect(() => {
    // Atualizar estatísticas inicialmente e periodicamente
    void updateStats();
    const interval = setInterval(updateStats, 10000); // A cada 10 segundos

    return () => clearInterval(interval);
  }, [updateStats]);

  useEffect(() => {
    // Sincronizar automaticamente quando a conexão for restabelecida
    if (backendOnline && isOnline && !isSyncing) {
      const autoSync = createAutoSync();
      autoSync.start(30000); // Verificar a cada 30 segundos

      // Sincronizar imediatamente quando voltar online
      void sync();

      return () => {
        autoSync.stop();
      };
    }
    return undefined;
  }, [backendOnline, isOnline, isSyncing, sync]);

  return {
    sync,
    isSyncing,
    progress,
    queueStats,
    hasPendingOperations: queueStats.pending > 0,
    refreshStats: updateStats,
  };
}
