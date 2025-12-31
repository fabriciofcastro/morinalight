"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, RefreshCw, LogOut, X } from "lucide-react";
import { Button } from "@morina/ui";

interface SessionTimeoutWarningProps {
    /** Tempo de sessão em minutos */
    sessionDurationMinutes?: number;
    /** Tempo antes de expirar para mostrar aviso (em minutos) */
    warningBeforeMinutes?: number;
    /** Callback quando sessão expira */
    onSessionExpire?: () => void;
    /** Callback para renovar sessão */
    onSessionRenew?: () => Promise<void>;
}

export function SessionTimeoutWarning({
    sessionDurationMinutes = 30,
    warningBeforeMinutes = 5,
    onSessionExpire,
    onSessionRenew,
}: SessionTimeoutWarningProps) {
    const [showWarning, setShowWarning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isRenewing, setIsRenewing] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());

    const sessionDurationMs = sessionDurationMinutes * 60 * 1000;
    const warningThresholdMs = warningBeforeMinutes * 60 * 1000;

    // Reset activity timer on user interaction
    const resetActivityTimer = useCallback(() => {
        setLastActivity(Date.now());
        setShowWarning(false);
    }, []);

    // Handle session renewal
    const handleRenewSession = async () => {
        setIsRenewing(true);
        try {
            await onSessionRenew?.();
            resetActivityTimer();
        } catch (error) {
            console.error("Failed to renew session:", error);
        } finally {
            setIsRenewing(false);
        }
    };

    // Handle logout/expire
    const handleExpire = () => {
        setShowWarning(false);
        onSessionExpire?.();
    };

    // Track user activity
    useEffect(() => {
        const events = ["mousedown", "keydown", "scroll", "touchstart"];

        const handleActivity = () => {
            if (!showWarning) {
                setLastActivity(Date.now());
            }
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [showWarning]);

    // Check session timeout
    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - lastActivity;
            const remaining = sessionDurationMs - elapsed;

            if (remaining <= 0) {
                handleExpire();
                return;
            }

            if (remaining <= warningThresholdMs) {
                setShowWarning(true);
                setTimeRemaining(Math.ceil(remaining / 1000));
            } else {
                setShowWarning(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lastActivity, sessionDurationMs, warningThresholdMs]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <AnimatePresence>
            {showWarning && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md bg-[#0A0D14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header gradient */}
                            <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

                            <div className="p-6">
                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                                            <Clock className="w-8 h-8 text-amber-400" />
                                        </div>
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-amber-500"
                                            animate={{ scale: [1, 1.2], opacity: [1, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Sessão Expirando
                                    </h3>
                                    <p className="text-white/60 text-sm">
                                        Sua sessão expirará em breve por inatividade.
                                        Clique em &quot;Continuar&quot; para permanecer conectado.
                                    </p>
                                </div>

                                {/* Timer */}
                                <div className="bg-white/5 rounded-xl p-4 mb-6 text-center">
                                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                                        Tempo Restante
                                    </p>
                                    <p className="text-3xl font-mono font-bold text-amber-400">
                                        {formatTime(timeRemaining)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-white/10 hover:bg-white/5 text-white"
                                        onClick={handleExpire}
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sair
                                    </Button>
                                    <Button
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                                        onClick={handleRenewSession}
                                        disabled={isRenewing}
                                    >
                                        {isRenewing ? (
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                        )}
                                        {isRenewing ? "Renovando..." : "Continuar"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
