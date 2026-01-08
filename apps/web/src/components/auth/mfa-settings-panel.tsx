/**
 * MFA Settings Panel Component
 * 
 * Painel de configurações de MFA no perfil do usuário
 */

"use client";

import { useState } from "react";
import { Shield, ShieldCheck, ShieldOff, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/base/button";
import { MFASetupModal } from "./mfa-setup";

interface MFASettingsPanelProps {
    mfaEnabled: boolean;
    onMFAStatusChange?: () => void;
}

export function MFASettingsPanel({ mfaEnabled, onMFAStatusChange }: MFASettingsPanelProps) {
    const [showSetup, setShowSetup] = useState(false);
    const [isDisabling, setIsDisabling] = useState(false);

    const handleDisableMFA = async () => {
        if (!confirm("Tem certeza que deseja desabilitar a autenticação de dois fatores?")) {
            return;
        }

        setIsDisabling(true);

        try {
            // TODO: Chamar API para desabilitar MFA
            // const response = await fetch("/api/auth/mfa/disable", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ token: "..." }),
            // });

            // if (response.ok) {
            //     onMFAStatusChange?.();
            // }
        } catch (error) {
            console.error("Failed to disable MFA:", error);
        } finally {
            setIsDisabling(false);
        }
    };

    const handleRegenerateBackupCodes = async () => {
        try {
            const response = await fetch("/api/auth/mfa/backup-codes", {
                method: "POST",
            });

            if (response.ok) {
                const data = await response.json();
                // TODO: Mostrar novos backup codes
                console.log("New backup codes:", data.backupCodes);
            }
        } catch (error) {
            console.error("Failed to regenerate backup codes:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Autenticação de Dois Fatores (2FA)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança à sua conta
                    </p>
                </div>

                {mfaEnabled ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Ativado</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
                        <ShieldOff className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Desativado</span>
                    </div>
                )}
            </div>

            {/* Content */}
            {mfaEnabled ? (
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            ✓ Sua conta está protegida com autenticação de dois fatores
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={handleRegenerateBackupCodes}
                            variant="outline"
                            className="flex-1"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Gerar Novos Códigos de Backup
                        </Button>

                        <Button
                            onClick={handleDisableMFA}
                            variant="destructive"
                            disabled={isDisabling}
                            className="flex-1"
                        >
                            <ShieldOff className="w-4 h-4 mr-2" />
                            {isDisabling ? "Desabilitando..." : "Desabilitar 2FA"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Recomendamos ativar a autenticação de dois fatores para proteger sua conta
                            contra acessos não autorizados.
                        </p>
                    </div>

                    <Button onClick={() => setShowSetup(true)} className="w-full">
                        <Shield className="w-4 h-4 mr-2" />
                        Ativar Autenticação de Dois Fatores
                    </Button>
                </div>
            )}

            {/* Setup Modal */}
            {showSetup && (
                <MFASetupModal
                    onClose={() => setShowSetup(false)}
                    onSuccess={() => {
                        setShowSetup(false);
                        onMFAStatusChange?.();
                    }}
                />
            )}
        </div>
    );
}
