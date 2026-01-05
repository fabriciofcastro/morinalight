
"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Button, GlassCard, toast } from "@morina/ui";
import { Fingerprint, Loader2, Plus, Shield, ShieldCheck } from "lucide-react";

export function PasskeySettings() {
    const [loading, setLoading] = useState(false);
    const [passkeys, setPasskeys] = useState<any[]>([]); // TODO: Fetch existing passkeys

    const handleRegister = async () => {
        setLoading(true);
        try {
            // 1. Get options from backend
            const resp = await fetch("/api/auth/webauthn/register/start");
            const options = await resp.json();

            if (options.error) throw new Error(options.error);

            // 2. Browser native prompt
            const attResp = await startRegistration(options);

            // 3. Verify with backend
            const verificationResp = await fetch("/api/auth/webauthn/register/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ response: attResp }),
            });

            const verificationJSON = await verificationResp.json();

            if (verificationJSON && verificationJSON.verified) {
                toast.success("Chave de segurança (Passkey) adicionada com sucesso!");
                // Reload passkeys logic here
            } else {
                throw new Error("Falha na verificação da chave.");
            }
        } catch (error: any) {
            console.error(error);
            if (error.name === "InvalidStateError") {
                toast.error("Este dispositivo já está registrado.");
            } else {
                toast.error(error.message || "Erro ao registrar Passkey.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="p-6 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Fingerprint className="h-5 w-5 text-[hsl(var(--primary))]" />
                        Chaves de Acesso (Passkeys)
                    </h3>
                    <p className="text-sm text-white/60 mt-1 max-w-lg">
                        Faça login sem senha usando FaceID, TouchID ou Chaves de Segurança físicas.
                        É a forma mais segura de proteger sua conta contra phishing.
                    </p>
                </div>
                <Button
                    onClick={handleRegister}
                    disabled={loading}
                    className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/90] text-black font-bold"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Adicionar Chave
                </Button>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                {passkeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-white/40">
                        <Shield className="h-12 w-12 mb-3 opacity-20" />
                        <p>Nenhuma chave configurada.</p>
                        <p className="text-xs">Configure agora para aumentar sua segurança.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* List would go here */}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 p-3 rounded border border-green-500/20">
                <ShieldCheck className="h-4 w-4" />
                <span>WebAuthn FIDO2 Integrado e Ativo.</span>
            </div>
        </GlassCard>
    );
}
