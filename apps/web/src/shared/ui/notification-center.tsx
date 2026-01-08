"use client";

import { useConnectionStatus } from "@/hooks/use-connection-status";
import { notificationsApi } from "@/lib/api/notifications";
import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Bell, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Socket logic would ideally be in a useSocket hook, but for now we'll simulate or use window events if the main socket is initialized elsewhere
// Assuming the user is connected via a global socket provider or similar.

type Notification = {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  duration?: number; // Optional duration in milliseconds for auto-dismiss
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
        if (!orgId || orgId === "1") {
            // Avoid calling API with invalid/default ID which commonly causes 400
            console.warn("NotificationCenter: Invalid OrgID, skipping fetch.");
            return;
        }

        // Fetching logs...
        const res = await notificationsApi.listLogs(orgId, { limit: 5 });
        const initialNotifs: Notification[] = res.items.map(log => ({
          id: log.id,
          type: 'info',
          title: log.templateCode,
          message: `Nova notificação via ${log.channel}`,
          timestamp: new Date(log.createdAt),
          read: log.status === 'READ'
        }));
        
        // Filter out any potential duplicates by ID before adding
        setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const uniqueNew = initialNotifs.filter(n => !existingIds.has(n.id));
            return [...uniqueNew, ...prev];
        });
      } catch (e) {
        // Silently fail or log warning to avoid crashing UI
        console.warn("Failed to load notifications:", e);
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
          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer",
          isOpen ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/10 hover:text-white"
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
              className="absolute right-0 top-full mt-2 w-96 z-50 overflow-hidden"
            >
              <div className="relative border border-[#2957ff]/30 bg-[color-mix(in_oklab,#030712_90%,#000_10%)] backdrop-blur-xl shadow-[0_28px_140px_-48px_rgba(41,87,255,0.4)] overflow-hidden">
                {/* HUD overlays */}
                <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
                  <div className="absolute inset-0 holo-grid opacity-30" />
                  <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#2957ff]/40 to-transparent" />
                  <div className="absolute right-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#2957ff]/25 to-transparent" />
                </div>

                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#2957ff]/50" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#2957ff]/50" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#2957ff]/50" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#2957ff]/50" />

                {/* Content */}
                <div className="relative">
                  {/* Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#2957ff]/5 to-transparent">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-[#2957ff] rounded-full animate-pulse shadow-[0_0_8px_rgba(41, 87, 255, 0.8)]" />
                      <h3 className="text-sm font-mono font-semibold text-white uppercase tracking-wider">Notificações</h3>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-xs text-[#2957ff] hover:text-[#2957ff]/80 font-mono cursor-pointer transition-colors"
                      >
                        Marcar todas lidas
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[400px] overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 flex flex-col items-center text-center text-white/30">
                        <div className="relative">
                          <Bell className="w-12 h-12 mb-3 opacity-20" />
                          <div className="absolute inset-0 blur-xl bg-[#2957ff]/10 animate-pulse" />
                        </div>
                        <p className="text-sm font-mono">Nenhuma notificação</p>
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
                              "relative border p-3 transition-all cursor-pointer group bg-black/20",
                              notification.type === "success" && "border-green-500/30 hover:border-green-500/50 hover:bg-green-500/5",
                              notification.type === "error" && "border-red-500/30 hover:border-red-500/50 hover:bg-red-500/5",
                              notification.type === "warning" && "border-yellow-500/30 hover:border-yellow-500/50 hover:bg-yellow-500/5",
                              notification.type === "info" && "border-[#2957ff]/30 hover:border-[#2957ff]/50 hover:bg-[#2957ff]/5",
                              !notification.read && "shadow-[0_0_15px_rgba(41,87,255,0.15)]"
                            )}
                          >
                            {/* Mini corner brackets */}
                            <div className={cn(
                              "absolute top-0 left-0 w-3 h-3 border-t border-l opacity-50",
                              notification.type === "success" && "border-green-500",
                              notification.type === "error" && "border-red-500",
                              notification.type === "warning" && "border-yellow-500",
                              notification.type === "info" && "border-[#2957ff]"
                            )} />
                            <div className={cn(
                              "absolute bottom-0 right-0 w-3 h-3 border-b border-r opacity-50",
                              notification.type === "success" && "border-green-500",
                              notification.type === "error" && "border-red-500",
                              notification.type === "warning" && "border-yellow-500",
                              notification.type === "info" && "border-[#2957ff]"
                            )} />

                            <div className="flex items-start gap-3 relative">
                              <div className={cn(
                                "mt-0.5 p-1.5 border backdrop-blur-sm",
                                notification.type === "success" && "border-green-500/30 bg-green-500/10 text-green-400",
                                notification.type === "error" && "border-red-500/30 bg-red-500/10 text-red-400",
                                notification.type === "warning" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
                                notification.type === "info" && "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                              )}>
                                <Icon className="h-4 w-4 shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold leading-tight text-white">{notification.title}</p>
                                <p className="mt-1 text-xs text-white/70 line-clamp-2">{notification.message}</p>
                                <p className="mt-1.5 text-[10px] text-white/40 font-mono">
                                  {notification.timestamp.toLocaleTimeString("pt-BR")}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}
                                className="shrink-0 opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-opacity cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-white/10 bg-gradient-to-r from-transparent to-[#2957ff]/5 text-center">
                    <a 
                      href="/admin/notifications" 
                      className="text-xs text-[#2957ff] hover:text-[#2957ff]/80 transition-colors font-mono cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Ver histórico completo</span>
                      <span className="text-[#2957ff]">→</span>
                    </a>
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="h-1 bg-linear-to-r from-transparent via-cyan-500/50 to-transparent" />
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
