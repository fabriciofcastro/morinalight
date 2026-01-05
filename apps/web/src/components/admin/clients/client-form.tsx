"use client";

import { Button, cn } from "@morina/ui";
import {
    ArrowLeft,
    Users,
    Save,
    Loader2,
    FileText,
    DollarSign,
    MapPin,
    Building2,
    User,
    Phone,
    Mail
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { clientsApi, CreateClientInput } from "@/lib/api/clients";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface ClientFormProps {
    mode: "create" | "edit";
    clientId?: string;
}

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Ativo" },
    { value: "LEAD", label: "Lead / Potencial" },
    { value: "INACTIVE", label: "Inativo" },
    { value: "BLOCKED", label: "Bloqueado" },
];

export function ClientForm({ mode, clientId }: ClientFormProps) {
    const router = useRouter();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<CreateClientInput>({
        name: "",
        email: "",
        phone: "",
        document: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        status: "ACTIVE",
        type: "PJ",
        notes: "",
        creditLimit: 0,
    });

    const loadData = useCallback(async () => {
        try {
            if (mode === "edit" && clientId) {
                setLoading(true);
                const data = await clientsApi.getById(orgId, clientId);
                setFormData({
                    name: data.name,
                    email: data.email || "",
                    phone: data.phone || "",
                    document: data.document || "",
                    address: data.address || "",
                    city: data.city || "",
                    state: data.state || "",
                    zipCode: data.zipCode || "",
                    status: data.status,
                    type: data.type,
                    notes: data.notes || "",
                    creditLimit: data.creditLimit || 0,
                });
                setLoading(false);
            }
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao carregar dados do cliente." });
            setLoading(false);
        }
    }, [clientId, mode, orgId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (mode === "create") {
                await clientsApi.create(orgId, formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Cliente cadastrado." });
            } else if (clientId) {
                await clientsApi.update(orgId, clientId, formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Cliente atualizado." });
            }
            router.push("/admin/clients/list");
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar cliente." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;
    }

    return (
        <AllowedGuard I={mode === "edit" ? "update" : "create"} a="Client" redirectTo="/admin/clients/list">
            <div className="relative min-h-screen p-8 text-white">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button variant="ghost" className="pl-0 gap-2 text-white/60 hover:text-white" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Button>
                        <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Novo Cliente" : "Editar Cliente"}</h1>
                    </div>
                    <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-6">
                        {/* Dados Principais */}
                        <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                            <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                                <Users className="w-5 h-5 text-cyan-400" />
                                <h3>Dados Cadastrais</h3>
                            </div>

                            <div className="flex gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "PJ" })}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                                        formData.type === "PJ" ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" : "border-white/10 text-white/50 hover:bg-white/5"
                                    )}
                                >
                                    <Building2 className="w-4 h-4" />
                                    Pessoa Jurídica
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "PF" })}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                                        formData.type === "PF" ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" : "border-white/10 text-white/50 hover:bg-white/5"
                                    )}
                                >
                                    <User className="w-4 h-4" />
                                    Pessoa Física
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FuturisticInput
                                    label={formData.type === "PJ" ? "Razão Social" : "Nome Completo"}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <FuturisticInput
                                    label={formData.type === "PJ" ? "CNPJ" : "CPF"}
                                    value={formData.document || ""}
                                    onChange={e => setFormData({ ...formData, document: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FuturisticInput
                                    label="E-mail Principal"
                                    value={formData.email || ""}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    type="email"
                                    startIcon={<Mail className="w-4 h-4" />}
                                />
                                <FuturisticInput
                                    label="Telefone / Celular"
                                    value={formData.phone || ""}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    startIcon={<Phone className="w-4 h-4" />}
                                />
                            </div>
                        </div>

                        {/* Endereço */}
                        <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                            <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                                <MapPin className="w-5 h-5 text-cyan-400" />
                                <h3>Localização</h3>
                            </div>

                            <div className="grid grid-cols-4 gap-6">
                                <div className="col-span-1">
                                    <FuturisticInput
                                        label="CEP"
                                        value={formData.zipCode || ""}
                                        onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <FuturisticInput
                                        label="Endereço Completo"
                                        value={formData.address || ""}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Rua, Número, Bairro"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FuturisticInput
                                    label="Cidade"
                                    value={formData.city || ""}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                                <FuturisticInput
                                    label="Estado"
                                    value={formData.state || ""}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="UF"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Gestão */}
                        <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-cyan-400" /> Informações Comerciais
                            </h3>

                            <FuturisticSelect
                                label="Status do Cliente"
                                value={formData.status || "ACTIVE"}
                                onChange={val => setFormData({ ...formData, status: val as any })}
                                options={STATUS_OPTIONS}
                            />

                            <div className="mt-4">
                                <FuturisticInput
                                    label="Limite de Crédito Consolidado"
                                    value={formData.creditLimit?.toString() || "0"}
                                    onChange={e => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                                    type="number"
                                    step="0.01"
                                    startIcon={<DollarSign className="w-4 h-4" />}
                                />
                            </div>

                            <div className="mt-4">
                                <FuturisticInput
                                    multiline
                                    rows={4}
                                    label="Anotações CRM"
                                    value={formData.notes || ""}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Histórico, preferências, detalhes importantes..."
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AllowedGuard>
    );
}
