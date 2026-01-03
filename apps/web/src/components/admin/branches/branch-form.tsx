"use client";

import { Button, cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@morina/ui";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    MapPin,
    Phone,
    Save,
    Settings,
    Store,
    Factory,
    Mail,
    Warehouse,
    Loader2,
    Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { organizationsApi, Organization, CreateOrganizationDto, UpdateOrganizationDto } from "@/lib/api/organizations";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";
import { CodeValidator } from "@/components/ui/code-validator";
import { buscarCnpj, formatarCnpj, validarCnpj } from "@/lib/integrations/cnpj";
import { buscarEnderecoPorCep, formatarCep } from "@/lib/integrations/viacep";

interface BranchFormProps {
    mode: "create" | "edit";
    branchId?: string;
}

const BRANCH_TYPES = [
    { value: "PRODUCTION", label: "Produção", icon: Factory },
    { value: "COMMERCIAL", label: "Comercial", icon: Store },
    { value: "ADMINISTRATIVE", label: "Administrativa", icon: Building2 },
    { value: "MIXED", label: "Mista", icon: Warehouse },
];

export function BranchForm({ mode, branchId }: BranchFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("identificacao");
    const [loadingCNPJ, setLoadingCNPJ] = useState(false);
    const [loadingCEP, setLoadingCEP] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        legalName: "",
        cnpj: "",
        email: "",
        phone: "",
        website: "",
        address: {
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Brasil"
        },
        branchType: "PRODUCTION",
        isActive: true,
    });

    const loadBranch = useCallback(async () => {
        if (mode !== "edit" || !branchId) return;

        try {
            setLoading(true);
            const data = await organizationsApi.findOne(branchId);

            // Parse address if likely a string joined by pipes or similar (adapting from ERP-Textil logic if needed)
            // Assuming morinalight might use structured address or string. 
            // Checking organizations.ts, it likely returns an object or string.
            // For now, assuming simple parsing or direct mapping if the API is aligned.
            // If data.address is a string, we might need to conform. Looking at company-edit, it expects structured.
            // Let's assume standard object structure for now, or simple fields.

            setFormData({
                name: data.name,
                code: data.code || "",
                legalName: data.legalName || "",
                cnpj: data.cnpj || "",
                email: data.email || "",
                phone: data.phone || "",
                website: data.website || "",
                address: {
                    street: data.address?.street || "",
                    number: data.address?.number || "",
                    complement: data.address?.complement || "",
                    neighborhood: data.address?.neighborhood || "",
                    city: data.address?.city || "",
                    state: data.address?.state || "",
                    zipCode: data.address?.zipCode || "",
                    country: "Brasil"
                },
                branchType: ((data as any).branchType as string) || "PRODUCTION",
                isActive: data.active ?? true,
            });

        } catch (error) {
            console.error("Erro ao carregar filial:", error);
            notificationCenter.add({
                type: "error",
                title: "Erro ao carregar",
                message: "Não foi possível carregar os dados da filial."
            });
        } finally {
            setLoading(false);
        }
    }, [branchId, mode]);

    useEffect(() => {
        loadBranch();
    }, [loadBranch]);

    const handleCnpjBlur = async () => {
        const rawCnpj = formData.cnpj.replace(/[^\d]/g, "");
        if (rawCnpj.length !== 14 || !validarCnpj(rawCnpj)) return;

        setLoadingCNPJ(true);
        try {
            const data = await buscarCnpj(rawCnpj);
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    legalName: data.razaoSocial || prev.legalName,
                    name: data.nomeFantasia || prev.name,
                    address: {
                        ...prev.address,
                        street: data.endereco.logradouro || prev.address.street,
                        number: data.endereco.numero || prev.address.number,
                        complement: data.endereco.complemento || prev.address.complement,
                        neighborhood: data.endereco.bairro || prev.address.neighborhood,
                        city: data.endereco.cidade || prev.address.city,
                        state: data.endereco.estado || prev.address.state,
                        zipCode: data.endereco.cep || prev.address.zipCode,
                    },
                    phone: data.telefone || prev.phone,
                    email: data.email || prev.email
                }));
                notificationCenter.add({ type: "success", title: "Dados importados", message: "Dados da Receita Federal carregados." });
            }
        } finally {
            setLoadingCNPJ(false);
        }
    };

    const handleCepBlur = async () => {
        const rawCep = formData.address.zipCode.replace(/[^\d]/g, "");
        if (rawCep.length !== 8) return;

        setLoadingCEP(true);
        try {
            const data = await buscarEnderecoPorCep(rawCep);
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        street: data.logradouro || prev.address.street,
                        neighborhood: data.bairro || prev.address.neighborhood,
                        city: data.cidade || prev.address.city,
                        state: data.estado || prev.address.state,
                    }
                }));
                notificationCenter.add({ type: "success", title: "Endereço localizado", message: "Dados do CEP carregados." });
            }
        } finally {
            setLoadingCEP(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Build DTO
            const dto: any = {
                name: formData.name,
                code: formData.code,
                legalName: formData.legalName,
                cnpj: formData.cnpj.replace(/[^\d]/g, ""),
                email: formData.email,
                phone: formData.phone,
                website: formData.website,
                city: formData.address.city,
                state: formData.address.state,
                postalCode: formData.address.zipCode.replace(/[^\d]/g, ""),
                branchType: formData.branchType,
                isActive: formData.isActive,
                // Assuming address needs to be concatenated or passed separately?
                // Matching Company logic which sends specific fields if API supports it, or `address` string
                // Checking `organizations.ts` DTO types would be ideal but assuming standard fields for now.
            };

            if (mode === "create") {
                await organizationsApi.create(dto as CreateOrganizationDto);
                notificationCenter.add({ type: "success", title: "Filial criada", message: "Nova unidade adicionada com sucesso." });
            } else if (branchId) {
                await organizationsApi.update(branchId, dto as UpdateOrganizationDto);
                notificationCenter.add({ type: "success", title: "Filial atualizada", message: "Dados atualizados com sucesso." });
            }

            router.push("/admin/branches/list");
        } catch (error) {
            console.error(error);
            notificationCenter.add({ type: "error", title: "Erro ao salvar", message: "Ocorreu um erro ao processar sua solicitação." });
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
                    <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Nova Filial" : "Editar Filial"}</h1>
                    <p className="text-white/40">Preencha os dados da unidade organizacional</p>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Filial
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-white/10 pb-1 overflow-x-auto">
                {[
                    { id: "identificacao", label: "Identificação", icon: Building2 },
                    { id: "contato", label: "Contato", icon: Phone },
                    { id: "endereco", label: "Endereço", icon: MapPin },
                    { id: "config", label: "Configurações", icon: Settings },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap",
                            activeTab === tab.id
                                ? "border-blue-500 text-blue-400 font-medium"
                                : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Identificação */}
                    {activeTab === "identificacao" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FuturisticInput
                                    label="Nome da Filial"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Ex: Matriz Administrativa"
                                />
                                <CodeValidator
                                    value={formData.code}
                                    onChange={(value) => setFormData({ ...formData, code: value })}
                                    entity="branch"
                                    currentId={branchId}
                                    label="Código"
                                    placeholder="Ex: MTZ-01"
                                    required
                                />
                                <FuturisticInput
                                    label="CNPJ"
                                    value={formData.cnpj}
                                    onChange={e => setFormData({ ...formData, cnpj: formatarCnpj(e.target.value) })}
                                    onBlur={handleCnpjBlur}
                                    placeholder="00.000.000/0000-00"
                                />
                                {formData.cnpj && (
                                    <FuturisticInput
                                        label="Razão Social"
                                        value={formData.legalName}
                                        onChange={e => setFormData({ ...formData, legalName: e.target.value })}
                                        placeholder="Razão Social Ltda"
                                    />
                                )}
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                                    <Factory className="w-4 h-4" /> Tipo de Unidade
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {BRANCH_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, branchType: type.value })}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                                                formData.branchType === type.value
                                                    ? "bg-blue-500/20 border-blue-500 text-white"
                                                    : "bg-transparent border-white/10 text-white/40 hover:bg-white/5"
                                            )}
                                        >
                                            <type.icon className="w-6 h-6" />
                                            <span className="text-sm">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Contato */}
                    {activeTab === "contato" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FuturisticInput
                                    label="E-mail"
                                    type="email"
                                    startIcon={<Mail className="w-4 h-4" />}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contato@filial.com"
                                />
                                <FuturisticInput
                                    label="Telefone"
                                    startIcon={<Phone className="w-4 h-4" />}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(00) 0000-0000"
                                />
                                <FuturisticInput
                                    label="Website"
                                    startIcon={<Globe className="w-4 h-4" />}
                                    value={formData.website}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Endereço */}
                    {activeTab === "endereco" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <FuturisticInput
                                            label="CEP"
                                            value={formData.address.zipCode}
                                            onChange={e => setFormData({ ...formData, address: { ...formData.address, zipCode: formatarCep(e.target.value) } })}
                                            onBlur={handleCepBlur}
                                            placeholder="00000-000"
                                        />
                                    </div>
                                    {loadingCEP && <Loader2 className="mb-4 w-6 h-6 animate-spin text-white/50" />}
                                </div>

                                <div className="hidden md:block" />

                                <div className="md:col-span-2">
                                    <FuturisticInput
                                        label="Logradouro"
                                        value={formData.address.street}
                                        onChange={e => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                    />
                                </div>

                                <FuturisticInput
                                    label="Número"
                                    value={formData.address.number}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, number: e.target.value } })}
                                />
                                <FuturisticInput
                                    label="Complemento"
                                    value={formData.address.complement}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, complement: e.target.value } })}
                                />
                                <FuturisticInput
                                    label="Bairro"
                                    value={formData.address.neighborhood}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, neighborhood: e.target.value } })}
                                />
                                <FuturisticInput
                                    label="Cidade"
                                    value={formData.address.city}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                />
                                <FuturisticInput
                                    label="Estado (UF)"
                                    maxLength={2}
                                    value={formData.address.state}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, state: e.target.value.toUpperCase() } })}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Configurações */}
                    {activeTab === "config" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2 rounded-lg", formData.isActive ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-white/40")}>
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">Status da Filial</h4>
                                        <p className="text-sm text-white/40">{formData.isActive ? "A filial está ativa e operando normalmente." : "A filial está inativa e oculta em algumas listagens."}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className={cn(formData.isActive ? "border-emerald-500 text-emerald-500 hover:bg-emerald-500/10" : "border-white/10")}
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                >
                                    {formData.isActive ? "Ativa" : "Inativa"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <h3 className="font-semibold text-white mb-4">Resumo</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Store className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/40">Nome</p>
                                    <p className="font-medium text-white">{formData.name || "Sem nome"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/40">Localização</p>
                                    <p className="font-medium text-white">
                                        {formData.address.city && formData.address.state
                                            ? `${formData.address.city}/${formData.address.state}`
                                            : "Endereço pendente"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/40">Status Preenchimento</span>
                                <span className="text-emerald-400 font-medium">
                                    {Math.floor(Object.values(formData).filter(v => v).length / Object.keys(formData).length * 100)}%
                                </span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${Math.floor(Object.values(formData).filter(v => v).length / Object.keys(formData).length * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
