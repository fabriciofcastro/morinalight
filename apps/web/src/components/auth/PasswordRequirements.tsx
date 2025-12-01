"use client";

import { cn } from "@morina/ui";
import { Check, X } from "lucide-react";

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
    { label: "Mínimo 6 caracteres", test: (p) => p.length >= 6 },
    { label: "Letra maiúscula", test: (p) => /[A-Z]/.test(p) },
    { label: "Letra minúscula", test: (p) => /[a-z]/.test(p) },
    { label: "Número", test: (p) => /[0-9]/.test(p) },
    { label: "Caractere especial", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordRequirements({ password }: { password: string }) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-white/70">Requisitos de Senha:</p>
            <div className="space-y-1.5">
                {requirements.map((req, i) => {
                    const met = req.test(password);
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded-full transition-colors",
                                    met ? "bg-emerald-500/20" : "bg-white/10"
                                )}
                            >
                                {met ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                    <X className="h-3 w-3 text-white/30" />
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-xs transition-colors",
                                    met ? "text-emerald-400 font-medium" : "text-white/40"
                                )}
                            >
                                {req.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {password && (
                <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">Força:</span>
                        <span
                            className={cn(
                                "font-semibold",
                                requirements.filter((r) => r.test(password)).length <= 2
                                    ? "text-red-400"
                                    : requirements.filter((r) => r.test(password)).length <= 3
                                        ? "text-yellow-400"
                                        : "text-emerald-400"
                            )}
                        >
                            {requirements.filter((r) => r.test(password)).length <= 2
                                ? "Fraca"
                                : requirements.filter((r) => r.test(password)).length <= 3
                                    ? "Média"
                                    : "Forte"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
