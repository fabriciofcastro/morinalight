"use client";

import { Lock, Shield, Activity, Smartphone, Monitor, MapPin, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { FuturisticSelect, FuturisticInput } from "@/components/ui/futuristic-ui";
import { SectionShell } from "../shared/section-shell";

interface SecurityTabProps {
    formData: any;
    setFormData: (data: any) => void;
}

export function SecurityTab({ formData, setFormData }: SecurityTabProps) {
    const [show2FASetup, setShow2FASetup] = useState(false);

    // Mock data para demonstração
    const activeSessions = [
        { id: "1", device: "Chrome - Windows", location: "São Paulo, BR", ip: "192.168.1.100", lastActive: "Agora" },
        { id: "2", device: "Safari - iPhone", location: "São Paulo, BR", ip: "192.168.1.101", lastActive: "2h atrás" },
    ];

    const recentActivity = [
        { action: "Login bem-sucedido", ip: "192.168.1.100", time: "Há 5 min", success: true },
        { action: "Alteração de dados", ip: "192.168.1.100", time: "Há 1h", success: true },
        { action: "Tentativa de login falha", ip: "203.0.113.45", time: "Ontem 22:30", success: false },
    ];

    return (
        <div className="space-y-6">
            {/* Política de Senhas & 2FA */}
            <SectionShell title="Autenticação">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FuturisticSelect
                        label="Política de Senhas"
                        value={formData.security?.passwordPolicy || "strong"}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                security: { ...formData.security, passwordPolicy: e.target.value },
                            })
                        }
                    >
                        <option value="medium" className="bg-[#09090b]">
                            Média (Letras e números, mín. 8 caracteres)
                        </option>
                        <option value="strong" className="bg-[#09090b]">
                            Forte (Símbolos, Maiúsculas, mín. 12 caracteres)
                        </option>
                        <option value="enterprise" className="bg-[#09090b]">
                            Enterprise (Complexidade máxima + Expiração 90 dias)
                        </option>
                    </FuturisticSelect>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-[hsl(var(--primary))]" />
                            Autenticação em Dois Fatores (2FA)
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShow2FASetup(!show2FASetup)}
                                className="flex-1 px-4 py-3 rounded-xl border border-[color-mix(in_oklab,hsl(var(--primary))_40%,transparent_60%)] bg-gradient-to-r from-[hsl(var(--primary)/0.15)] to-[hsl(var(--primary)/0.05)] text-white hover:from-[hsl(var(--primary)/0.25)] hover:to-[hsl(var(--primary)/0.15)] hover:border-[hsl(var(--primary))] transition-all text-sm font-medium"
                            >
                                {formData.security?.twoFactorEnabled ? "✓ Ativado" : "Configurar 2FA"}
                            </button>
                            {formData.security?.twoFactorEnabled && (
                                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Protegido
                                </span>
                            )}
                        </div>
                        {show2FASetup && (
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 space-y-2">
                                <p>• Escaneie o QR Code com Google Authenticator</p>
                                <p>• Digite o código de 6 dígitos gerado</p>
                                <p>• Guarde os códigos de backup em local seguro</p>
                                <FuturisticInput
                                    label="Código de Verificação"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </SectionShell>

            {/* Sessões Ativas */}
            <SectionShell title="Sessões Ativas">
                <div className="space-y-3">
                    {activeSessions.map((session) => (
                        <div
                            key={session.id}
                            className="group relative p-4 rounded-xl border border-[color-mix(in_oklab,hsl(var(--border))_50%,transparent_50%)] bg-[color-mix(in_oklab,hsl(var(--surface))_30%,black_70%)] hover:bg-[color-mix(in_oklab,hsl(var(--surface))_40%,black_60%)] hover:border-[hsl(var(--primary)/0.3)] transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <Monitor className="w-5 h-5 text-[hsl(var(--primary))] mt-1" />
                                    <div>
                                        <p className="font-semibold text-white">{session.device}</p>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {session.location}
                                            </span>
                                            <span className="font-mono text-xs">{session.ip}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/40">{session.lastActive}</p>
                                    <button className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors">
                                        Encerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionShell>

            {/* Log de Atividades */}
            <SectionShell title="Atividades Recentes">
                <div className="space-y-2">
                    {recentActivity.map((activity, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {activity.success ? (
                                    <Activity className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                )}
                                <div>
                                    <p className={`text-sm font-medium ${activity.success ? "text-white" : "text-red-300"}`}>
                                        {activity.action}
                                    </p>
                                    <p className="text-xs text-white/40 font-mono">{activity.ip}</p>
                                </div>
                            </div>
                            <span className="text-xs text-white/40">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </SectionShell>

            {/* Segurança Avançada */}
            <SectionShell title="Configurações Avançadas">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FuturisticSelect
                        label="Limite de Tentativas de Login"
                        value={formData.security?.loginAttempts || "5"}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                security: { ...formData.security, loginAttempts: e.target.value },
                            })
                        }
                    >
                        <option value="3" className="bg-[#09090b]">3 tentativas</option>
                        <option value="5" className="bg-[#09090b]">5 tentativas</option>
                        <option value="10" className="bg-[#09090b]">10 tentativas</option>
                    </FuturisticSelect>

                    <FuturisticSelect
                        label="Tempo de Bloqueio"
                        value={formData.security?.lockoutDuration || "30"}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                security: { ...formData.security, lockoutDuration: e.target.value },
                            })
                        }
                    >
                        <option value="15" className="bg-[#09090b]">15 minutos</option>
                        <option value="30" className="bg-[#09090b]">30 minutos</option>
                        <option value="60" className="bg-[#09090b]">1 hora</option>
                        <option value="1440" className="bg-[#09090b]">24 horas</option>
                    </FuturisticSelect>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-200/90">
                        <p className="font-semibold mb-1">Recomendação de Segurança</p>
                        <p className="text-yellow-200/70">
                            Ative o 2FA e revise periodicamente as sessões ativas. Configure alertas para tentativas de login falhadas.
                        </p>
                    </div>
                </div>
            </SectionShell>
        </div>
    );
}
