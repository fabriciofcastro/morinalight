"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw, Cloud, CloudOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@morina/ui";

interface OfflineIndicatorProps {
    className?: string;
    showWhenOnline?: boolean;
}

export function OfflineIndicator({
    className,
    showWhenOnline = false,
}: OfflineIndicatorProps) {
    const [isOnline, setIsOnline] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        // Initial state
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                setShowReconnected(true);
                setTimeout(() => {
                    setShowReconnected(false);
                    setWasOffline(false);
                }, 3000);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [wasOffline]);

    // Don't show if online and showWhenOnline is false
    if (isOnline && !showWhenOnline && !showReconnected) {
        return null;
    }

    return (
        <AnimatePresence>
            {(!isOnline || showReconnected) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                        "fixed top-20 right-6 z-50 max-w-sm",
                        className
                    )}
                >
                    <div className={cn(
                        "px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg flex items-center gap-3",
                        isOnline
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-red-500/10 border-red-500/30"
                    )}>
                        {isOnline ? (
                            <>
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Wifi className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-emerald-400">
                                        Conexão Restabelecida
                                    </p>
                                    <p className="text-xs text-emerald-400/70">
                                        Sistema online novamente
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-400">
                                        Sem Conexão
                                    </p>
                                    <p className="text-xs text-red-400/70">
                                        Modo offline ativado
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Connection Status Badge (for navbar/footer)
export function ConnectionStatusBadge({ className }: { className?: string }) {
    const [isOnline, setIsOnline] = useState(true);
    const [lastSync, setLastSync] = useState<Date>(new Date());

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setLastSync(new Date());
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs",
            isOnline
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400",
            className
        )}>
            {isOnline ? (
                <>
                    <Cloud className="w-3 h-3" />
                    <span>Online</span>
                </>
            ) : (
                <>
                    <CloudOff className="w-3 h-3" />
                    <span>Offline</span>
                </>
            )}
        </div>
    );
}
