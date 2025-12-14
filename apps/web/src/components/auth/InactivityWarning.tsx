"use client";

import { Button, GlassCard, cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Power, X } from "lucide-react";

type InactivityWarningProps = {
  open: boolean;
  timeRemaining: number; // em segundos
  onExtend: () => void;
  onLogout: () => void;
};

export function InactivityWarning({
  open,
  timeRemaining,
  onExtend,
  onLogout,
}: InactivityWarningProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
            >
              <GlassCard className="relative w-full max-w-md p-6">
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-500/30 bg-yellow-500/10">
                    <Clock className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="mb-2 text-center text-2xl font-bold text-white">
                  Inatividade Detectada
                </h2>

                {/* Message */}
                <p className="mb-4 text-center text-white/70">
                  Você ficou inativo por muito tempo. Sua sessão será encerrada automaticamente em:
                </p>

                {/* Timer */}
                <div className="mb-6 flex justify-center">
                  <div className="rounded border-2 border-yellow-500/30 bg-yellow-500/10 px-6 py-4">
                    <div className="text-center">
                      <div className="text-4xl font-mono font-bold text-yellow-400">
                        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                      </div>
                      <p className="mt-1 text-xs text-yellow-400/70">minutos : segundos</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={onLogout} className="flex-1">
                    <Power className="mr-2 h-4 w-4" />
                    Sair Agora
                  </Button>
                  <Button type="button" onClick={onExtend} className="flex-1">
                    Estender Sessão
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}


