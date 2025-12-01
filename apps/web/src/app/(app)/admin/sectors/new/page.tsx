"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";
import { organizationalStructureApi, Department, Branch } from "@/lib/api/organizational-structure";

export default function NewSectorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        type: "OPERACIONAL",
        departmentId: "",
        filialId: "",
        active: true,
        description: "",
    });

    useEffect(() => {
        loadDependencies();
    }, []);

    const loadDependencies = async () => {
        try {
            const [depts, brs] = await Promise.all([
                organizationalStructureApi.getDepartments(),
                organizationalStructureApi.getBranches(),
            ]);
            setDepartments(depts);
            setBranches(brs);
        } catch (error) {
            console.error("Failed to load dependencies", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.departmentId) {
            alert("Selecione um departamento.");
            return;
        }

        try {
            setLoading(true);
            await organizationalStructureApi.createSector({
                ...formData,
                filialId: formData.filialId || undefined,
            });
            router.push("/admin/sectors");
        } catch (error) {
            console.error("Failed to create sector", error);
            alert("Erro ao criar setor. Verifique os dados e tente novamente.");
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
                    <Link href="/admin/sectors">
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Novo Setor</h1>
                        <p className="text-sm text-white/50">Preencha os dados do novo setor</p>
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
                            <label className="block text-sm font-medium text-white/70 mb-1">Nome do Setor</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                placeholder="Ex: Corte e Costura"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Código</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                    placeholder="Ex: CORT"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Tipo</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white focus:border-[hsl(var(--primary))] focus:outline-none appearance-none"
                                >
                                    <option value="OPERACIONAL" className="bg-slate-900">Operacional</option>
                                    <option value="GESTAO" className="bg-slate-900">Gestão</option>
                                    <option value="ANALITICO" className="bg-slate-900">Analítico</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Departamento (Obrigatório)</label>
                            <select
                                required
                                value={formData.departmentId}
                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white focus:border-[hsl(var(--primary))] focus:outline-none appearance-none"
                            >
                                <option value="" className="bg-slate-900">Selecione um departamento...</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id} className="bg-slate-900">
                                        {dept.name} ({dept.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Filial (Opcional)</label>
                            <select
                                value={formData.filialId}
                                onChange={(e) => setFormData({ ...formData, filialId: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white focus:border-[hsl(var(--primary))] focus:outline-none appearance-none"
                            >
                                <option value="" className="bg-slate-900">Todas as Filiais (Global)</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id} className="bg-slate-900">
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Descrição</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none h-24 resize-none"
                                placeholder="Descrição das atividades do setor..."
                            />
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
                                Setor Ativo
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <Link href="/admin/sectors">
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
                            Salvar Setor
                        </button>
                    </div>
                </motion.form>
            </div>
        </>
    );
}
