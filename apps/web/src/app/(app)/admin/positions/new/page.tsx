"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";
import { organizationalStructureApi } from "@/lib/api/organizational-structure";

export default function NewPositionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        seniority: "JUNIOR",
        baseSalary: "",
        active: true,
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await organizationalStructureApi.createPosition({
                ...formData,
                baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : undefined,
            });
            router.push("/admin/positions");
        } catch (error) {
            console.error("Failed to create position", error);
            alert("Erro ao criar cargo. Verifique os dados e tente novamente.");
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
                    <Link href="/admin/positions">
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Novo Cargo</h1>
                        <p className="text-sm text-white/50">Preencha os dados do novo cargo</p>
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
                            <label className="block text-sm font-medium text-white/70 mb-1">Nome do Cargo</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                placeholder="Ex: Desenvolvedor Full Stack"
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
                                    placeholder="Ex: DEV-FS"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Senioridade</label>
                                <select
                                    value={formData.seniority}
                                    onChange={(e) => setFormData({ ...formData, seniority: e.target.value })}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white focus:border-[hsl(var(--primary))] focus:outline-none appearance-none"
                                >
                                    <option value="JUNIOR" className="bg-slate-900">Júnior</option>
                                    <option value="PLENO" className="bg-slate-900">Pleno</option>
                                    <option value="SENIOR" className="bg-slate-900">Sênior</option>
                                    <option value="ESPECIALISTA" className="bg-slate-900">Especialista</option>
                                    <option value="GERENTE" className="bg-slate-900">Gerente</option>
                                    <option value="DIRETOR" className="bg-slate-900">Diretor</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Salário Base (Opcional)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.baseSalary}
                                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-10 pr-4 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Descrição</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none h-24 resize-none"
                                placeholder="Descrição das responsabilidades do cargo..."
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
                                Cargo Ativo
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <Link href="/admin/positions">
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
                            Salvar Cargo
                        </button>
                    </div>
                </motion.form>
            </div>
        </>
    );
}
