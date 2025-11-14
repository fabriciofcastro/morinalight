"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiUrl } from "@/lib/env";

export type ConnectionStatus = "online" | "offline" | "checking" | "error";

export type ConnectionStatusState = {
  status: ConnectionStatus;
  isOnline: boolean;
  lastChecked: Date | null;
  backendOnline: boolean;
  realtimeConnected: boolean;
};

/**
 * Hook para monitorar o status de conexão do servidor (backend e realtime)
 */
export function useConnectionStatus() {
  const [state, setState] = useState<ConnectionStatusState>({
    status: "checking",
    isOnline: typeof window !== "undefined" ? navigator.onLine : false,
    lastChecked: null,
    backendOnline: false,
    realtimeConnected: false,
  });

  const checkBackend = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${apiUrl}/health`, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      const isOnline = response.ok;
      setState((prev) => ({
        ...prev,
        backendOnline: isOnline,
        status: isOnline ? "online" : "error",
        lastChecked: new Date(),
      }));

      return isOnline;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        backendOnline: false,
        status: "offline",
        lastChecked: new Date(),
      }));
      return false;
    }
  }, []);

  const checkRealtime = useCallback(async () => {
    // Verificar se há um cliente realtime ativo
    // Por enquanto, apenas verificar se a URL está acessível
    try {
      const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:3334";
      // WebSocket não pode ser verificado via fetch, então assumimos conectado se backend está online
      setState((prev) => ({
        ...prev,
        realtimeConnected: prev.backendOnline,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        realtimeConnected: false,
      }));
    }
  }, []);

  const checkAll = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "checking" }));
    await checkBackend();
    await checkRealtime();
  }, [checkBackend, checkRealtime]);

  // Usar ref para manter referência do estado sem causar re-renders
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    // Só executar no cliente
    if (typeof window === "undefined") {
      return;
    }

    let lastCheckTime = 0;
    const MIN_CHECK_INTERVAL = 5000; // 5 segundos mínimo entre verificações
    let isChecking = false;
    let intervalId: NodeJS.Timeout | null = null;

    const checkWithDebounce = async () => {
      const now = Date.now();
      // Evitar verificações muito frequentes
      if (isChecking || (now - lastCheckTime < MIN_CHECK_INTERVAL)) {
        return;
      }
      
      isChecking = true;
      lastCheckTime = now;
      await checkAll();
      isChecking = false;
    };

    const scheduleNextCheck = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }

      // Intervalo mais longo quando tudo está OK (60s), mais curto quando há problemas (15s)
      const currentState = stateRef.current;
      const intervalTime = (currentState.backendOnline && currentState.realtimeConnected) 
        ? 60000  // 60s quando tudo está OK
        : 15000; // 15s quando há problemas
      
      intervalId = setInterval(() => {
        if (navigator.onLine) {
          void checkWithDebounce().then(() => {
            // Reagendar com novo intervalo baseado no estado atualizado
            scheduleNextCheck();
          });
        }
      }, intervalTime);
    };

    // Verificar status inicial
    void checkWithDebounce().then(() => {
      scheduleNextCheck();
    });

    // Verificar quando a conexão de rede muda
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      void checkWithDebounce().then(() => {
        scheduleNextCheck();
      });
    };

    const handleOffline = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      setState((prev) => ({
        ...prev,
        isOnline: false,
        status: "offline",
        backendOnline: false,
        realtimeConnected: false,
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verificar periodicamente com intervalo adaptativo
    scheduleNextCheck();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkAll]);

  return {
    ...state,
    checkBackend,
    checkRealtime,
    checkAll,
    refresh: checkAll,
  };
}

