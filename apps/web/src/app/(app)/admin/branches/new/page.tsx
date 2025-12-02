"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Building2, FileText, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";
import { organizationalStructureApi, CreateBranchInput } from "@/lib/api/organizational-structure";
import { TabsLayout } from "@/components/ui/tabs-layout";

export default function NewBranchPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingCnpj, setFetchingCnpj] = useState(false);
    const [fetchingCep, setFetchingCep] = useState(false);

    const [formData, setFormData] = useState<CreateBranchInput>({
        name: "",
        code: "",
        type: "LOJA",
        active: true,
        cnpj: "",
        stateRegistration: "",
        email: "",
        phone: "",
        address: {
            zipCode: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
        },
    });

    const handleCnpjBlur = async () => {
        const cnpj = formData.cnpj?.replace(/\D/g, "");
        if (cnpj?.length === 14) {
            try {
                setFetchingCnpj(true);
                const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
                const data = await response.json();

                if (!response.ok) throw new Error(data.message);

                setFormData((prev) => ({
                    ...prev,
                    name: data.razao_social || prev.name,
                    email: data.email || prev.email,
                    phone: data.ddd_telefone_1 || prev.phone,
                    address: {
                        ...prev.address!,
                        zipCode: data.cep || prev.address?.zipCode,
                        street: data.logradouro || prev.address?.street,
                        number: data.numero || prev.address?.number,
                        complement: data.complemento || prev.address?.complement,
                        neighborhood: data.bairro || prev.address?.neighborhood,
                        city: data.municipio || prev.address?.city,
                        state: data.uf || prev.address?.state,
                    },
                }));
            } catch (error) {
                console.error("Erro ao buscar CNPJ:", error);
                // Optional: Show toast error
            } finally {
                setFetchingCnpj(false);
            }
        }
    };

    const handleCepBlur = async () => {
        const cep = formData.address?.zipCode.replace(/\D/g, "");
        if (cep?.length === 8) {
            try {
                setFetchingCep(true);
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (data.erro) throw new Error("CEP não encontrado");

                setFormData((prev) => ({
                    ...prev,
                    address: {
                        ...prev.address!,
                        street: data.logradouro || prev.address?.street,
                        neighborhood: data.bairro || prev.address?.neighborhood,
                        city: data.localidade || prev.address?.city,
                        state: data.uf || prev.address?.state,
                    },
                }));
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            } finally {
                setFetchingCep(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await organizationalStructureApi.createBranch(formData);
            router.push("/admin/branches");
        } catch (error) {
            console.error("Failed to create branch", error);
            alert("Erro ao criar filial. Verifique os dados e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "general", label: "Geral", icon: <Building2 /> },
        { id: "fiscal", label: "Fiscal", icon: <FileText /> },
        { id: "address", label: "Endereço", icon: <MapPin /> },
        { id: "contact", label: "Contato", icon: <Phone /> },
    ];

    return (
        <>
            <PageBackground variant="dashboard" />
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/branches">
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Nova Filial</h1>
                        <p className="text-sm text-white/50">Preencha os dados da nova unidade</p>
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
                                                <label className="block text-sm font-medium text-white/70 mb-1">Nome da Filial</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                    placeholder="Ex: Matriz São Paulo"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">Código Interno</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.code}
                                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                    placeholder="Ex: MTZ-01"
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
                                                    <option value="LOJA" className="bg-slate-900">Loja</option>
                                                    <option value="FABRICA" className="bg-slate-900">Fábrica</option>
                                                    <option value="CD" className="bg-slate-900">Centro de Distribuição</option>
                                                    <option value="ESCRITORIO" className="bg-slate-900">Escritório</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center pt-6">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="active"
                                                        checked={formData.active}
                                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                                        className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                                                    />
                                                    <label htmlFor="active" className="text-sm font-medium text-white/70 cursor-pointer">
                                                        Filial Ativa
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "fiscal" && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">CNPJ</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={formData.cnpj}
                                                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                                        onBlur={handleCnpjBlur}
                                                        className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                        placeholder="00.000.000/0000-00"
                                                    />
                                                    {fetchingCnpj && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs text-white/30">Digite o CNPJ para buscar dados automaticamente.</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">Inscrição Estadual</label>
                                                <input
                                                    type="text"
                                                    value={formData.stateRegistration}
                                                    onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                    placeholder="Ex: 123.456.789.111"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "address" && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-white/70 mb-1">CEP</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={formData.address?.zipCode}
                                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, zipCode: e.target.value } })}
                                                        onBlur={handleCepBlur}
                                                        className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                        placeholder="00000-000"
                                                    />
                                                    {fetchingCep && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-sm font-medium text-white/70 mb-1">Logradouro</label>
                                                <input
                                                    type="text"
                                                    value={formData.address?.street}
                                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, street: e.target.value } })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-white/70 mb-1">Número</label>
                                                <input
                                                    type="text"
                                                    value={formData.address?.number}
                                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, number: e.target.value } })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-sm font-medium text-white/70 mb-1">Complemento</label>
                                                <input
                                                    type="text"
                                                    value={formData.address?.complement}
                                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, complement: e.target.value } })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">Bairro</label>
                                                <input
                                                    type="text"
                                                    value={formData.address?.neighborhood}
                                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, neighborhood: e.target.value } })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">Cidade</label>
                                                <input
                                                    type="text"
                                                    value={formData.address?.city}
                                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, city: e.target.value } })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">Estado (UF)</label>
                                                <input
                                                    type="text"
                                                    maxLength={2}
                                                    value={formData.address?.state}
                                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, state: e.target.value.toUpperCase() } })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "contact" && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                    placeholder="contato@filial.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1">Telefone</label>
                                                <input
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                                                    placeholder="(00) 0000-0000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsLayout>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <Link href="/admin/branches">
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
                            Salvar Filial
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
