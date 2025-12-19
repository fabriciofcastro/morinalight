"use client";

import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useConnectionStatus } from "@/hooks/use-connection-status";

type ConnectionStatusIndicatorProps = {
  position?: "fixed" | "absolute";
  className?: string;
};

export function ConnectionStatusIndicator({
  position = "fixed",
  className,
}: ConnectionStatusIndicatorProps) {
  const [mounted, setMounted] = useState(false);

  // Sempre chamar o hook (regra dos hooks do React)
  // O hook já tem proteção para SSR
  const { status, isOnline, backendOnline, realtimeConnected, lastChecked } = useConnectionStatus();

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return null;
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        label: "Sem conexão",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
      };
    }

    if (status === "checking") {
      return {
        icon: Loader2,
        label: "Verificando...",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/20",
      };
    }

    if (status === "error" || !backendOnline) {
      return {
        icon: AlertCircle,
        label: "Servidor offline",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
      };
    }

    if (backendOnline && realtimeConnected) {
      return {
        icon: Wifi,
        label: "Conectado",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
      };
    }

    return {
      icon: Wifi,
      label: "Parcialmente conectado",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={cn(
          position === "fixed" ? "fixed bottom-4 right-4" : "absolute top-0 right-0",
          "z-50 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium shadow-lg backdrop-blur-sm",
          config.bgColor,
          config.borderColor,
          config.color,
          className,
        )}
        title={
          lastChecked
            ? `Última verificação: ${lastChecked.toLocaleTimeString("pt-BR")}`
            : "Status de conexão"
        }
      >
        <Icon
          className={cn("h-4 w-4", status === "checking" && "animate-spin")}
          aria-hidden="true"
        />
        <span className="hidden sm:inline">{config.label}</span>
        {!isOnline && <span className="ml-1 text-[10px] opacity-75">(Modo offline)</span>}
      </motion.div>
    </AnimatePresence>
  );
}

// Exportação explícita para garantir compatibilidade com Next.js/Turbopack
export { ConnectionStatusIndicator };
