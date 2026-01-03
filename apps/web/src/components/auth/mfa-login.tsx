/**
 * MFA Login Component
 * 
 * Componente para verificação de MFA durante o login
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MFAVerificationInput } from "./mfa-verification-input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/Alert";
import { Shield, AlertCircle } from "lucide-react";

interface MFALoginProps {
    email: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function MFALogin({ email, onSuccess, onCancel }: MFALoginProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [backupCode, setBackupCode] = useState("");

    const handleVerifyCode = async (code: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/login/verify-mfa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    token: code,
                    isBackupCode: useBackupCode,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Verification failed");
            }

            // Sucesso
            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleBackupCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (backupCode.length === 8) {
            await handleVerifyCode(backupCode);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex justify-center">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold">Verificação de Dois Fatores</h2>
                <p className="text-sm text-muted-foreground">
                    {useBackupCode
                        ? "Insira um código de backup"
                        : "Insira o código de 6 dígitos do seu autenticador"}
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert
                    type="error"
                    message={error}
                />
            )}

            {/* Input */}
            {useBackupCode ? (
                <form onSubmit={handleBackupCodeSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={backupCode}
                        onChange={(e) =>
                            setBackupCode(e.target.value.toUpperCase().slice(0, 8))
                        }
                        placeholder="XXXXXXXX"
                        className="w-full text-center text-2xl font-mono tracking-widest uppercase px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={loading}
                        maxLength={8}
                    />

                    <Button type="submit" className="w-full" disabled={loading || backupCode.length !== 8}>
                        {loading ? "Verificando..." : "Verificar Código de Backup"}
                    </Button>
                </form>
            ) : (
                <div className="space-y-4">
                    <MFAVerificationInput
                        onComplete={handleVerifyCode}
                        disabled={loading}
                        error={!!error}
                    />
                </div>
            )}

            {/* Toggle Backup Code */}
            <div className="text-center">
                <button
                    type="button"
                    onClick={() => {
                        setUseBackupCode(!useBackupCode);
                        setError(null);
                        setBackupCode("");
                    }}
                    className="text-sm text-primary hover:underline"
                    disabled={loading}
                >
                    {useBackupCode
                        ? "Usar código do autenticador"
                        : "Usar código de backup"}
                </button>
            </div>

            {/* Cancel */}
            {onCancel && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="w-full"
                    disabled={loading}
                >
                    Cancelar
                </Button>
            )}
        </div>
    );
}
