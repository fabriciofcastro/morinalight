"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Key,
    Save,
    Loader2,
    FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { permissionsApi, CreatePermissionInput } from "@/lib/api/permissions";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface PermissionFormProps {
    mode: "create" | "edit";
    permissionId?: string;
}

const ACTION_OPTIONS = [
    { value: "READ", label: "Leitura (READ)" },
    { value: "WRITE", label: "Escrita (WRITE)" },
    { value: "DELETE", label: "Exclusão (DELETE)" },
    { value: "ADMIN", label: "Administração (ADMIN)" },
    { value: "APPROVE", label: "Aprovação (APPROVE)" },
];

export function PermissionForm({ mode, permissionId }: PermissionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<CreatePermissionInput>({
        name: "",
        code: "",
        description: "",
        module: "",
        level: "READ", // Assuming level maps to Action
    });

    const loadPermission = useCallback(async () => {
        if (mode !== "edit" || !permissionId) return;
        try {
            setLoading(true);
            const data = await permissionsApi.getPermission(permissionId);
            // If code is "resource:action", split it or use as is depending on backend expectation.
            // The form will use split fields for UX but combine for logic if needed.
            // However DTO asks for 'code' which might be 'resource:action'.
            // And 'level' which is 'action'.
            // Let's assume we edit fields and combine them.

            setFormData({
                name: data.name,
                code: data.code,
                description: data.description || "",
                module: data.module,
                level: data.level,
            });
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Não foi possível carregar a permissão." });
        } finally {
            setLoading(false);
        }
    }, [permissionId, mode]);

    useEffect(() => {
        loadPermission();
    }, [loadPermission]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (mode === "create") {
                await permissionsApi.createPermission(formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Permissão criada." });
            } else if (permissionId) {
                await permissionsApi.updatePermission({ id: permissionId, ...formData });
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Permissão atualizada." });
            }
            router.push("/admin/access/permissions/list");
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar permissão." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
    }

    return (
        <AllowedGuard I={mode === "edit" ? "update" : "create"} a="Permission" redirectTo="/admin/access/permissions/list">
            <div className="relative min-h-screen p-8 text-white">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button variant="ghost" className="pl-0 gap-2 text-white/60 hover:text-white" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Button>
                        <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Nova Permissão" : "Editar Permissão"}</h1>
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
                                <Key className="w-5 h-5 text-violet-400" />
                                <h3>Dados da Permissão</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FuturisticInput
                                    label="Nome"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Ex: Visualizar Relatórios"
                                />
                                <FuturisticInput
                                    label="Módulo"
                                    value={formData.module}
                                    onChange={e => setFormData({ ...formData, module: e.target.value })}
                                    required
                                    placeholder="Ex: FINANCEIRO"
                                />
                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FuturisticInput
                                            label="Código / Recurso"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                                            required
                                            placeholder="Ex: invoices:view ou invoices"
                                        />
                                        <FuturisticSelect
                                            label="Nível de Acesso (Ação)"
                                            value={formData.level}
                                            onChange={val => setFormData({ ...formData, level: val })}
                                            options={ACTION_OPTIONS}
                                            placeholder="Selecione..."
                                        />
                                    </div>
                                    <p className="text-xs text-white/40 mt-2 ml-1">Para códigos compostos, use o formato <code>recurso:ação</code> (ex: users:create). Se usar formato simples, o nível será usado como ação.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Descrição</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500/50 min-h-[100px]"
                                    placeholder="Explique o propósito desta permissão..."
                                    value={formData.description || ""}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
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
                                    <span className="text-white/40">Módulo</span>
                                    <span className="text-violet-400 font-medium">{formData.module || "-"}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-white/40">Código Final</span>
                                    <span className="font-mono text-emerald-400">
                                        {formData.code.includes(':') ? formData.code : `${formData.code}:${formData.level}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AllowedGuard>
    );
}
