"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    MapPin,
    FileText,
    Phone,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Upload,
    Globe,
    Mail,
    Smartphone,
    CreditCard,
    Landmark
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageBackground } from "../../../../../components/layout/PageBackground";
import { FormField } from "../../../../../components/ui/form-field";
import { SettingsSidebar } from "../../../../../components/admin/company/SettingsSidebar";
import { SectionCard } from "../../../../../components/admin/company/SectionCard";
import { cn } from "../../../../../lib/utils";

// Mock Data (Simulando API)
const MOCK_COMPANY = {
    id: "1",
    name: "Morina Tecnologia",
    legalName: "Morina Soluções em Tecnologia Ltda",
    cnpj: "12.345.678/0001-90",
    email: "contato@morina.com.br",
    financialEmail: "financeiro@morina.com.br",
    phone: "(11) 99999-8888",
    secondaryPhone: "(11) 3333-4444",
    whatsapp: "(11) 98888-7777",
    website: "https://morina.com.br",
    address: {
        street: "Av. Paulista",
        number: "1000",
        complement: "Conj 101",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
        country: "Brasil"
    },
    companySize: "EPP",
    foundedAt: "2020-01-15T00:00:00.000Z",
    taxRegime: "SIMPLES",
    icmsRate: 18,
    issRate: 5,
    nfeEnvironment: "HOMOLOGACAO",
    logoUrl: null
};

export default function CompanyEditPage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState("general");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>(MOCK_COMPANY);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch Data (Simulado)
    useEffect(() => {
        // Aqui viria a chamada real à API
        setLoading(false);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        // Simular delay de salvamento
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSaving(false);
        // Mostrar toast de sucesso (idealmente)
    };

    const navItems = [
        {
            id: "general",
            label: "Visão Geral",
            icon: Building2,
            description: "Identidade e dados básicos"
        },
        {
            id: "fiscal",
            label: "Fiscal & Tributário",
            icon: Landmark,
            description: "CNPJ, impostos e notas"
        },
        {
            id: "address",
            label: "Endereço",
            icon: MapPin,
            description: "Localização e mapa"
        },
        {
            id: "contact",
            label: "Contato",
            icon: Phone,
            description: "Emails, telefones e redes"
        },
    ];

    return (
        <>
            <PageBackground />

            <div className="relative min-h-screen w-full">
                {/* Sticky Header */}
                <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090b]/90 backdrop-blur-xl shadow-sm">
                    <div className="mx-auto flex h-20 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-purple-600 shadow-lg shadow-purple-500/20 ring-1 ring-white/10">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white leading-tight tracking-tight">Configurações da Empresa</h1>
                                <p className="text-sm text-zinc-400">Gerencie os dados da sua organização</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/company"
                                className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-all rounded-lg border border-white/10 hover:bg-white/5 hover:border-white/20"
                            >
                                Cancelar
                            </Link>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[hsl(var(--primary))]/25 transition-all hover:bg-[hsl(var(--primary))]/90 hover:shadow-[hsl(var(--primary))]/40 hover:scale-[1.02] active:scale-95 ring-1 ring-white/10",
                                    saving && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Sidebar Navigation */}
                        <aside className="lg:col-span-3">
                            <div className="sticky top-24 space-y-8">
                                <SettingsSidebar
                                    items={navItems}
                                    activeItem={activeSection}
                                    onSelect={setActiveSection}
                                />

                                {/* Completion Card */}
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-white/70">Perfil da Empresa</span>
                                        <span className="text-xs font-bold text-[hsl(var(--primary))]">85%</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                        <div className="h-full w-[85%] rounded-full bg-[hsl(var(--primary))]" />
                                    </div>
                                    <p className="mt-2 text-[10px] text-white/40">
                                        Complete o cadastro para liberar todas as funcionalidades.
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="lg:col-span-9 space-y-6">
                            <AnimatePresence mode="wait">
                                {activeSection === "general" && (
                                    <motion.div
                                        key="general"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6"
                                    >
                                        <SectionCard
                                            title="Identidade Visual"
                                            description="Logo e cores da sua marca exibidos no sistema."
                                        >
                                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                                <div className="relative group cursor-pointer">
                                                    <div className="h-32 w-32 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center transition-all group-hover:border-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))]/10">
                                                        {formData.logoUrl ? (
                                                            <img src={formData.logoUrl} alt="Logo" className="h-full w-full rounded-full object-cover" />
                                                        ) : (
                                                            <Upload className="h-8 w-8 text-white/40 group-hover:text-[hsl(var(--primary))]" />
                                                        )}
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="bg-black/80 text-white text-xs px-2 py-1 rounded">Alterar</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-2 text-center sm:text-left">
                                                    <h4 className="text-white font-medium">Logo da Empresa</h4>
                                                    <p className="text-sm text-white/50">
                                                        Recomendado: PNG ou SVG com fundo transparente.<br />
                                                        Tamanho máximo: 2MB.
                                                    </p>
                                                    <div className="flex gap-2 justify-center sm:justify-start pt-2">
                                                        <button className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 rounded hover:bg-white/20 transition-colors">
                                                            Upload
                                                        </button>
                                                        <button className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors">
                                                            Remover
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </SectionCard>

                                        <SectionCard
                                            title="Dados Corporativos"
                                            description="Informações legais e de identificação da empresa."
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    label="Nome Fantasia"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Ex: Morina Tech"
                                                />
                                                <FormField
                                                    label="Razão Social"
                                                    name="legalName"
                                                    value={formData.legalName}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, legalName: e.target.value })}
                                                    placeholder="Ex: Morina Tecnologia Ltda"
                                                />
                                                <FormField
                                                    label="Data de Fundação"
                                                    name="foundedAt"
                                                    type="date"
                                                    value={formData.foundedAt ? formData.foundedAt.split("T")[0] : ""}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, foundedAt: e.target.value })}
                                                />
                                                <FormField
                                                    label="Porte da Empresa"
                                                    name="companySize"
                                                    type="select"
                                                    value={formData.companySize}
                                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, companySize: e.target.value })}
                                                    options={[
                                                        { label: "MEI", value: "MEI" },
                                                        { label: "Microempresa (ME)", value: "ME" },
                                                        { label: "Empresa de Pequeno Porte (EPP)", value: "EPP" },
                                                        { label: "Médio Porte", value: "MEDIO" },
                                                        { label: "Grande Porte", value: "GRANDE" },
                                                    ]}
                                                />
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {activeSection === "fiscal" && (
                                    <motion.div
                                        key="fiscal"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6"
                                    >
                                        <SectionCard
                                            title="Identificação Fiscal"
                                            description="Registros nos órgãos governamentais."
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <FormField
                                                    label="CNPJ"
                                                    name="cnpj"
                                                    value={formData.cnpj}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cnpj: e.target.value })}
                                                    mask="cnpj"
                                                />
                                                <FormField
                                                    label="Inscrição Estadual"
                                                    name="stateRegistration"
                                                    value={formData.stateRegistration}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, stateRegistration: e.target.value })}
                                                />
                                                <FormField
                                                    label="Inscrição Municipal"
                                                    name="municipalRegistration"
                                                    value={formData.municipalRegistration}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, municipalRegistration: e.target.value })}
                                                />
                                            </div>
                                        </SectionCard>

                                        <SectionCard
                                            title="Regime e Impostos"
                                            description="Configurações tributárias para emissão de notas."
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <FormField
                                                    label="Regime Tributário"
                                                    name="taxRegime"
                                                    type="select"
                                                    value={formData.taxRegime}
                                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, taxRegime: e.target.value })}
                                                    options={[
                                                        { label: "Simples Nacional", value: "SIMPLES" },
                                                        { label: "Lucro Presumido", value: "PRESUMIDO" },
                                                        { label: "Lucro Real", value: "REAL" },
                                                    ]}
                                                />
                                                <div className="flex items-center h-full pt-6">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-white/5 transition-colors group-hover:border-[hsl(var(--primary))]">
                                                            <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--primary))] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                        </div>
                                                        <span className="text-sm text-white/80 group-hover:text-white transition-colors">Substituto Tributário</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                                                <FormField label="ICMS (%)" name="icmsRate" type="number" value={formData.icmsRate} onChange={() => { }} />
                                                <FormField label="ISS (%)" name="issRate" type="number" value={formData.issRate} onChange={() => { }} />
                                                <FormField label="PIS (%)" name="pisRate" type="number" value={formData.pisRate} onChange={() => { }} />
                                                <FormField label="COFINS (%)" name="cofinsRate" type="number" value={formData.cofinsRate} onChange={() => { }} />
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {activeSection === "address" && (
                                    <motion.div
                                        key="address"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6"
                                    >
                                        <SectionCard
                                            title="Endereço Principal"
                                            description="Localização física da sede da empresa."
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <div className="md:col-span-1">
                                                    <FormField
                                                        label="CEP"
                                                        name="zipCode"
                                                        value={formData.address.zipCode}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                                                        mask="cep"
                                                    />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <FormField
                                                        label="Logradouro"
                                                        name="street"
                                                        value={formData.address.street}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <FormField
                                                        label="Número"
                                                        name="number"
                                                        value={formData.address.number}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: { ...formData.address, number: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <FormField
                                                        label="Complemento"
                                                        name="complement"
                                                        value={formData.address.complement}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: { ...formData.address, complement: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <FormField
                                                        label="Bairro"
                                                        name="neighborhood"
                                                        value={formData.address.neighborhood}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: { ...formData.address, neighborhood: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <FormField
                                                        label="Cidade"
                                                        name="city"
                                                        value={formData.address.city}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <FormField
                                                        label="Estado (UF)"
                                                        name="state"
                                                        value={formData.address.state}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <FormField
                                                        label="País"
                                                        name="country"
                                                        value={formData.address.country}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                                                    />
                                                </div>
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {activeSection === "contact" && (
                                    <motion.div
                                        key="contact"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6"
                                    >
                                        <SectionCard
                                            title="Canais de Contato"
                                            description="Como seus clientes e parceiros podem falar com você."
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    label="Email Principal"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                                    leftIcon={<Mail className="h-4 w-4" />}
                                                />
                                                <FormField
                                                    label="Email Financeiro"
                                                    name="financialEmail"
                                                    type="email"
                                                    value={formData.financialEmail}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, financialEmail: e.target.value })}
                                                    leftIcon={<CreditCard className="h-4 w-4" />}
                                                />
                                                <FormField
                                                    label="Telefone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                                                    leftIcon={<Phone className="h-4 w-4" />}
                                                />
                                                <FormField
                                                    label="WhatsApp"
                                                    name="whatsapp"
                                                    value={formData.whatsapp}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, whatsapp: e.target.value })}
                                                    leftIcon={<Smartphone className="h-4 w-4" />}
                                                />
                                                <div className="md:col-span-2">
                                                    <FormField
                                                        label="Website"
                                                        name="website"
                                                        value={formData.website}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, website: e.target.value })}
                                                        leftIcon={<Globe className="h-4 w-4" />}
                                                    />
                                                </div>
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
