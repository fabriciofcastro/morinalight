"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    Plus,
    Search,
    Trash2,
    Package,
    Tag,
    AlertTriangle,
    RefreshCw,
    Box,
    TrendingDown,
    TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { productsApi, Product, ListProductsQuery } from "@/lib/api/products";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticSelect } from "@/components/ui/futuristic-ui";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";

const ProductCard = ({
    product,
    onEdit,
    onDelete,
    viewMode = "grid",
}: {
    product: Product;
    onEdit: () => void;
    onDelete: () => void;
    viewMode?: "grid" | "list";
}) => {
    const isLowStock = product.currentStock <= product.minStock;

    if (viewMode === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center justify-between p-4 bg-[#090b16]/60 backdrop-blur-xl border border-white/10 rounded-xl hover:border-amber-500/30 transition-all duration-300"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center border border-white/10 shadow-lg shrink-0",
                        "bg-amber-500/10 text-amber-400"
                    )}>
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <Package className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base leading-tight line-clamp-1">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                                #{product.sku}
                            </span>
                            {product.category && (
                                <span className="text-xs text-white/40 flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> {product.category.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className={cn(
                        "flex items-center gap-2",
                        isLowStock ? "text-red-400" : "text-white/60"
                    )}>
                        <Box className="w-4 h-4" />
                        <span className="font-mono font-medium">{product.currentStock}</span>
                    </div>

                    <div className="text-right min-w-[100px]">
                        <div className="text-base font-bold text-emerald-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.sellingPrice)}
                        </div>
                    </div>

                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={onEdit}>
                            <TrendingUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/60 hover:text-red-400 hover:bg-red-500/10" onClick={onDelete}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-[#090b16]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Status Stripe */}
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full shadow-[0_0_10px_currentColor]",
                product.status === "ACTIVE" ? "bg-emerald-500 text-emerald-500" : "bg-white/20 text-white/20"
            )} />

            <div className="p-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center border border-white/10 shadow-lg shrink-0",
                            "bg-amber-500/10 text-amber-400"
                        )}>
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <Package className="w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight line-clamp-1" title={product.name}>{product.name}</h3>
                            <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit mt-1">
                                #{product.sku}
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.sellingPrice)}
                        </div>
                        {product.margin && (
                            <div className="text-xs text-white/40">
                                Mg. {product.margin}%
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className={cn(
                        "p-2 rounded-lg border flex flex-col items-center justify-center",
                        isLowStock ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white/5 border-white/5 text-white/60"
                    )}>
                        <span className="text-xs font-medium">Estoque</span>
                        <div className="flex items-center gap-1 font-bold text-lg">
                            <Box className="w-4 h-4" />
                            {product.currentStock}
                        </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center justify-center text-white/60">
                        <span className="text-xs font-medium">Categoria</span>
                        <div className="flex items-center gap-1 font-medium text-sm text-center line-clamp-1">
                            {product.category?.name || "N/A"}
                        </div>
                    </div>
                </div>

                {isLowStock && (
                    <div className="flex items-center gap-2 text-xs text-red-400 mb-4 bg-red-500/10 p-2 rounded border border-red-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Estoque abaixo do mínimo ({product.minStock})</span>
                    </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-white/5">
                    <Button
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                    >
                        Editar
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                        onClick={onDelete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export function ProductsListClient() {
    const router = useRouter();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("ACTIVE");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const query: ListProductsQuery = {
                search,
                status: statusFilter,
                limit: 100 // Cap for now
            };

            const res = await productsApi.list(orgId, query);
            setProducts(res.items || []);
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar produtos." });
        } finally {
            setLoading(false);
        }
    }, [orgId, search, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [loadProducts]);

    const handleDelete = (id: string, name: string) => {
        setProductToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        setDeleteLoading(true);
        try {
            await productsApi.delete(orgId, productToDelete.id);
            notificationCenter.add({ type: "success", title: "Sucesso", message: "Produto excluído." });
            loadProducts();
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao excluir produto." });
        } finally {
            setDeleteLoading(false);
        }
    };

    const stats = useMemo(() => {
        return {
            total: products.length,
            lowStock: products.filter(p => p.currentStock <= p.minStock).length,
            totalValue: products.reduce((acc, p) => acc + (p.sellingPrice * p.currentStock), 0)
        };
    }, [products]);

    return (
        <div className="p-8 space-y-8 min-h-screen text-white pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
                        Produtos
                    </h1>
                    <p className="text-white/60 mt-1">Catálogo e gestão de estoque</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/products/new")}
                    className="bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)] border border-amber-400/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Produto
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-white/40">Total de Itens</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-white/40">Estoque Baixo</p>
                            <h3 className="text-3xl font-bold text-red-400 mt-1">{stats.lowStock}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-white/40">Valor em Estoque</p>
                            <h3 className="text-3xl font-bold text-emerald-400 mt-1">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(stats.totalValue)}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 bg-[#090b16]/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, SKU ou categoria..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/80 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                        >
                            <option value="" className="bg-[#090b16]">Todos Status</option>
                            <option value="ACTIVE" className="bg-[#090b16]">Ativos</option>
                            <option value="INACTIVE" className="bg-[#090b16]">Inativos</option>
                            <option value="ARCHIVED" className="bg-[#090b16]">Arquivados</option>
                        </select>
                        <Button variant="outline" size="icon" onClick={loadProducts} className="border-white/10 text-white/60 hover:text-white">
                            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        </Button>
                        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
                    </div>
                </div>

                {loading && products.length === 0 ? (
                    <div className="text-center py-20 text-white/40">Carregando produtos...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-white/40 border border-white/5 border-dashed rounded-xl">Nenhum produto encontrado.</div>
                ) : (
                    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                viewMode={viewMode}
                                onEdit={() => router.push(`/admin/products/${product.id}/edit`)}
                                onDelete={() => handleDelete(product.id, product.name)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setProductToDelete(null);
                }}
                onConfirm={confirmDelete}
                itemName={productToDelete?.name || ""}
                itemType="produto"
                isLoading={deleteLoading}
            />
        </div>
    );
}
