"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AuthApi } from "@/lib/api/auth";
import { notificationCenter } from "@/components/notifications/notification-center";

const authApi = new AuthApi();

// Configuração de timeout de inatividade (em minutos)
const INACTIVITY_TIMEOUT = 30; // 30 minutos
const WARNING_TIME = 5; // Avisar 5 minutos antes

export function useLogout() {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [inactivityWarning, setInactivityWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(
    async (logoutAllDevices = false) => {
      setLogoutDialogOpen(false);
      notificationCenter.add({
        type: "info",
        title: "Saindo...",
        message: "Encerrando sua sessão.",
      });

      await authApi.logout(logoutAllDevices);
    },
    [],
  );

  const openLogoutDialog = useCallback(() => {
    // Verificar se há alterações não salvas
    // TODO: Implementar detecção real de alterações não salvas
    const hasChanges = false; // Placeholder
    setHasUnsavedChanges(hasChanges);
    setLogoutDialogOpen(true);
  }, []);

  const extendSession = useCallback(() => {
    setInactivityWarning(false);
    setTimeRemaining(0);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    // Resetar timers será feito pelo useEffect
  }, []);

  // Detectar inatividade
  useEffect(() => {
    let lastActivity = Date.now();
    let warningShown = false;

    const resetTimers = () => {
      lastActivity = Date.now();
      warningShown = false;
      setInactivityWarning(false);
      setTimeRemaining(0);

      // Limpar timers anteriores
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

      // Timer de aviso (5 minutos antes)
      const warningTime = (INACTIVITY_TIMEOUT - WARNING_TIME) * 60 * 1000;
      const warning = setTimeout(() => {
        if (!warningShown) {
          warningShown = true;
          setInactivityWarning(true);
          setTimeRemaining(WARNING_TIME * 60); // 5 minutos em segundos

          // Countdown
          countdownTimerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev <= 1) {
                if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                handleLogout(false);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }, warningTime);
      warningTimerRef.current = warning;

      // Timer de logout automático
      const logoutTime = INACTIVITY_TIMEOUT * 60 * 1000;
      const logout = setTimeout(() => {
        const timeSinceLastActivity = Date.now() - lastActivity;
        if (timeSinceLastActivity >= logoutTime) {
          handleLogout(false);
        }
      }, logoutTime);
      inactivityTimerRef.current = logout;
    };

    const handleActivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity > 60000) {
        // Se passou mais de 1 minuto desde a última atividade, resetar
        resetTimers();
      }
      lastActivity = Date.now();
    };

    // Eventos de atividade
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimers();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [handleLogout]);

  // Atalho de teclado (Ctrl+Shift+Q)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "Q") {
        e.preventDefault();
        // Verificar se não está digitando em um input
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        openLogoutDialog();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openLogoutDialog]);

  return {
    logoutDialogOpen,
    setLogoutDialogOpen,
    hasUnsavedChanges,
    inactivityWarning,
    setInactivityWarning,
    timeRemaining,
    handleLogout,
    openLogoutDialog,
    extendSession,
  };
}




