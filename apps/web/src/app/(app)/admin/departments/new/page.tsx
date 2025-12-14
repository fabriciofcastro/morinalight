"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Building, Settings } from "lucide-react";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";
import { organizationalStructureApi, Branch, Department, CreateDepartmentInput } from "@/lib/api/organizational-structure";
import { TabsLayout } from "@/components/ui/tabs-layout";

export default function NewDepartmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [formData, setFormData] = useState<CreateDepartmentInput>({
        name: "",
        code: "",
        type: "CORE",
        filialId: "",
        parentId: "",
        active: true,
        description: "",
        metadata: "{}", // JSON string for editing
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [branchesData, departmentsData] = await Promise.all([
                organizationalStructureApi.getBranches(),
                organizationalStructureApi.getDepartments(),
            ]);
            setBranches(branchesData);
            setDepartments(departmentsData);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let parsedMetadata;
            try {
                parsedMetadata = JSON.parse(formData.metadata);
            } catch {
                alert("Metadados inválidos. Certifique-se de que é um JSON válido.");
                return;
            }

            setLoading(true);
            await organizationalStructureApi.createDepartment({
                ...formData,
                filialId: formData.filialId || undefined,
                parentId: formData.parentId || undefined,
                metadata: parsedMetadata,
            });
            router.push("/admin/departments");
        } catch (error) {
            console.error("Failed to create department", error);
            alert("Erro ao criar departamento. Verifique os dados e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "general", label: "Geral", icon: <Building /> },
        { id: "settings", label: "Configurações", icon: <Settings /> },
    ];

    return (
        <>
            <PageBackground variant="dashboard" />
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/departments">
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Novo Departamento</h1>
                        <p className="text-sm text-white/50">Preencha os dados do novo departamento</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <TabsLayout tabs={tabs}>
                        {(activeTab) => (
                            <div className="space-y-6 min-h-[400px]">
                                {activeTab === "general" && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">Nome do Departamento</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                    placeholder="Ex: Comercial"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">Código</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.code}
                                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                    placeholder="Ex: COM"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">Tipo</label>
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white focus:border-[hsl(var(--primary))] focus:outline-none appearance-none"
                                                >
                                                    <option value="CORE" className="bg-slate-900">Core Business</option>
                                                    <option value="SUPORTE" className="bg-slate-900">Suporte</option>
                                                    <option value="GESTAO" className="bg-slate-900">Gestão</option>
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
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Descrição</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none h-24 resize-none"
                                                placeholder="Descrição das responsabilidades do departamento..."
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
                                                Departamento Ativo
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "settings" && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Departamento Pai (Hierarquia)</label>
                                            <select
                                                value={formData.parentId}
                                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white focus:border-[hsl(var(--primary))] focus:outline-none appearance-none"
                                            >
                                                <option value="" className="bg-slate-900">Nenhum (Raiz)</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id} className="bg-slate-900">
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-xs text-white/30">Selecione um departamento pai se este for um sub-departamento.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Metadados (JSON)</label>
                                            <textarea
                                                value={formData.metadata}
                                                onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white font-mono text-sm placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none h-48 resize-none"
                                                placeholder="{}"
                                            />
                                            <p className="mt-1 text-xs text-white/30">Dados adicionais em formato JSON.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsLayout>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <Link href="/admin/departments">
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
                            Salvar Departamento
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
