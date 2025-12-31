"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Factory,
    Save,
    Loader2,
    FileText,
    CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { organizationalStructureApi, CreateBusinessSegmentInput } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";

interface BusinessSegmentFormProps {
    mode: "create" | "edit";
    segmentId?: string;
}

export function BusinessSegmentForm({ mode, segmentId }: BusinessSegmentFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<CreateBusinessSegmentInput>({
        code: "",
        description: "",
        active: true,
    });

    const loadData = useCallback(async () => {
        if (mode === "edit" && segmentId) {
            setLoading(true);
            try {
                const data = await organizationalStructureApi.getBusinessSegment(segmentId);
                setFormData({
                    code: data.code,
                    description: data.description,
                    active: data.active,
                });
            } catch (error) {
                notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao carregar segmento." });
            } finally {
                setLoading(false);
            }
        }
    }, [segmentId, mode]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (mode === "create") {
                await organizationalStructureApi.createBusinessSegment(formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Segmento criado." });
            } else if (segmentId) {
                await organizationalStructureApi.updateBusinessSegment({ id: segmentId, ...formData });
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Segmento atualizado." });
            }
            router.push("/admin/business-segments/list");
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar segmento." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
    }

    return (
        <div className="relative min-h-screen p-8 text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Button variant="ghost" className="pl-0 gap-2 text-white/60 hover:text-white" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Novo Segmento de Negócio" : "Editar Segmento"}</h1>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-orange-600 hover:bg-orange-500 text-white gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                            <Factory className="w-5 h-5 text-orange-400" />
                            <h3>Dados do Segmento</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Descrição"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="Ex: Têxtil, Metal-Mecânico, Varejo"
                            />
                            <FuturisticInput
                                label="Código"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                                placeholder="Ex: TEX01"
                            />
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-lg", formData.active ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-white/40")}>
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">Status</h4>
                                <p className="text-sm text-white/40">{formData.active ? "Segmento ativo." : "Segmento inativo."}</p>
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
                                <span className="text-white/40">Descrição</span>
                                <span className="text-white">{formData.description || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Código</span>
                                <span className="text-orange-400 font-medium">{formData.code || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
