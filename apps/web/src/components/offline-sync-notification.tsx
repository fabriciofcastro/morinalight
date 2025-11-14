"use client";

import { useOfflineSync } from "@/hooks/use-offline-sync";
import { cn } from "@morina/ui";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineSyncNotification() {
  const { queueStats, isSyncing, progress, hasPendingOperations } = useOfflineSync();

  if (!hasPendingOperations && !isSyncing) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          "fixed bottom-20 right-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm",
          isSyncing
            ? "border-blue-500/20 bg-blue-500/10 text-blue-600"
            : "border-yellow-500/20 bg-yellow-500/10 text-yellow-600",
        )}
      >
        <div className="flex items-start gap-3">
          {isSyncing ? (
            <RefreshCw className="h-5 w-5 animate-spin flex-shrink-0" />
          ) : (
            <CloudOff className="h-5 w-5 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="font-medium">
              {isSyncing ? "Sincronizando..." : "Operações pendentes"}
            </div>
            {isSyncing && progress && (
              <div className="mt-1 text-xs opacity-75">
                {progress.completed} de {progress.total} sincronizadas
              </div>
            )}
            {!isSyncing && queueStats.pending > 0 && (
              <div className="mt-1 text-xs opacity-75">
                {queueStats.pending} operação(ões) aguardando sincronização
              </div>
            )}
          </div>
        </div>

        {progress && progress.total > 0 && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{
                width: `${(progress.completed / progress.total) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

