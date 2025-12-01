"use client";

import { createRealtimeClient, type RealtimeEvent } from "@morina/realtime-client";
import { useCallback, useEffect, useRef } from "react";
import { defaultActorId, defaultOrgId, realtimeUrl } from "@/lib/env";

type NotificationEvent = RealtimeEvent<{
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  action?: {
    label: string;
    url?: string;
  };
  metadata?: Record<string, unknown>;
}>;

type UseRealtimeNotificationsOptions = {
  enabled?: boolean;
  onNotification?: (event: NotificationEvent) => void;
};

/**
 * Hook para receber notificações em tempo real via WebSocket
 */
export function useRealtimeNotifications(
  options: UseRealtimeNotificationsOptions & {
    orgId?: string;
    userId?: string;
  } = {},
) {
  const { enabled = true, onNotification, orgId = defaultOrgId, userId = defaultActorId } = options;
  const clientRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);
  const isConnectingRef = useRef(false);

  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      // Verificar se é um evento de notificação
      if (
        event.name === "notification.created" ||
        event.name === "Notification.Created" ||
        event.name?.includes("Notification")
      ) {
        const notificationEvent = event as NotificationEvent;

        // Disparar evento customizado para o NotificationCenter
        window.dispatchEvent(
          new CustomEvent("realtime-notification", {
            detail: notificationEvent,
          }),
        );

        // Chamar callback se fornecido
        onNotification?.(notificationEvent);
      }
    },
    [onNotification],
  );

  useEffect(() => {
    if (!enabled || !orgId || !userId) {
      return;
    }

    // Só conectar no cliente
    if (typeof window === "undefined") {
      return;
    }

    if (isConnectingRef.current || clientRef.current) {
      return;
    }

    isConnectingRef.current = true;

    const client = createRealtimeClient({
      apiUrl: typeof window !== "undefined" ? window.location.origin : "",
      realtimeUrl,
      orgId,
      actorId: userId,
      onEvent: handleEvent,
      onOpen: () => {
        console.log("[RealtimeNotifications] Conectado ao WebSocket");
      },
      onClose: () => {
        console.log("[RealtimeNotifications] Desconectado do WebSocket");
        clientRef.current = null;
        isConnectingRef.current = false;
      },
      onError: (error) => {
        // WebSocket errors are non-critical - log as warnings
        if (error instanceof Error && error.message.includes("Failed to fetch")) {
          console.warn("[RealtimeNotifications] Servidor não disponível, tentando reconectar...");
        } else {
          console.warn("[RealtimeNotifications] Erro na conexão (não crítico):", error);
        }
        clientRef.current = null;
        isConnectingRef.current = false;
      },
      reconnectAttempts: 10,
      reconnectIntervalMs: 3000,
    });

    clientRef.current = client;
    void client.connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
        isConnectingRef.current = false;
      }
    };
  }, [enabled, orgId, userId, handleEvent]);

  return {
    isConnected: clientRef.current?.state === "connected",
    disconnect: () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
        isConnectingRef.current = false;
      }
    },
  };
}
