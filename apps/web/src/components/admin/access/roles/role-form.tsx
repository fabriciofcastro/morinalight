"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    Shield,
    Save,
    Loader2,
    FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { permissionsApi, CreateRoleInput } from "@/lib/api/permissions";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";

interface RoleFormProps {
    mode: "create" | "edit";
    roleId?: string;
}

const SCOPE_OPTIONS = [
    { value: "GLOBAL", label: "Global (Toda a organização)" },
    { value: "FILIAL", label: "Filial (Restrito à unidade)" },
    { value: "DEPARTAMENTO", label: "Departamento" },
    { value: "SETOR", label: "Setor" },
];

export function RoleForm({ mode, roleId }: RoleFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<CreateRoleInput>({
        name: "",
        code: "",
        description: "",
        scope: "GLOBAL",
        active: true,
    });

    const loadRole = useCallback(async () => {
        if (mode !== "edit" || !roleId) return;
        try {
            setLoading(true);
            const data = await permissionsApi.getRole(roleId);
            setFormData({
                name: data.name,
                code: data.code,
                description: data.description || "",
                scope: data.scope,
                active: data.active,
            });
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Não foi possível carregar o perfil." });
        } finally {
            setLoading(false);
        }
    }, [roleId, mode]);

    useEffect(() => {
        loadRole();
    }, [loadRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (mode === "create") {
                await permissionsApi.createRole(formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Perfil criado." });
            } else if (roleId) {
                await permissionsApi.updateRole({ id: roleId, ...formData });
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Perfil atualizado." });
            }
            router.push("/admin/access/roles/list");
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar perfil." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
    }

    return (
        <div className="relative min-h-screen p-8 text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Button variant="ghost" className="pl-0 gap-2 text-white/60 hover:text-white" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Novo Perfil de Acesso" : "Editar Perfil"}</h1>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-violet-600 hover:bg-violet-500 text-white gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                            <Shield className="w-5 h-5 text-violet-400" />
                            <h3>Dados do Perfil</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Nome do Perfil"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Ex: Gerente Financeiro"
                            />
                            <FuturisticInput
                                label="Código"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                                placeholder="Ex: ROLE_FIN_MGR"
                            />
                            <div className="md:col-span-2">
                                <FuturisticSelect
                                    label="Escopo de Acesso"
                                    value={formData.scope}
                                    onChange={val => setFormData({ ...formData, scope: val })}
                                    options={SCOPE_OPTIONS}
                                    placeholder="Selecione o escopo..."
                                />
                                <p className="text-xs text-white/40 mt-1 ml-1">Define a abrangência de dados que este perfil pode visualizar.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60">Descrição</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500/50 min-h-[100px]"
                                placeholder="Descreva as atribuições deste perfil..."
                                value={formData.description || ""}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                                <p className="text-sm text-white/40">{formData.active ? "Perfil ativo." : "Perfil inativo."}</p>
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
                                <span className="text-white/40">Nome</span>
                                <span className="text-white">{formData.name || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Escopo</span>
                                <span className="text-violet-400 font-medium">{formData.scope || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
