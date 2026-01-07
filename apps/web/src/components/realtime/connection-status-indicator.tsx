"use client";

import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

interface ConnectionStatusIndicatorProps {
    /** Status atual da conexão */
    status?: ConnectionStatus;
    /** Se deve mostrar o indicador sempre ou só quando há problema */
    alwaysShow?: boolean;
    /** Callback para tentar reconectar */
    onReconnect?: () => void;
    /** Posição do indicador */
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    className?: string;
}

const statusConfig: Record<ConnectionStatus, {
    icon: typeof Wifi;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    pulse?: boolean;
}> = {
    connected: {
        icon: Wifi,
        label: "Conectado",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
    },
    connecting: {
        icon: RefreshCw,
        label: "Conectando...",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        pulse: true,
    },
    disconnected: {
        icon: WifiOff,
        label: "Desconectado",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
    },
    error: {
        icon: AlertTriangle,
        label: "Erro de conexão",
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
    },
};

const positionClasses: Record<string, string> = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
};

export function ConnectionStatusIndicator({
    status = "connected",
    alwaysShow = false,
    onReconnect,
    position = "bottom-right",
    className,
}: ConnectionStatusIndicatorProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showIndicator, setShowIndicator] = useState(false);

    const config = statusConfig[status];
    const Icon = config.icon;

    // Show indicator based on status
    useEffect(() => {
        if (alwaysShow) {
            setShowIndicator(true);
        } else {
            // Show only when not connected
            setShowIndicator(status !== "connected");
        }
    }, [status, alwaysShow]);

    // Auto-expand when status changes to non-connected
    useEffect(() => {
        if (status !== "connected") {
            setIsExpanded(true);
            const timer = setTimeout(() => setIsExpanded(false), 5000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [status]);

    if (!showIndicator) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
                "fixed z-40",
                positionClasses[position],
                className
            )}
        >
            <motion.div
                layout
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-md cursor-pointer transition-colors",
                    config.bgColor,
                    config.borderColor,
                    "hover:bg-white/10"
                )}
            >
                {/* Icon */}
                <div className="relative">
                    <Icon
                        className={cn(
                            "w-4 h-4",
                            config.color,
                            config.pulse && "animate-spin"
                        )}
                    />
                    {status === "connected" && (
                        <motion.div
                            className="absolute inset-0 rounded-full bg-emerald-400"
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}
                </div>

                {/* Label */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <span className={cn("text-sm font-medium", config.color)}>
                                {config.label}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reconnect button */}
                <AnimatePresence>
                    {isExpanded && status !== "connected" && status !== "connecting" && onReconnect && (
                        <motion.button
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onReconnect();
                            }}
                            className="p-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3 text-white/60 hover:text-white" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}

// Hook para usar o indicador com WebSocket real
export function useConnectionStatus() {
    const [status, setStatus] = useState<ConnectionStatus>("connecting");

    useEffect(() => {
        // Simular conexão inicial
        const timer = setTimeout(() => {
            setStatus("connected");
        }, 1500);

        // Em produção, integrar com WebSocket real
        const handleOnline = () => setStatus("connected");
        const handleOffline = () => setStatus("disconnected");

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return { status, setStatus };
}
