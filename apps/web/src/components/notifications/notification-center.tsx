"use client";

import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Bell, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { notificationsApi, NotificationLog } from "@/lib/api/notifications";

// Socket logic would ideally be in a useSocket hook, but for now we'll simulate or use window events if the main socket is initialized elsewhere
// Assuming the user is connected via a global socket provider or similar.

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

export function NotificationCenter({ maxNotifications = 10 }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { status, isOnline } = useConnectionStatus();
  const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

  // Load initial unread from backend
  useEffect(() => {
    const loadUnread = async () => {
      try {
        // Fetching logs as a proxy for notifications. In a real scenario, we'd have a dedicated /notifications/me endpoint.
        // For now using listLogs with status=SENT which might imply unread for this user roughly.
        // Adapting to use data from API if available, else standard empty.
        const res = await notificationsApi.listLogs(orgId, { limit: 5 });
        // Convert logs to notifications
        const initialNotifs: Notification[] = res.items.map(log => ({
          id: log.id,
          type: 'info', // Defaulting as log doesn't store type strictly without template lookup
          title: log.templateCode,
          message: `Nova notificação via ${log.channel}`,
          timestamp: new Date(log.createdAt),
          read: log.status === 'READ'
        }));
        setNotifications(prev => [...initialNotifs, ...prev]);
      } catch (e) {
        console.error("Erro ao carregar notificações iniciais", e);
      }
    };
    if (isOnline) {
      loadUnread();
    }
  }, [orgId, isOnline]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Here we would call API to mark all as read
    // await notificationsApi.markAllRead(orgId);
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

      // Auto-remover após 5 segundos se for um Toast (não persistente)
      // Se for via socket (persistente), não removemos automaticamente do painel, apenas o Toast pode sumir 
      // Mas aqui estamos misturando Toast e Center. Vamos manter comportamento híbrido.
      if (notification.type !== "error") {
        // Only removing from "Toast view" logic would be complex here without separate state. 
        // For simple Center, we keep in list but maybe "read" it? 
        // Let's keep logic: if it's a "Toast" alert, we usually want it to stay in history if it's important.
      }
    },
    [maxNotifications],
  );

  useEffect(() => {
    if (!isOnline && status === "offline") {
      queueMicrotask(() => {
        addNotification({
          type: "warning",
          title: "Conexão perdida",
          message: "Você está offline. Alterações serão sincronizadas depois.",
        });
      });
    } else if (isOnline && status === "online") {
      // Re-sync logic could go here
    }
  }, [status, isOnline, addNotification]);

  // Escutar eventos de notificação via WebSocket (Window Event shim for now)
  useEffect(() => {
    const handleRealtimeNotification = (event: CustomEvent) => {
      const notificationEvent = event.detail as {
        payload: {
          type: Notification["type"];
          title: string;
          message: string;
        };
      };

      addNotification({
        type: notificationEvent.payload.type,
        title: notificationEvent.payload.title,
        message: notificationEvent.payload.message,
      });

      // Play sound
      try {
        const audio = new Audio('/sounds/notification.mp3'); // path to asset
        audio.play().catch(() => { }); // ignore autoplay errors
      } catch (e) { }
    };

    window.addEventListener("realtime-notification", handleRealtimeNotification as EventListener);

    const handleLocalNotification = (event: CustomEvent) => {
      addNotification(event.detail);
    };
    window.addEventListener("add-notification", handleLocalNotification as EventListener);

    return () => {
      window.removeEventListener("realtime-notification", handleRealtimeNotification as EventListener);
      window.removeEventListener("add-notification", handleLocalNotification as EventListener);
    };
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return CheckCircle2;
      case "error": return XCircle;
      case "warning": return AlertCircle;
      default: return Info;
    }
  };

  const getColors = (type: Notification["type"]) => {
    switch (type) {
      case "success": return "border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]";
      case "error": return "border-[hsl(var(--danger)/0.25)] bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))]";
      case "warning": return "border-[hsl(var(--warning)/0.25)] bg-[hsl(var(--warning)/0.08)] text-[hsl(var(--warning))]";
      default: return "border-[hsl(var(--info)/0.25)] bg-[hsl(var(--info)/0.08)] text-[hsl(var(--info))]";
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-all",
          isOpen ? "bg-white/10 text-white" : "hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-[var(--fg)]"
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[#090b16]/90 p-0 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-sm font-semibold text-white">Notificações</h3>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center text-center text-white/30">
                    <Bell className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = getIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "relative rounded-lg border p-3 transition-all cursor-pointer group",
                          getColors(notification.type),
                          !notification.read ? "bg-opacity-20 border-opacity-40" : "bg-opacity-5 border-opacity-10 opacity-70"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("mt-0.5 p-1 rounded-full bg-black/20")}>
                            <Icon className="h-4 w-4 shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold leading-tight">{notification.title}</p>
                            <p className="mt-1 text-xs opacity-90 line-clamp-2">{notification.message}</p>
                            <p className="mt-1.5 text-[10px] opacity-60 font-mono">
                              {notification.timestamp.toLocaleTimeString("pt-BR")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}
                            className="shrink-0 opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              <div className="p-2 border-t border-white/10 bg-white/5 text-center">
                <a href="/admin/notifications" className="text-xs text-white/50 hover:text-white transition-colors">
                  Ver histórico completo
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export const notificationCenter = {
  add: (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent("add-notification", {
          detail: notification,
        }),
      );
    }
  },
};
