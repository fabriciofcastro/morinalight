"use client";

import { cn } from "@morina/ui";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface CoachSuggestion {
    id: string;
    type: "action" | "tip" | "warning";
    title: string;
    message: string;
    action?: { label: string; href: string };
    dismissible: boolean;
}

interface SidebarCoachAIProps {
    isExpanded?: boolean;
}

export function SidebarCoachAI({ isExpanded = true }: SidebarCoachAIProps) {
    const [isDismissed, setIsDismissed] = useState(false);
    const [suggestion] = useState<CoachSuggestion>({
        id: "1",
        type: "action",
        title: "💡 Dica do Coach",
        message: "Complete seu perfil para acessar todos os recursos.",
        action: {
            label: "Completar Perfil →",
            href: "/profile",
        },
        dismissible: true,
    });

    if (!isExpanded || !suggestion || isDismissed) return null;

    return (
        <div className="px-3 pb-3">
            <div className="relative group">
                {/* Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg opacity-60 blur-sm group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[var(--fg)]">
                                {suggestion.title}
                            </p>
                            <p className="text-[10px] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] mt-0.5 leading-relaxed">
                                {suggestion.message}
                            </p>

                            {suggestion.action && (
                                <button
                                    onClick={() =>
                                        (window.location.href = suggestion.action!.href!)
                                    }
                                    className="mt-1.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                                >
                                    {suggestion.action.label}
                                </button>
                            )}
                        </div>

                        {suggestion.dismissible && (
                            <button
                                onClick={() => setIsDismissed(true)}
                                className="text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
