"use client";

import { Button, cn } from "@morina/ui";
import {
    ArrowLeft,
    Truck,
    Save,
    Loader2,
    FileText,
    CheckCircle2,
    Phone,
    Mail,
    MapPin,
    Globe,
    DollarSign
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { suppliersApi, CreateSupplierInput } from "@/lib/api/suppliers";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";

interface SupplierFormProps {
    mode: "create" | "edit";
    supplierId?: string;
}

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Ativo" },
    { value: "INACTIVE", label: "Inativo" },
    { value: "BLOCKED", label: "Bloqueado" },
];

export function SupplierForm({ mode, supplierId }: SupplierFormProps) {
    const router = useRouter();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<CreateSupplierInput>({
        name: "",
        email: "",
        phone: "",
        document: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        status: "ACTIVE",
        notes: "",
        website: "",
        contatoPrincipal: "",
        cargoContato: "",
        ramoAtividade: "",
        tipoFornecedor: "PRODUTO",
        condicaoPagamento: "",
        prazoPagamento: 30,
        limiteCredito: 0,
    });

    const loadData = useCallback(async () => {
        if (mode === "edit" && supplierId) {
            setLoading(true);
            try {
                const data = await suppliersApi.getById(orgId, supplierId);
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
                    notes: data.notes || "",
                    website: data.website || "",
                    contatoPrincipal: data.contatoPrincipal || "",
                    cargoContato: data.cargoContato || "",
                    ramoAtividade: data.ramoAtividade || "",
                    tipoFornecedor: data.tipoFornecedor || "PRODUTO",
                    condicaoPagamento: data.condicaoPagamento || "",
                    prazoPagamento: data.prazoPagamento || 30,
                    limiteCredito: data.limiteCredito || 0,
                });
            } catch (error) {
                notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao carregar dados do fornecedor." });
            } finally {
                setLoading(false);
            }
        }
    }, [supplierId, mode, orgId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (mode === "create") {
                await suppliersApi.create(orgId, formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Fornecedor cadastrado." });
            } else if (supplierId) {
                await suppliersApi.update(orgId, supplierId, formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Fornecedor atualizado." });
            }
            router.push("/admin/suppliers/list");
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar fornecedor." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="relative min-h-screen p-8 text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Button variant="ghost" className="pl-0 gap-2 text-white/60 hover:text-white" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Novo Fornecedor" : "Editar Fornecedor"}</h1>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    {/* Dados Principais */}
                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                            <Truck className="w-5 h-5 text-blue-400" />
                            <h3>Dados Empresariais</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Razão Social / Nome"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Nome completo da empresa"
                            />
                            <FuturisticInput
                                label="CNPJ / Documento"
                                value={formData.document || ""}
                                onChange={e => setFormData({ ...formData, document: e.target.value })}
                                placeholder="00.000.000/0000-00"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticSelect
                                label="Status"
                                value={formData.status || "ACTIVE"}
                                onChange={val => setFormData({ ...formData, status: val })}
                                options={STATUS_OPTIONS}
                            />
                            <FuturisticInput
                                label="Website"
                                value={formData.website || ""}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                placeholder="www.empresa.com.br"
                                icon={<Globe className="w-4 h-4" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Ramo de Atividade"
                                value={formData.ramoAtividade || ""}
                                onChange={e => setFormData({ ...formData, ramoAtividade: e.target.value })}
                                placeholder="Ex: Têxtil, Logística"
                            />
                            <FuturisticSelect
                                label="Tipo de Fornecimento"
                                value={formData.tipoFornecedor || "PRODUTO"}
                                onChange={val => setFormData({ ...formData, tipoFornecedor: val })}
                                options={[{ value: "PRODUTO", label: "Produtos" }, { value: "SERVICO", label: "Serviços" }, { value: "MISTO", label: "Híbrido" }]}
                            />
                        </div>
                    </div>

                    {/* Contato Principal */}
                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                            <Phone className="w-5 h-5 text-blue-400" />
                            <h3>Contato Principal</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Nome do Contato"
                                value={formData.contatoPrincipal || ""}
                                onChange={e => setFormData({ ...formData, contatoPrincipal: e.target.value })}
                                placeholder="Responsável..."
                            />
                            <FuturisticInput
                                label="Cargo"
                                value={formData.cargoContato || ""}
                                onChange={e => setFormData({ ...formData, cargoContato: e.target.value })}
                                placeholder="Gerente Comercial..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Email Corporativo"
                                value={formData.email || ""}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                type="email"
                                placeholder="contato@empresa.com.br"
                                icon={<Mail className="w-4 h-4" />}
                            />
                            <FuturisticInput
                                label="Telefone / WhatsApp"
                                value={formData.phone || ""}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(00) 00000-0000"
                                icon={<Phone className="w-4 h-4" />}
                            />
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            <h3>Endereço</h3>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            <div className="col-span-1">
                                <FuturisticInput
                                    label="CEP"
                                    value={formData.zipCode || ""}
                                    onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="col-span-3">
                                <FuturisticInput
                                    label="Logradouro"
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
                    {/* Condições Comerciais */}
                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-400" /> Condições Comerciais
                        </h3>

                        <FuturisticInput
                            label="Limite de Crédito"
                            value={formData.limiteCredito?.toString() || "0"}
                            onChange={e => setFormData({ ...formData, limiteCredito: parseFloat(e.target.value) || 0 })}
                            type="number"
                            placeholder="R$ 0,00"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FuturisticInput
                                label="Prazo (Dias)"
                                value={formData.prazoPagamento?.toString() || "30"}
                                onChange={e => setFormData({ ...formData, prazoPagamento: parseInt(e.target.value) || 30 })}
                                type="number"
                            />
                            <FuturisticInput
                                label="Condição"
                                value={formData.condicaoPagamento || ""}
                                onChange={e => setFormData({ ...formData, condicaoPagamento: e.target.value })}
                                placeholder="Ex: Boleto 30/60"
                            />
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Resumo
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Nome</span>
                                <span className="text-white truncate max-w-[150px]">{formData.name || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Status</span>
                                <span className={cn(
                                    "font-medium",
                                    formData.status === "ACTIVE" ? "text-emerald-400" : "text-white/40"
                                )}>
                                    {STATUS_OPTIONS.find(s => s.value === formData.status)?.label || formData.status}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40">Documento</span>
                                <span className="text-white">{formData.document || "-"}</span>
                            </div>
                        </div>
                    </div>

                    <FuturisticInput
                        multiline
                        rows={4}
                        label="Observações Internas"
                        value={formData.notes || ""}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Anotações importantes sobre este fornecedor..."
                    />
                </div>
            </form>
        </div>
    );
}
