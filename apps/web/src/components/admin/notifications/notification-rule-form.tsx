"use client";

import { Button, cn } from "@morina/ui";
import {
    ArrowLeft,
    Bell,
    Save,
    Loader2,
    FileText,
    CheckCircle2,
    Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { notificationRulesApi, CreateNotificationRuleDto, RuleScope } from "@/lib/api/notification-rules";
import { notificationCenter } from "@/shared/ui/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/shared/ui/base/futuristic-ui";

interface NotificationRuleFormProps {
    mode: "create" | "edit";
    ruleId?: string;
}

const SCOPE_OPTIONS = [
    { value: "GLOBAL", label: "Global" },
    { value: "DEPARTMENT", label: "Departamento" },
    { value: "ROLE", label: "Cargo/Função" },
    { value: "USER", label: "Usuário Específico" },
];

const AVAILABLE_CHANNELS = ["EMAIL", "PUSH", "SMS", "WHATSAPP"];

export function NotificationRuleForm({ mode, ruleId }: NotificationRuleFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [events, setEvents] = useState<string[]>([]);

    const [formData, setFormData] = useState<CreateNotificationRuleDto>({
        name: "",
        description: "",
        eventType: "",
        scope: RuleScope.GLOBAL,
        active: true,
        channels: ["PUSH"],
        priority: 0,
    });

    const loadData = useCallback(async () => {
        try {
            const eventsData = await notificationRulesApi.getAvailableEvents();
            setEvents(eventsData.events || ["USER_CREATED", "ORDER_CREATED", "STOCK_LOW", "APPROVAL_REQUIRED"]); // Fallback if API empty

            if (mode === "edit" && ruleId) {
                setLoading(true);
                const data = await notificationRulesApi.findOne(ruleId);
                setFormData({
                    name: data.name,
                    description: data.description,
                    eventType: data.eventType,
                    scope: data.scope,
                    active: data.active,
                    channels: data.channels,
                    priority: data.priority,
                    customTitle: data.customTitle,
                    customMessage: data.customMessage,
                });
                setLoading(false);
            }
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao carregar dados." });
            setLoading(false);
        }
    }, [ruleId, mode]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const toggleChannel = (channel: string) => {
        const current = formData.channels || [];
        if (current.includes(channel)) {
            setFormData({ ...formData, channels: current.filter(c => c !== channel) });
        } else {
            setFormData({ ...formData, channels: [...current, channel] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (mode === "create") {
                await notificationRulesApi.create(formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Regra criada." });
            } else if (ruleId) {
                await notificationRulesApi.update(ruleId, formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Regra atualizada." });
            }
            router.push("/admin/notifications/list");
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar regra." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;
    }

    return (
        <div className="relative min-h-screen p-8 text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Button variant="ghost" className="pl-0 gap-2 text-white/60 hover:text-white" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Nova Regra de Notificação" : "Editar Regra"}</h1>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-cyan-600 hover:bg-cyan-500 text-white gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                            <Bell className="w-5 h-5 text-cyan-400" />
                            <h3>Configuração Principal</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Nome da Regra"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Ex: Alerta de Estoque Baixo"
                            />
                            <FuturisticSelect
                                label="Evento Gatilho"
                                value={formData.eventType}
                                onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                                options={[{ value: "", label: "Selecione o evento..." }, ...events.map(e => ({ value: e, label: e }))]}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticSelect
                                label="Escopo"
                                value={formData.scope}
                                onChange={e => setFormData({ ...formData, scope: e.target.value as RuleScope })}
                                options={[{ value: "", label: "Selecione o escopo..." }, ...SCOPE_OPTIONS]}
                            />
                            <FuturisticInput
                                label="Prioridade (0-100)"
                                value={formData.priority?.toString() || "0"}
                                onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                                type="number"
                            />
                        </div>

                        <FuturisticInput
                            label="Descrição"
                            value={formData.description || ""}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descrição opcional para documentação interna"
                        />
                    </div>

                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-4">
                        <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                            <Info className="w-5 h-5 text-cyan-400" />
                            <h3>Canais de Envio</h3>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            {AVAILABLE_CHANNELS.map(channel => (
                                <div
                                    key={channel}
                                    onClick={() => toggleChannel(channel)}
                                    className={cn(
                                        "cursor-pointer px-4 py-2 rounded-lg border transition-all text-sm font-bold",
                                        (formData.channels || []).includes(channel)
                                            ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                                    )}
                                >
                                    {channel}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-lg", formData.active ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-white/40")}>
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">Status da Regra</h4>
                                <p className="text-sm text-white/40">{formData.active ? "Regra ativa e disparando." : "Regra inativa."}</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(formData.active ? "border-emerald-500 text-emerald-500 hover:bg-emerald-500/10" : "border-white/10")}
                            onClick={() => setFormData({ ...formData, active: !formData.active })}
                        >
                            {formData.active ? "Ativo" : "Inativo"}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Resumo
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Evento</span>
                                <span className="text-cyan-400 font-medium">{formData.eventType || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Escopo</span>
                                <span className="text-white">{formData.scope}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Canais</span>
                                <span className="text-white text-right">{(formData.channels || []).join(", ") || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
