"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    GitMerge,
    Save,
    Loader2,
    FileText,
    Plus,
    Trash2,
    UserCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { organizationalStructureApi, CreateWorkflowPolicyInput } from "@/lib/api/organizational-structure";
import { permissionsApi, Role } from "@/lib/api/permissions";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";

interface ApprovalFormProps {
    mode: "create" | "edit";
    policyId?: string;
}

const MODULE_OPTIONS = [
    { value: "PURCHASE_ORDER", label: "Pedidos de Compra" },
    { value: "SALES_ORDER", label: "Pedidos de Venda" },
    { value: "PAYMENT", label: "Pagamentos" },
    { value: "VACATION", label: "Solicitação de Férias" },
    { value: "EXPENSE", label: "Reembolso de Despesas" },
];

const FLOW_TYPE_OPTIONS = [
    { value: "LINEAR", label: "Linear (Sequencial)" },
    { value: "PARALLEL", label: "Paralelo (Todos devem aprovar)" },
    { value: "ANY", label: "Qualquer um (Primeiro que aprovar)" },
];

interface ApprovalStep {
    roleId: string;
    order: number;
}

export function ApprovalForm({ mode, policyId }: ApprovalFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);

    const [formData, setFormData] = useState<CreateWorkflowPolicyInput>({
        module: "",
        flowType: "LINEAR",
        config: { steps: [] },
        active: true,
    });

    const [steps, setSteps] = useState<ApprovalStep[]>([]);

    const loadData = useCallback(async () => {
        try {
            const rolesData = await permissionsApi.getRoles();
            setRoles(rolesData);

            if (mode === "edit" && policyId) {
                setLoading(true);
                const data = await organizationalStructureApi.getWorkflowPolicy(policyId);
                setFormData({
                    module: data.module,
                    flowType: data.flowType,
                    config: data.config,
                    active: data.active,
                });
                if (data.config && Array.isArray((data.config as any).steps)) {
                    setSteps((data.config as any).steps);
                }
                setLoading(false);
            }
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao carregar dados." });
            setLoading(false);
        }
    }, [policyId, mode]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addStep = () => {
        setSteps([...steps, { roleId: "", order: steps.length + 1 }]);
    };

    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
        setSteps(newSteps);
    };

    const updateStep = (index: number, roleId: string) => {
        const newSteps = [...steps];
        newSteps[index].roleId = roleId;
        setSteps(newSteps);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            ...formData,
            config: { steps }
        };

        try {
            if (mode === "create") {
                await organizationalStructureApi.createWorkflowPolicy(payload);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Política de aprovação criada." });
            } else if (policyId) {
                await organizationalStructureApi.updateWorkflowPolicy({ id: policyId, ...payload });
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Política atualizada." });
            }
            router.push("/admin/access/approvals/list");
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar política." });
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
                    <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Nova Política de Aprovação" : "Editar Política"}</h1>
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
                            <GitMerge className="w-5 h-5 text-violet-400" />
                            <h3>Configuração do Fluxo</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticSelect
                                label="Módulo Alvo"
                                value={formData.module}
                                onChange={val => setFormData({ ...formData, module: val })}
                                options={MODULE_OPTIONS}
                                placeholder="Selecione o módulo..."
                            />
                            <FuturisticSelect
                                label="Tipo de Fluxo"
                                value={formData.flowType}
                                onChange={val => setFormData({ ...formData, flowType: val })}
                                options={FLOW_TYPE_OPTIONS}
                                placeholder="Selecione o tipo..."
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-white/80">Etapas de Aprovação</h4>
                                <Button type="button" size="sm" variant="outline" onClick={addStep} className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                                    <Plus className="w-4 h-4 mr-2" /> Adicionar Etapa
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {steps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold border border-violet-500/20">
                                            {step.order}
                                        </div>
                                        <div className="flex-1">
                                            <select
                                                className="w-full bg-transparent border-none text-white focus:ring-0 cursor-pointer text-sm"
                                                value={step.roleId}
                                                onChange={e => updateStep(index, e.target.value)}
                                            >
                                                <option value="" className="text-black">Selecione um Cargo/Perfil...</option>
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id} className="text-black">{r.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)} className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                ))}
                                {steps.length === 0 && (
                                    <p className="text-center text-white/30 text-sm py-4 italic border border-white/5 border-dashed rounded-lg">
                                        Nenhuma etapa definida. Adicione pelo menos um aprovador.
                                    </p>
                                )}
                            </div>
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
                                <span className="text-white/40">Módulo</span>
                                <span className="text-white">{MODULE_OPTIONS.find(m => m.value === formData.module)?.label || formData.module || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Steps</span>
                                <span className="text-emerald-400 font-medium">{steps.length} etapa(s)</span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-white/40">Status</span>
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", formData.active ? "bg-emerald-500" : "bg-red-500")} />
                                    <span className={cn("font-medium", formData.active ? "text-emerald-400" : "text-white/40")}>
                                        {formData.active ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-6 border-white/10"
                            onClick={() => setFormData({ ...formData, active: !formData.active })}
                        >
                            {formData.active ? "Desativar Política" : "Ativar Política"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
