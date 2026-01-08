"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/ui/base/alert-dialog";
import { Lock, Smartphone } from "lucide-react";
import { FuturisticInput } from "@/shared/ui/base/futuristic-ui";
import { useState } from "react";

interface SensitiveActionConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

export function SensitiveActionConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Confirmação de Segurança",
    description = "Esta é uma alteração crítica. Por favor, confirme sua identidade inserindo o código de autenticação de dois fatores (2FA).",
}: SensitiveActionConfirmDialogProps) {
    const [code, setCode] = useState("");
    const [error, setError] = useState(false);

    const handleConfirm = () => {
        // Mock validation
        if (code === "123456" || code.length === 6) {
            onConfirm();
        } else {
            setError(true);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-[#09090b] border border-white/10 max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)]">
                            <Lock className="w-6 h-6 text-[hsl(var(--primary))]" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-white">
                            {title}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-white/70 space-y-4 pt-2">
                        <p>
                            {description}
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between text-xs text-white/50 bg-white/5 p-3 rounded-lg">
                                <span className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    Enviado para seu App Autenticador
                                </span>
                                <span className="font-mono">Google Auth</span>
                            </div>

                            <div className="relative">
                                <FuturisticInput
                                    label="Código 2FA"
                                    placeholder="000 000"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value.replace(/\D/g, '').substring(0, 6));
                                        setError(false);
                                    }}
                                    className="text-center text-xl tracking-[0.5em] font-mono"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-xs text-red-400 mt-1 absolute -bottom-5">
                                        Código inválido. Tente novamente.
                                    </p>
                                )}
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 mt-6">
                    <AlertDialogCancel className="border-white/10 text-white hover:bg-white/5 hover:text-white">
                        Cancelar
                    </AlertDialogCancel>
                    <button
                        onClick={handleConfirm}
                        disabled={code.length < 6}
                        className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                    >
                        Confirmar Alteração
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
