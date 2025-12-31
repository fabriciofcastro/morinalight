"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    Layers,
    Save,
    Loader2,
    FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { organizationalStructureApi, CreateSectorInput } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";

interface SectorFormProps {
    mode: "create" | "edit";
    sectorId?: string;
}

export function SectorForm({ mode, sectorId }: SectorFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState<{ value: string, label: string }[]>([]); // To populate select

    const [formData, setFormData] = useState<CreateSectorInput>({
        name: "",
        code: "",
        description: "",
        type: "SECTOR",
        active: true,
        departmentId: "", // Required usually
    });

    const loadDependencies = useCallback(async () => {
        try {
            const deps = await organizationalStructureApi.getDepartments();
            const data = Array.isArray(deps) ? deps : (deps as any).data || [];
            setDepartments(data.map((d: any) => ({ value: d.id, label: d.name })));
        } catch (e) { console.error(e); }
    }, []);

    const loadSector = useCallback(async () => {
        if (mode !== "edit" || !sectorId) return;
        try {
            setLoading(true);
            const data = await organizationalStructureApi.getSector(sectorId);
            setFormData({
                name: data.name,
                code: data.code,
                description: data.description || "",
                type: data.type,
                active: data.active,
                departmentId: data.departmentId,
                filialId: data.filialId,
                parentId: data.parentId,
            });
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Não foi possível carregar o setor." });
        } finally {
            setLoading(false);
        }
    }, [sectorId, mode]);

    useEffect(() => {
        loadDependencies();
        loadSector();
    }, [loadSector, loadDependencies]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.departmentId) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Selecione um departamento para o setor." });
            return;
        }

        setSaving(true);
        try {
            if (mode === "create") {
                await organizationalStructureApi.createSector(formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Setor criado." });
            } else if (sectorId) {
                await organizationalStructureApi.updateSector({ id: sectorId, ...formData });
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Setor atualizado." });
            }
            router.push("/admin/sectors/list");
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar setor." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="relative min-h-screen p-8 text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Button variant="ghost" className="pl-0 gap-2 text-white/60 hover:text-white" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Novo Setor" : "Editar Setor"}</h1>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                            <Layers className="w-5 h-5 text-indigo-400" />
                            <h3>Dados do Setor</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Nome do Setor"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Ex: Contas a Pagar"
                            />
                            <FuturisticInput
                                label="Código"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                                placeholder="Ex: CP-01"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60">Departamento Vinculado</label>
                            <FuturisticSelect
                                value={formData.departmentId}
                                onChange={val => setFormData({ ...formData, departmentId: val })}
                                options={departments}
                                placeholder="Selecione um departamento..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60">Descrição</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500/50 min-h-[100px]"
                                placeholder="Atividades do setor..."
                                value={formData.description || ""}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-lg", formData.active ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-white/40")}>
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">Status</h4>
                                <p className="text-sm text-white/40">{formData.active ? "Setor ativo." : "Setor inativo."}</p>
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
                                <span className="text-white/40">Dep ID</span>
                                <span className="text-white">{formData.departmentId ? formData.departmentId.substring(0, 8) + '...' : "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
