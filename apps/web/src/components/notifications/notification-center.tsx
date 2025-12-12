"use client";

import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Bell, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useConnectionStatus } from "@/hooks/use-connection-status";

type Notification = {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
};

type NotificationCenterProps = {
  maxNotifications?: number;
};

export function NotificationCenter({ maxNotifications = 5 }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { status, isOnline } = useConnectionStatus();

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        return updated.slice(0, maxNotifications);
      });

      // Auto-remover após 5 segundos (exceto erros)
      if (notification.type !== "error") {
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, 5000);
      }
    },
    [maxNotifications, removeNotification],
  );

  useEffect(() => {
    // Adicionar notificação de conexão quando status muda
    if (!isOnline && status === "offline") {
      addNotification({
        type: "warning",
        title: "Conexão perdida",
        message:
          "Você está offline. Alterações serão sincronizadas quando a conexão for restaurada.",
      });
    } else if (isOnline && status === "online") {
      addNotification({
        type: "success",
        title: "Conectado",
        message: "Conexão restaurada. Sincronizando alterações...",
      });
    }
  }, [status, isOnline, addNotification]);

  // Escutar eventos de notificação via WebSocket
  useEffect(() => {
    const handleRealtimeNotification = (event: CustomEvent) => {
      const notificationEvent = event.detail as {
        payload: {
          type: Notification["type"];
          title: string;
          message: string;
        };
        metadata: {
          eventId: string;
          timestamp: string;
        };
      };

      addNotification({
        type: notificationEvent.payload.type,
        title: notificationEvent.payload.title,
        message: notificationEvent.payload.message,
      });
    };

    // Escutar evento customizado de notificações realtime
    window.addEventListener("realtime-notification", handleRealtimeNotification as EventListener);

    // Escutar evento customizado de notificações locais
    const handleLocalNotification = (event: CustomEvent) => {
      addNotification(event.detail);
    };
    window.addEventListener("add-notification", handleLocalNotification as EventListener);

    return () => {
      window.removeEventListener(
        "realtime-notification",
        handleRealtimeNotification as EventListener,
      );
      window.removeEventListener("add-notification", handleLocalNotification as EventListener);
    };
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return CheckCircle2;
      case "error":
        return XCircle;
      case "warning":
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getColors = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]";
      case "error":
        return "border-[hsl(var(--danger)/0.25)] bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))]";
      case "warning":
        return "border-[hsl(var(--warning)/0.25)] bg-[hsl(var(--warning)/0.08)] text-[hsl(var(--warning))]";
      default:
        return "border-[hsl(var(--info)/0.25)] bg-[hsl(var(--info)/0.08)] text-[hsl(var(--info))]";
    }
  };

  return (
    <div className="relative">
      {/* Botão do sino */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-all",
          "hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
          "text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-[var(--fg)]",
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 rounded-lg border border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[color-mix(in_oklab,var(--surface)_98%,transparent)] p-4 shadow-xl backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--fg)]">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-[var(--fg)]"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Nenhuma notificação
                </p>
              ) : (
                notifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={cn(
                        "relative rounded-lg border p-3 transition-all",
                        getColors(notification.type),
                        !notification.read && "ring-2 ring-[var(--primary)]/20",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="mt-1 text-xs opacity-90">{notification.message}</p>
                          <p className="mt-1 text-xs opacity-75">
                            {notification.timestamp.toLocaleTimeString("pt-BR")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNotification(notification.id)}
                          className="shrink-0 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-[var(--fg)]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Exportar função para adicionar notificações globalmente
export const notificationCenter = {
  add: (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    // Disparar evento customizado que o NotificationCenter escuta
    window.dispatchEvent(
      new CustomEvent("add-notification", {
        detail: notification,
      }),
    );
  },
};
