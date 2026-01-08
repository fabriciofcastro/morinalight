"use client";

import { AllowedGuard } from "@/components/auth/allowed-guard";
import { notificationCenter } from "@/shared/ui/notification-center";
import { DeleteConfirmDialog } from "@/shared/ui/base/confirm-dialog";
import { ViewModeToggle } from "@/shared/ui/base/view-mode-toggle";
import { useCurrentUser } from "@/hooks/queries/use-auth";
import { ListSuppliersQuery, Supplier, suppliersApi } from "@/lib/api/suppliers";
import { Can } from "@/lib/auth";
import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    FileText,
    Mail,
    Phone,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Truck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const SupplierCard = ({
    supplier,
    onEdit,
    onDelete,
    viewMode = "grid",
}: {
    supplier: Supplier;
    onEdit: () => void;
    onDelete: () => void;
    viewMode?: "grid" | "list";
}) => {
    if (viewMode === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center justify-between p-4 bg-[#090b16]/60 backdrop-blur-xl border border-white/10 rounded-xl hover:border-blue-500/30 transition-all duration-300"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg",
                        "bg-blue-500/10 text-blue-400"
                    )}>
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base leading-tight truncate">{supplier.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            {supplier.document && (
                                <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> {supplier.document}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col text-right text-xs text-white/60">
                        {supplier.contatoPrincipal && (
                            <div className="flex items-center justify-end gap-1 text-white/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                <span>{supplier.contatoPrincipal}</span>
                            </div>
                        )}
                        {(supplier.email || supplier.phone) && <span className="opacity-60">{supplier.email || supplier.phone}</span>}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full border",
                            supplier.status === "ACTIVE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                "bg-white/10 border-white/20 text-white/40"
                        )}>
                            {supplier.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </span>

                        <div className="flex gap-1">
                            <Can I="update" a="Supplier">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={onEdit}>
                                    <FileText className="w-4 h-4" />
                                </Button>
                            </Can>
                            <Can I="delete" a="Supplier">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/60 hover:text-red-400 hover:bg-red-500/10" onClick={onDelete}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </Can>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-[#090b16]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className={cn(
                "absolute top-0 left-0 w-1 h-full shadow-[0_0_10px_currentColor]",
                supplier.status === "ACTIVE" ? "bg-emerald-500 text-emerald-500" : "bg-white/20 text-white/20"
            )} />

            <div className="p-5 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg",
                        "bg-blue-500/10 text-blue-400"
                    )}>
                        <Truck className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-white text-lg leading-tight truncate">{supplier.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            {supplier.document && (
                                <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> {supplier.document}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-white/60">
                    {supplier.contatoPrincipal && (
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                            <span>{supplier.contatoPrincipal}</span>
                        </div>
                    )}
                    {supplier.email && (
                        <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3 h-3 text-white/40" />
                            <span className="truncate">{supplier.email}</span>
                        </div>
                    )}
                    {supplier.phone && (
                        <div className="flex items-center gap-2 truncate">
                            <Phone className="w-3 h-3 text-white/40" />
                            <span>{supplier.phone}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/5">
                    <Can I="update" a="Supplier">
                        <Button
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                        >
                            Editar
                        </Button>
                    </Can>
                    <Can I="delete" a="Supplier">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-9 h-9 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                            onClick={onDelete}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </Can>
                </div>
            </div>
        </motion.div>
    );
};

export function SuppliersListClient() {
    const router = useRouter();
    // Mock auth for now if hook doesn't exist or return what we need, replacing later
    const { data: user } = useCurrentUser();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);

    const loadSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            const query: ListSuppliersQuery = {
                busca: search,
                status: statusFilter !== "ALL" ? statusFilter : undefined
            };

            const res = await suppliersApi.list(orgId, query);
            setSuppliers(res.itens || []);
        } catch (error) {
            console.error("Erro ao carregar fornecedores:", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar fornecedores." });
        } finally {
            setLoading(false);
        }
    }, [orgId, search, statusFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadSuppliers();
        }, 500);
        return () => clearTimeout(timer);
    }, [loadSuppliers]);

    const handleDelete = (id: string, name: string) => {
        setSupplierToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!supplierToDelete) return;

        setDeleteLoading(true);
        try {
            await suppliersApi.delete(orgId, supplierToDelete.id);
            notificationCenter.add({ type: "success", title: "Sucesso", message: "Fornecedor excluído." });
            loadSuppliers();
            setDeleteDialogOpen(false);
            setSupplierToDelete(null);
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao excluir fornecedor." });
        } finally {
            setDeleteLoading(false);
        }
    };

    const stats = useMemo(() => {
        return {
            total: suppliers.length,
            active: suppliers.filter(s => s.status === "ACTIVE").length,
        };
    }, [suppliers]);

    return (
        <AllowedGuard I="read" a="Supplier" redirectTo="/admin">
            <div className="p-8 space-y-8 min-h-screen text-white pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-blue-500">
                            Fornecedores
                        </h1>
                        <p className="text-white/60 mt-1">Gestão da cadeia de suprimentos</p>
                    </div>
                    <Can I="create" a="Supplier">
                        <Button
                            onClick={() => router.push("/admin/suppliers/new")}
                            className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Fornecedor
                        </Button>
                    </Can>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm font-medium text-white/40">Total Cadastrado</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                <Truck className="w-6 h-6" />
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
                                placeholder="Buscar por nome, documento ou e-mail..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/80 focus:outline-none focus:border-blue-500/50 cursor-pointer"
                            >
                                <option value="ALL" className="bg-[#090b16]">Todos Status</option>
                                <option value="ACTIVE" className="bg-[#090b16]">Ativos</option>
                                <option value="INACTIVE" className="bg-[#090b16]">Inativos</option>
                            </select>
                            <Button variant="outline" size="icon" onClick={loadSuppliers} className="border-white/10 text-white/60 hover:text-white">
                                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                            </Button>
                            <ViewModeToggle viewMode={viewMode} onChange={(mode) => setViewMode(mode as "grid" | "list")} />
                        </div>
                    </div>

                    {loading && suppliers.length === 0 ? (
                        <div className="text-center py-20 text-white/40">Carregando fornecedores...</div>
                    ) : suppliers.length === 0 ? (
                        <div className="text-center py-20 text-white/40 border border-white/5 border-dashed rounded-xl">Nenhum fornecedor encontrado.</div>
                    ) : (
                        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                            {suppliers.map(supplier => (
                                <SupplierCard
                                    key={supplier.id}
                                    supplier={supplier}
                                    viewMode={viewMode}
                                    onEdit={() => router.push(`/admin/suppliers/${supplier.id}/edit`)}
                                    onDelete={() => handleDelete(supplier.id, supplier.name)}
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
                        if (!open) setSupplierToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    itemName={supplierToDelete?.name || ""}
                    itemType="fornecedor"
                    isLoading={deleteLoading}
                />
            </div>
        </AllowedGuard>
    );
}
