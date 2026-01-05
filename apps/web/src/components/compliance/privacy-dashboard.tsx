"use client";

import { useState } from "react";
import {
    Shield,
    Download,
    Trash2,
    ChevronRight,
    Info,
    CheckCircle2,
    Lock,
    ExternalLink
} from "lucide-react";
import {
    GlassCard,
    Button,
    cn
} from "@morina/ui";
import { getAuthUser } from "../../lib/auth-client";

export function PrivacyDashboard() {
    const [isExporting, setIsExporting] = useState(false);
    const [lastExport, setLastExport] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const user = getAuthUser();

    const handleExport = async () => {
        if (!user) return;

        setIsExporting(true);
        setMessage(null);

        try {
            const orgId = localStorage.getItem("lastOrganizationId"); // Common pattern in this apps
            const response = await fetch(`/api/users/${user.userId}/lgpd/export`, {
                headers: {
                    "x-org-id": orgId || ""
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `meus-dados-lgpd-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                setLastExport(new Date().toLocaleString());
                setMessage({ type: 'success', text: 'Seus dados foram exportados com sucesso!' });
            } else {
                throw new Error("Falha na exportação");
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao processar exportação de dados.' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteRequest = () => {
        // Implementação do modal de confirmação para direito ao esquecimento
        alert("Para solicitar a exclusão de sua conta e dados (Direito ao Esquecimento), por favor entre em contato com o DPO da organização ou suporte técnico.");
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-8 px-4">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Shield className="h-8 w-8 text-emerald-400" />
                    Privacidade e Proteção de Dados
                </h1>
                <p className="text-white/60 mt-2">
                    Gerencie seus direitos de acordo com a LGPD (Lei Geral de Proteção de Dados).
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Portabilidade de Dados */}
                <GlassCard className="p-6 border-white/10 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Download className="h-6 w-6" />
                        </div>
                        <Badge text="Art. 18, V" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Portabilidade de Dados</h2>
                    <p className="text-sm text-white/50 mb-6 font-light leading-relaxed">
                        Solicite uma cópia completa de todos os seus dados pessoais armazenados em nossa plataforma em formato JSON legível por máquina.
                    </p>
                    <div className="space-y-4">
                        <Button
                            variant="default"
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-lg shadow-emerald-900/20"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? "Processando..." : "Exportar Meus Dados"}
                        </Button>
                        {lastExport && (
                            <p className="text-[10px] text-center text-emerald-400/60 font-mono italic">
                                Útima exportação: {lastExport}
                            </p>
                        )}
                    </div>
                </GlassCard>

                {/* Direito ao Esquecimento */}
                <GlassCard className="p-6 border-white/10 hover:border-red-500/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <Badge text="Art. 18, VI" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Exclusão de Dados</h2>
                    <p className="text-sm text-white/50 mb-6 font-light leading-relaxed">
                        Você tem o direito de solicitar a anonimização ou exclusão de seus dados pessoais quando eles forem desnecessários ou excessivos.
                    </p>
                    <Button
                        variant="outline"
                        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={handleDeleteRequest}
                    >
                        Solicitar Exclusão
                    </Button>
                </GlassCard>
            </div>

            {/* Informações e Transparência */}
            <div className="grid grid-cols-1 gap-6">
                <GlassCard className="p-6 border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3 mb-6">
                        <Lock className="h-5 w-5 text-blue-400" />
                        <h2 className="text-lg font-bold text-white">Segurança e Transparência</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureInfo
                            title="Criptografia Militar"
                            description="Seus dados sensíveis são protegidos por algoritmos AES-256-GCM."
                        />
                        <FeatureInfo
                            title="Controle de Acesso"
                            description="Monitoramos cada acesso aos seus dados com auditoria completa."
                        />
                        <FeatureInfo
                            title="Zero Trust Architecture"
                            description="Tratamos cada requisição como potencialmente não confiável até ser verificada."
                        />
                    </div>
                </GlassCard>
            </div>

            {/* Feedback Messages */}
            {message && (
                <div className={cn(
                    "fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300",
                    message.type === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                    <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

function Badge({ text }: { text: string }) {
    return (
        <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/40 tracking-wider">
            {text}
        </span>
    );
}

function FeatureInfo({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-white/80 font-semibold text-sm">{title}</h4>
            <p className="text-xs text-white/40 leading-relaxed font-light">{description}</p>
        </div>
    );
}
