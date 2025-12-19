"use client";

import { Button, GlassCard, cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, LogOut, Power, X } from "lucide-react";
import { useState } from "react";

type LogoutDialogProps = {
  open: boolean;
  onClose: () => void;
  onLogout: (logoutAllDevices: boolean) => void;
  hasUnsavedChanges?: boolean;
};

export function LogoutDialog({
  open,
  onClose,
  onLogout,
  hasUnsavedChanges = false,
}: LogoutDialogProps) {
  const [logoutAllDevices, setLogoutAllDevices] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const handleConfirm = () => {
    if (dontAskAgain) {
      localStorage.setItem("logout_dont_ask_again", "true");
    }
    onLogout(logoutAllDevices);
  };

  const handleCancel = () => {
    setLogoutAllDevices(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="relative w-full max-w-md p-6">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500/30 bg-red-500/10">
                    <LogOut className="h-8 w-8 text-red-400" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="mb-2 text-center text-2xl font-bold text-white">
                  Confirmar Saída
                </h2>

                {/* Warning */}
                {hasUnsavedChanges && (
                  <div className="mb-4 flex items-start gap-3 rounded border border-yellow-500/30 bg-yellow-500/10 p-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-400">
                        Alterações não salvas
                      </p>
                      <p className="mt-1 text-xs text-yellow-400/70">
                        Você tem alterações não salvas. Elas serão perdidas ao sair.
                      </p>
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="mb-6 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                    <input
                      type="radio"
                      name="logout-type"
                      checked={!logoutAllDevices}
                      onChange={() => setLogoutAllDevices(false)}
                      className="mt-1 h-4 w-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4 text-white/60" />
                        <span className="font-semibold text-white">Sair</span>
                      </div>
                      <p className="mt-1 text-xs text-white/60">
                        Encerrar sessão apenas neste dispositivo
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                    <input
                      type="radio"
                      name="logout-type"
                      checked={logoutAllDevices}
                      onChange={() => setLogoutAllDevices(true)}
                      className="mt-1 h-4 w-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Power className="h-4 w-4 text-red-400" />
                        <span className="font-semibold text-white">Sair de Todos os Dispositivos</span>
                      </div>
                      <p className="mt-1 text-xs text-white/60">
                        Encerrar todas as sessões ativas em todos os dispositivos
                      </p>
                    </div>
                  </label>
                </div>

                {/* Don't Ask Again */}
                <label className="mb-6 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dontAskAgain}
                    onChange={(e) => setDontAskAgain(e.target.checked)}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <span className="text-sm text-white/70">Não perguntar novamente</span>
                </label>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    className={cn(
                      "flex-1",
                      logoutAllDevices && "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
                    )}
                  >
                    {logoutAllDevices ? (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        Sair de Todos
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </>
                    )}
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




