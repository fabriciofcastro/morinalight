"use client";

import { Button, cn } from "@morina/ui";
import {
    ArrowLeft,
    Package,
    Save,
    Loader2,
    FileText,
    DollarSign,
    Box,
    Image as ImageIcon,
    Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { productsApi, CreateProductInput } from "@/lib/api/products";
import { organizationalStructureApi, BusinessSegment } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";
import { CodeValidator } from "@/components/ui/code-validator";
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface ProductFormProps {
    mode: "create" | "edit";
    productId?: string;
}

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Ativo" },
    { value: "INACTIVE", label: "Inativo" },
    { value: "ARCHIVED", label: "Arquivado" },
];

export function ProductForm({ mode, productId }: ProductFormProps) {
    const router = useRouter();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [segments, setSegments] = useState<BusinessSegment[]>([]); // Using Segments as categories for now or placeholder

    const [formData, setFormData] = useState<CreateProductInput>({
        name: "",
        sku: "",
        description: "",
        categoryId: "",
        brand: "",
        unit: "UN",
        status: "ACTIVE",
        costPrice: 0,
        sellingPrice: 0,
        minStock: 0,
        maxStock: 0,
        imageUrl: "",
    });

    const loadData = useCallback(async () => {
        try {
            // Load categories/segments if available
            // const categoriesData = await ... 

            if (mode === "edit" && productId) {
                setLoading(true);
                const data = await productsApi.getById(orgId, productId);
                setFormData({
                    name: data.name,
                    sku: data.sku,
                    description: data.description || "",
                    categoryId: data.categoryId,
                    brand: data.brand || "",
                    unit: data.unit,
                    status: data.status,
                    costPrice: data.costPrice,
                    sellingPrice: data.sellingPrice,
                    minStock: data.minStock,
                    maxStock: data.maxStock,
                    imageUrl: data.imageUrl || "",
                });
                setLoading(false);
            }
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao carregar dados do produto." });
            setLoading(false);
        }
    }, [productId, mode, orgId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (mode === "create") {
                await productsApi.create(orgId, formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Produto cadastrado." });
            } else if (productId) {
                await productsApi.update(orgId, productId, formData);
                notificationCenter.add({ type: "success", title: "Sucesso", message: "Produto atualizado." });
            }
            router.push("/admin/products/list");
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar produto." });
        } finally {
            setSaving(false);
        }
    };

    const calculateMargin = () => {
        if (formData.costPrice && formData.sellingPrice) {
            const margin = ((formData.sellingPrice - formData.costPrice) / formData.sellingPrice) * 100;
            return margin.toFixed(2);
        }
        return "0.00";
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
    }

    return (
        <AllowedGuard I={mode === "edit" ? "update" : "create"} a="Product" redirectTo="/admin/products/list">
            <div className="relative min-h-screen p-8 text-white">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button variant="ghost" className="pl-0 gap-2 text-white/60 hover:text-white" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Button>
                        <h1 className="text-3xl font-bold mt-2">{mode === "create" ? "Novo Produto" : "Editar Produto"}</h1>
                    </div>
                    <Button onClick={handleSubmit} disabled={saving} className="bg-amber-600 hover:bg-amber-500 text-white gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-6">
                        {/* Dados Gerais */}
                        <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                            <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                                <Package className="w-5 h-5 text-amber-400" />
                                <h3>Identificação</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FuturisticInput
                                    label="Nome do Produto"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Ex: Lâmpada LED 9W"
                                />
                                <CodeValidator
                                    value={formData.sku}
                                    onChange={(value) => setFormData({ ...formData, sku: value })}
                                    entity="product"
                                    currentId={productId}
                                    label="SKU / Código"
                                    placeholder="LAMP-001"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FuturisticInput
                                    label="Categoria (ID Temporário)"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                    placeholder="ID..."
                                />
                                <FuturisticInput
                                    label="Marca"
                                    value={formData.brand || ""}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="Ex: Philips"
                                />
                                <FuturisticInput
                                    label="Unidade"
                                    value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    placeholder="UN, CX, KG"
                                />
                            </div>

                            <FuturisticInput
                                multiline
                                rows={3}
                                label="Descrição Detalhada"
                                value={formData.description || ""}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Características técnicas, dimensões, etc."
                            />
                        </div>

                        {/* Precificação */}
                        <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                            <div className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                                <DollarSign className="w-5 h-5 text-amber-400" />
                                <h3>Precificação</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                <FuturisticInput
                                    label="Preço de Custo"
                                    value={formData.costPrice.toString()}
                                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                                    type="number"
                                    step="0.01"
                                />
                                <FuturisticInput
                                    label="Preço de Venda"
                                    value={formData.sellingPrice.toString()}
                                    onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                                    type="number"
                                    step="0.01"
                                />
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
                                    <span className="text-xs text-white/40 block">Margem Estimada</span>
                                    <span className={cn("text-xl font-bold", parseFloat(calculateMargin()) > 0 ? "text-emerald-400" : "text-red-400")}>
                                        {calculateMargin()}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Estoque */}
                        <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Box className="w-4 h-4 text-amber-400" /> Controle de Estoque
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <FuturisticInput
                                    label="Estoque Mínimo"
                                    value={formData.minStock?.toString() || "0"}
                                    onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                                    type="number"
                                />
                                <FuturisticInput
                                    label="Estoque Máximo"
                                    value={formData.maxStock?.toString() || "0"}
                                    onChange={e => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                                    type="number"
                                />
                            </div>
                            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
                                <p>O estoque atual é gerenciado através do módulo de movimentações.</p>
                            </div>
                        </div>

                        {/* Imagem e Status */}
                        <div className="p-6 rounded-xl bg-[#090b16]/60 border border-white/10 backdrop-blur-xl space-y-6">
                            <FuturisticInput
                                label="URL da Imagem"
                                value={formData.imageUrl || ""}
                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                icon={<ImageIcon className="w-4 h-4" />}
                                placeholder="https://..."
                            />

                            <FuturisticSelect
                                label="Status do Produto"
                                value={formData.status || "ACTIVE"}
                                onChange={val => setFormData({ ...formData, status: val as any })}
                                options={STATUS_OPTIONS}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </AllowedGuard>
    );
}
