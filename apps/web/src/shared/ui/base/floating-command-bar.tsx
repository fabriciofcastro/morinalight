"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { Save, ArrowLeft, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";

interface FloatingCommandBarProps {
    onSave: () => void;
    onCancel: () => void;
    onReset: () => void;
    isSaving: boolean;
    isValid: boolean;
    completeness?: number;
}

export function FloatingCommandBar({
    onSave,
    onCancel,
    onReset,
    isSaving,
    isValid,
    completeness = 0,
}: FloatingCommandBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTooltip, setShowTooltip] = useState<string | null>(null);

    // Smooth spring animations
    const springConfig = { stiffness: 300, damping: 30 };
    const opacity = useSpring(0, springConfig);
    const scale = useSpring(0.8, springConfig);

    useEffect(() => {
        opacity.set(1);
        scale.set(1);
    }, [opacity, scale]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="fixed bottom-8 right-8 z-50"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => {
                setIsExpanded(false);
                setShowTooltip(null);
            }}
        >
            {/* Command Bar Container */}
            <motion.div
                className="relative"
                animate={{
                    width: isExpanded ? "auto" : "64px",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {/* Background with glassmorphism */}
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-[hsl(var(--accent)/0.10)] to-[hsl(var(--primary)/0.15)] rounded-2xl backdrop-blur-2xl border border-white/20 shadow-2xl" />

                {/* Animated border glow */}
                <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                        background: "linear-gradient(90deg, hsl(var(--primary)/0.4), hsl(var(--accent)/0.4), hsl(var(--primary)/0.4))",
                        backgroundSize: "200% 100%",
                    }}
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                <div className="absolute inset-[1px] bg-[#09090b] rounded-2xl" />

                {/* Content */}
                <div className="relative flex items-center gap-2 p-3">
                    {/* Completeness indicator (always visible) */}
                    <motion.div
                        className="relative w-12 h-12 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* Circular progress */}
                        <svg className="w-12 h-12 transform -rotate-90">
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                className="text-white/10"
                            />
                            <motion.circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="url(#progress-gradient)"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: completeness / 100 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                style={{
                                    strokeDasharray: "125.6",
                                    strokeDashoffset: 125.6 * (1 - completeness / 100),
                                }}
                            />
                            <defs>
                                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="absolute text-xs font-bold text-white">
                            {completeness}%
                        </span>
                    </motion.div>

                    {/* Action buttons (visible when expanded) */}
                    <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{
                            opacity: isExpanded ? 1 : 0,
                            width: isExpanded ? "auto" : 0,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Cancel button */}
                        <motion.button
                            className="relative group p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onCancel}
                            onMouseEnter={() => setShowTooltip("cancel")}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                            {showTooltip === "cancel" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap"
                                >
                                    Cancelar (Esc)
                                </motion.div>
                            )}
                        </motion.button>

                        {/* Reset button */}
                        <motion.button
                            className="relative group p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                            whileHover={{ scale: 1.05, y: -2, rotate: -180 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onReset}
                            onMouseEnter={() => setShowTooltip("reset")}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <RotateCcw className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                            {showTooltip === "reset" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap"
                                >
                                    Limpar formulário
                                </motion.div>
                            )}
                        </motion.button>

                        {/* Save button */}
                        <motion.button
                            className={`relative group px-6 py-3 rounded-xl font-medium text-white transition-all ${isValid && !isSaving
                                    ? "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
                                    : "bg-white/10 cursor-not-allowed opacity-50"
                                }`}
                            whileHover={isValid && !isSaving ? { scale: 1.05, y: -2 } : {}}
                            whileTap={isValid && !isSaving ? { scale: 0.95 } : {}}
                            onClick={onSave}
                            disabled={!isValid || isSaving}
                            onMouseEnter={() => setShowTooltip("save")}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            {/* Shine effect */}
                            {isValid && !isSaving && (
                                <motion.div
                                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{
                                        x: ["-100%", "100%"],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 1,
                                    }}
                                />
                            )}

                            <span className="relative flex items-center gap-2">
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {isSaving ? "Salvando..." : "Salvar"}
                            </span>

                            {showTooltip === "save" && !isSaving && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap"
                                >
                                    {isValid ? "Salvar (Ctrl+S)" : "Preencha os campos obrigatórios"}
                                </motion.div>
                            )}
                        </motion.button>
                    </motion.div>
                </div>

                {/* Pulse animation when not valid */}
                {!isValid && !isExpanded && (
                    <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-yellow-500/50"
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                    />
                )}
            </motion.div>

            {/* Keyboard shortcut hints */}
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-full right-0 mt-2 px-3 py-2 bg-black/90 rounded-lg text-xs text-white/60 whitespace-nowrap"
                >
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Ctrl+S</kbd> para salvar •{" "}
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> para cancelar
                </motion.div>
            )}
        </motion.div>
    );
}

// Hook para keyboard shortcuts
export function useCommandBarShortcuts({
    onSave,
    onCancel,
    isValid,
}: {
    onSave: () => void;
    onCancel: () => void;
    isValid: boolean;
}) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                if (isValid) {
                    onSave();
                }
            }
            // Esc to cancel
            if (e.key === "Escape") {
                onCancel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onSave, onCancel, isValid]);
}
