"use client";

import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, LogOut, Power, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            onClick={handleCancel}
          />

          {/* Modal Container - Perfectly Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            style={{ maxWidth: 'none' }}
            onClick={(e) => {
              // Only close if clicking the container itself, not the modal
              if (e.target === e.currentTarget) {
                handleCancel();
              }
            }}
          >
            <div className="relative border border-red-500/30 bg-[color-mix(in_oklab,#030712_90%,#000_10%)] backdrop-blur-xl shadow-[0_28px_140px_-48px_rgba(239,68,68,0.4)] overflow-hidden" style={{ width: 'min(560px, calc(100vw - 2rem))' }}>
              {/* HUD overlays */}
              <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
                <div className="absolute inset-0 holo-grid opacity-30" />
                <div className="absolute left-0 top-0 h-full w-[2px] beam-line opacity-40" />
                <div className="absolute right-0 top-0 h-full w-[2px] beam-line opacity-25" />
              </div>

              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500/50" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500/50" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500/50" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-500/50" />

              {/* Content */}
              <div className="relative p-6 sm:p-8">
                {/* Close button */}
                <button
                  onClick={handleCancel}
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:border-red-500/50 transition-all cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex h-14 w-14 items-center justify-center border-2 border-red-500/40 bg-red-500/10 flex-shrink-0">
                    <div className="absolute inset-0 border border-red-500/20" />
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono text-red-400/70 uppercase tracking-[0.3em] mb-1">
                      SECURITY_PROTOCOL
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Encerrar Sessão?
                    </h2>
                  </div>
                </div>

                {/* Warning for unsaved changes */}
                {hasUnsavedChanges && (
                  <div className="mb-6 border border-yellow-500/30 bg-yellow-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-400">
                          Alterações não salvas
                        </p>
                        <p className="mt-1 text-xs text-yellow-400/70">
                          Você tem alterações não salvas. Elas serão perdidas ao sair.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="mb-6 border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-white/80 leading-relaxed flex-1">
                      Você está prestes a encerrar sua sessão no sistema. 
                      <span className="block mt-2 text-xs text-white/50 font-mono">
                        Seus dados serão protegidos e você será redirecionado para a tela de login.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout Options */}
                <div className="mb-6 space-y-3">
                  <label className={cn(
                    "flex cursor-pointer items-start gap-3 border p-4 transition-all",
                    !logoutAllDevices
                      ? "border-cyan-500/30 bg-cyan-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}>
                    <input
                      type="radio"
                      name="logout-type"
                      checked={!logoutAllDevices}
                      onChange={() => setLogoutAllDevices(false)}
                      className="mt-1 h-4 w-4 cursor-pointer accent-cyan-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4 text-white/60" />
                        <span className="font-semibold text-white">Sair deste Dispositivo</span>
                      </div>
                      <p className="mt-1 text-xs text-white/50 font-mono">
                        Encerrar sessão apenas neste dispositivo
                      </p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex cursor-pointer items-start gap-3 border p-4 transition-all",
                    logoutAllDevices
                      ? "border-red-500/30 bg-red-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}>
                    <input
                      type="radio"
                      name="logout-type"
                      checked={logoutAllDevices}
                      onChange={() => setLogoutAllDevices(true)}
                      className="mt-1 h-4 w-4 cursor-pointer accent-red-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Power className="h-4 w-4 text-red-400" />
                        <span className="font-semibold text-white">Sair de Todos os Dispositivos</span>
                      </div>
                      <p className="mt-1 text-xs text-white/50 font-mono">
                        Encerrar todas as sessões ativas em todos os dispositivos
                      </p>
                    </div>
                  </label>
                </div>

                {/* Don't Ask Again */}
                <label className="mb-6 flex cursor-pointer items-center gap-3 border border-white/10 bg-white/5 hover:bg-white/10 p-3 transition-all">
                  <input
                    type="checkbox"
                    checked={dontAskAgain}
                    onChange={(e) => setDontAskAgain(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-cyan-500"
                  />
                  <span className="text-sm text-white/70 font-mono">Não perguntar novamente</span>
                </label>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 h-12 border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all font-mono text-sm uppercase tracking-wider flex items-center justify-center cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={cn(
                      "flex-1 h-12 border transition-all font-mono text-sm uppercase tracking-wider relative overflow-hidden group cursor-pointer",
                      logoutAllDevices
                        ? "border-red-500/40 bg-red-500/20 text-red-100 hover:bg-red-500/30 hover:border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                        : "border-cyan-500/40 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    )} />
                    <span className="relative flex items-center justify-center gap-2">
                      {logoutAllDevices ? (
                        <>
                          <Power className="h-4 w-4" />
                          Sair de Todos
                        </>
                      ) : (
                        <>
                          <LogOut className="h-4 w-4" />
                          Confirmar Saída
                        </>
                      )}
                    </span>
                  </button>
                </div>

                {/* Security notice */}
                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-center gap-2 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                    <div className="h-1.5 w-1.5 bg-green-500 animate-pulse" />
                    SECURE CONNECTION ACTIVE
                  </div>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="h-1 bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}




