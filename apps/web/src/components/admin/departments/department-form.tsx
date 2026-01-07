"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import { CodeValidator } from "@/components/ui/code-validator";
import { FuturisticInput } from "@/components/ui/futuristic-ui";
import { CreateDepartmentInput, organizationalStructureApi } from "@/lib/api/organizational-structure";
import { Button, cn } from "@morina/ui";
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    Loader2,
    Network,
    Save
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface DepartmentFormProps {
    mode: "create" | "edit";
    departmentId?: string;
}

export function DepartmentForm({ mode, departmentId }: DepartmentFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<CreateDepartmentInput>({
        name: "",
        code: "",
        description: "",
        type: "DEPARTMENT",
        active: true,
    });

    const loadDepartment = useCallback(async () => {
        if (mode !== "edit" || !departmentId) return;

        try {
            setLoading(true);
            const data = await organizationalStructureApi.getDepartment(departmentId);
            setFormData({
                name: data.name,
                code: data.code,
                description: data.description || "",
                type: data.type,
                active: data.active,
                filialId: data.filialId,
                parentId: data.parentId,
            });
        } catch (error) {
            console.error("Erro ao carregar departamento:", error);
            notificationCenter.add({
                type: "error",
                title: "Erro",
                message: "Não foi possível carregar os dados do departamento."
            });
        } finally {
            setLoading(false);
        }
    }, [departmentId, mode]);

    useEffect(() => {
        loadDepartment();
    }, [loadDepartment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (mode === "create") {
                await organizationalStructureApi.createDepartment(formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Departamento criado." });
            } else if (departmentId) {
                await organizationalStructureApi.updateDepartment({ id: departmentId, ...formData });
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Departamento atualizado." });
            }

            router.push("/admin/departments/list");
        } catch (error) {
            console.error(error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar departamento." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="relative min-h-screen p-8 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Button variant="ghost" className="pl-0 gap-2 text-white/60 hover:text-white" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Novo Departamento" : "Editar Departamento"}</h1>
                    <p className="text-white/40">Gerencie os detalhes desta área organizacional</p>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                            <Network className="w-5 h-5 text-blue-400" />
                            <h3>Informações Principais</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Nome do Departamento"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Ex: Recursos Humanos"
                            />
                            <CodeValidator
                                value={formData.code}
                                onChange={(value: string) => setFormData({ ...formData, code: value })}
                                entity="department"
                                currentId={departmentId}
                                label="Código"
                                placeholder="Ex: RH-01"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60">Descrição</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50 min-h-[100px]"
                                placeholder="Descreva as responsabilidades deste departamento..."
                                value={formData.description || ""}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-2 rounded-lg", formData.active ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-white/40")}>
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">Status</h4>
                                    <p className="text-sm text-white/40">{formData.active ? "Departamento ativo." : "Departamento inativo."}</p>
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
                </div>

                {/* Sidebar / Metadata */}
                <div className="space-y-6">
                    {/* Could add 'Branch' selection here later if API supported linking to branches clearly in list */}
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
                                <span className="text-white/40">Código</span>
                                <span className="font-mono text-white">{formData.code || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Tipo</span>
                                <span className="text-blue-400">{formData.type}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
