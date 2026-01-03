"use client";

import { useUserTrustedDevices, useRevokeTrustedDevice } from "@/hooks/queries/use-user-security";
import {
    Shield,
    Smartphone,
    Trash2,
    Clock,
    Globe,
    Monitor,
    ShieldCheck,
    ShieldAlert,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type UserSecurityTabProps = {
    userId: string;
    user: {
        twoFactorEnabled: boolean;
        twoFactorEnabledAt?: string | null;
    };
};

export function UserSecurityTab({ userId, user }: UserSecurityTabProps) {
    const { data: devices, isLoading } = useUserTrustedDevices(userId);
    const revokeMutation = useRevokeTrustedDevice();
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const handleRevoke = async (deviceId: string) => {
        await revokeMutation.mutateAsync({ userId, deviceId });
        setRevokingId(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* MFA Status Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${user.twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {user.twoFactorEnabled ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white">Autenticação de Dois Fatores (2FA)</h4>
                            <p className="text-sm text-white/50">
                                {user.twoFactorEnabled
                                    ? `Ativada em ${user.twoFactorEnabledAt ? format(new Date(user.twoFactorEnabledAt), 'PP', { locale: ptBR }) : 'data desconhecida'}`
                                    : "Proteja sua conta adicionando uma camada extra de segurança."}
                            </p>
                        </div>
                    </div>
                    <Badge variant={user.twoFactorEnabled ? "default" : "outline"} className={user.twoFactorEnabled ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-amber-500/20 text-amber-400 border-amber-500/20"}>
                        {user.twoFactorEnabled ? "Protegido" : "Vulnerável"}
                    </Badge>
                </div>
            </div>

            {/* Trusted Devices Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-blue-400" />
                            Dispositivos Confiáveis
                        </h4>
                        <p className="text-sm text-white/50">Dispositivos que não exigem MFA ao fazer login.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
                        ))}
                    </div>
                ) : devices && devices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {devices.map((device) => (
                            <div key={device.id} className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.05]">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                            {device.os?.toLowerCase().includes('win') ? <Monitor className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{device.name}</div>
                                            <div className="text-xs text-white/40 flex items-center gap-2 mt-1">
                                                <Globe className="h-3 w-3" />
                                                {device.ip} {device.location ? `• ${device.location}` : ''}
                                            </div>
                                            <div className="text-xs text-white/40 flex items-center gap-2 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                Último uso: {format(new Date(device.lastUsed), "PPp", { locale: ptBR })}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setRevokingId(device.id)}
                                        className="text-white/20 hover:text-red-400 transition-colors p-1"
                                        title="Revogar acesso"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center bg-white/[0.01]">
                        <AlertCircle className="h-8 w-8 text-white/20 mx-auto mb-3" />
                        <p className="text-white/40">Nenhum dispositivo confiável registrado ainda.</p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={!!revokingId}
                onOpenChange={(open) => !open && setRevokingId(null)}
                title="Revogar Dispositivo"
                description="Este dispositivo voltará a solicitar o código MFA no próximo login. Deseja continuar?"
                confirmLabel="Revogar"
                variant="danger"
                onConfirm={() => { if (revokingId) void handleRevoke(revokingId); }}
                isLoading={revokeMutation.isPending}
            />
        </div>
    );
}
