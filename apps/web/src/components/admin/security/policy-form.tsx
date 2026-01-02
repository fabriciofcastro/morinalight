"use client";

import { useState } from "react";
import {
    Shield,
    Save,
    X,
    AlertCircle,
    Infinity
} from "lucide-react";
import {
    GlassCard,
    GlassInput,
    Button,
    GlassSelect
} from "@/components/ui/futuristic";
import { SecurityPolicy, PolicyEffect } from "@morina/shared-kernel";

interface PolicyFormProps {
    initialData?: Partial<SecurityPolicy>;
    onSave: (data: Partial<SecurityPolicy>) => void;
    onCancel: () => void;
}

export function PolicyForm({ initialData, onSave, onCancel }: PolicyFormProps) {
    const [formData, setFormData] = useState<Partial<SecurityPolicy>>({
        name: initialData?.name || "",
        description: initialData?.description || "",
        effect: initialData?.effect || "ALLOW",
        subject: initialData?.subject || "all",
        action: initialData?.action || "manage",
        priority: initialData?.priority || 0,
        ...initialData
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <GlassCard className="p-6 border-[hsl(var(--primary)/0.2)] shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {initialData?.id ? 'Editar Política' : 'Nova Política PBAC'}
                        </h3>
                        <p className="text-sm text-white/40">Defina os parâmetros globais da política.</p>
                    </div>
                </div>
                <Button variant="secondary" size="icon" onClick={onCancel} className="rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Nome da Política</label>
                            <GlassInput
                                placeholder="Ex: Acesso Restrito Financeiro"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Descrição</label>
                            <textarea
                                className="w-full h-24 bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[hsl(var(--primary)/0.5)] transition-colors resize-none"
                                placeholder="Explique o propósito desta regra..."
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Logic Config */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Efeito</label>
                            <GlassSelect
                                value={formData.effect}
                                onChange={(val: string) => setFormData({ ...formData, effect: val as PolicyEffect })}
                                options={[
                                    { value: 'ALLOW', label: 'PERMITIR' },
                                    { value: 'DENY', label: 'NEGAR' }
                                ]}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Prioridade</label>
                            <GlassInput
                                type="number"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Sujeito (Recurso)</label>
                            <GlassInput
                                placeholder="Ex: Order, Product, all"
                                value={formData.subject as string}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Ações</label>
                            <GlassInput
                                placeholder="Ex: manage, read, approve"
                                value={Array.isArray(formData.action) ? formData.action.join(', ') : formData.action as string}
                                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Conditions Editor Placeholder */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="h-4 w-4 text-[hsl(var(--primary))]" />
                        <h4 className="text-sm font-semibold text-white">Editor de Condições Inteligente</h4>
                    </div>
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                        <Infinity className="h-8 w-8 text-white/10 mb-2" />
                        <span className="text-xs text-white/30">Interface de Lógica Proposicional em desenvolvimento</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button variant="secondary" type="button" onClick={onCancel}>
                        Descartar
                    </Button>
                    <Button variant="primary" type="submit" className="min-w-[120px]">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Política
                    </Button>
                </div>
            </form>
        </GlassCard>
    );
}
