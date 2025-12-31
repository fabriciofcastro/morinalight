"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Briefcase,
    CheckCircle2,
    DollarSign,
    Save,
    Loader2,
    FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { organizationalStructureApi, CreatePositionInput } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";

interface PositionFormProps {
    mode: "create" | "edit";
    positionId?: string;
}

const SENIORITY_OPTIONS = [
    { value: "JUNIOR", label: "Júnior" },
    { value: "PLENO", label: "Pleno" },
    { value: "SENIOR", label: "Sênior" },
    { value: "ESPECIALISTA", label: "Especialista" },
    { value: "COORDENADOR", label: "Coordenador" },
    { value: "GERENTE", label: "Gerente" },
    { value: "DIRETOR", label: "Diretor" },
];

export function PositionForm({ mode, positionId }: PositionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<CreatePositionInput>({
        name: "",
        code: "",
        description: "",
        seniority: "JUNIOR",
        baseSalary: 0,
        active: true,
        responsabilidades: "",
        requisitos: "",
        salarioMin: 0,
        salarioMax: 0,
    });

    const loadPosition = useCallback(async () => {
        if (mode !== "edit" || !positionId) return;
        try {
            setLoading(true);
            const data = await organizationalStructureApi.getPosition(positionId);
            setFormData({
                name: data.name,
                code: data.code,
                description: data.description || "",
                seniority: data.seniority,
                baseSalary: data.baseSalary || 0,
                active: data.active,
                responsabilidades: data.responsabilidades || "",
                requisitos: data.requisitos || "",
                salarioMin: data.salarioMin || 0,
                salarioMax: data.salarioMax || 0,
            });
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Não foi possível carregar o cargo." });
        } finally {
            setLoading(false);
        }
    }, [positionId, mode]);

    useEffect(() => {
        loadPosition();
    }, [loadPosition]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (mode === "create") {
                await organizationalStructureApi.createPosition(formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Cargo criado." });
            } else if (positionId) {
                await organizationalStructureApi.updatePosition({ id: positionId, ...formData });
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Cargo atualizado." });
            }
            router.push("/admin/positions/list");
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar cargo." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
    }

    return (
        <div className="relative min-h-screen p-8 text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Button variant="ghost" className="pl-0 gap-2 text-white/60 hover:text-white" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Novo Cargo" : "Editar Cargo"}</h1>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                            <Briefcase className="w-5 h-5 text-emerald-400" />
                            <h3>Dados do Cargo</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Nome do Cargo"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Ex: Desenvolvedor Full Stack"
                            />
                            <FuturisticInput
                                label="Código"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                                placeholder="Ex: DEV-FS"
                            />
                            <FuturisticSelect
                                label="Senioridade"
                                value={formData.seniority}
                                onChange={val => setFormData({ ...formData, seniority: val })}
                                options={SENIORITY_OPTIONS}
                                placeholder="Selecione..."
                            />
                            <FuturisticInput
                                label="Salário Base"
                                type="number"
                                icon={DollarSign}
                                value={formData.baseSalary?.toString()}
                                onChange={e => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h4 className="text-sm font-medium text-white/80">Faixa Salarial</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <FuturisticInput
                                    label="Mínimo"
                                    type="number"
                                    value={formData.salarioMin?.toString()}
                                    onChange={e => setFormData({ ...formData, salarioMin: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                                <FuturisticInput
                                    label="Máximo"
                                    type="number"
                                    value={formData.salarioMax?.toString()}
                                    onChange={e => setFormData({ ...formData, salarioMax: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Descrição</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 min-h-[80px]"
                                    value={formData.description || ""}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Responsabilidades</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 min-h-[100px]"
                                    value={formData.responsabilidades || ""}
                                    onChange={e => setFormData({ ...formData, responsabilidades: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Requisitos</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 min-h-[100px]"
                                    value={formData.requisitos || ""}
                                    onChange={e => setFormData({ ...formData, requisitos: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-lg", formData.active ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-white/40")}>
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">Status</h4>
                                <p className="text-sm text-white/40">{formData.active ? "Cargo ativo." : "Cargo inativo."}</p>
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
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Resumo
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Nome</span>
                                <span className="text-white">{formData.name || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Nível</span>
                                <span className="text-emerald-400 font-medium">{formData.seniority || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
