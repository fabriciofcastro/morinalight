"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";
import { organizationalStructureApi } from "@/lib/api/organizational-structure";

export default function NewWorkflowPolicyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        module: "",
        flowType: "APPROVAL",
        config: "{}",
        active: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let parsedConfig;
            try {
                parsedConfig = JSON.parse(formData.config);
            } catch (err) {
                alert("Configuração inválida. Certifique-se de que é um JSON válido.");
                return;
            }

            setLoading(true);
            await organizationalStructureApi.createWorkflowPolicy({
                ...formData,
                config: parsedConfig,
            });
            router.push("/admin/workflow-policies");
        } catch (error) {
            console.error("Failed to create workflow policy", error);
            alert("Erro ao criar workflow. Verifique os dados e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageBackground variant="dashboard" />
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/workflow-policies">
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Novo Workflow</h1>
                        <p className="text-sm text-white/50">Configure uma nova política de workflow</p>
                    </div>
                </div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Módulo</label>
                            <input
                                type="text"
                                required
                                value={formData.module}
                                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                placeholder="Ex: PURCHASING"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Fluxo</label>
                            <select
                                value={formData.flowType}
                                onChange={(e) => setFormData({ ...formData, flowType: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white focus:border-[hsl(var(--primary))] focus:outline-none appearance-none"
                            >
                                <option value="APPROVAL" className="bg-slate-900">Aprovação</option>
                                <option value="NOTIFICATION" className="bg-slate-900">Notificação</option>
                                <option value="AUTOMATION" className="bg-slate-900">Automação</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Configuração (JSON)</label>
                            <textarea
                                required
                                value={formData.config}
                                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white font-mono text-sm placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none h-48 resize-none"
                                placeholder='{"steps": [...]}'
                            />
                            <p className="mt-1 text-xs text-white/30">Insira a configuração do workflow em formato JSON.</p>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                            />
                            <label htmlFor="active" className="text-sm font-medium text-white/70 cursor-pointer">
                                Workflow Ativo
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <Link href="/admin/workflow-policies">
                            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                                Cancelar
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--primary))/0.8] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Salvar Workflow
                        </button>
                    </div>
                </motion.form>
            </div>
        </>
    );
}
