"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    Plus,
    Search,
    Trash2,
    Users,
    Building2,
    User,
    MapPin,
    RefreshCw,
    Phone,
    Mail,
    Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { clientsApi, Client, ListClientsQuery } from "@/lib/api/clients";
import { notificationCenter } from "@/components/notifications/notification-center";
import { FuturisticSelect } from "@/components/ui/futuristic-ui";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { AllowedGuard } from "@/components/auth/allowed-guard";
import { Can } from "@/lib/auth";

const ClientCard = ({
    client,
    onEdit,
    onDelete,
    viewMode = "grid",
}: {
    client: Client;
    onEdit: () => void;
    onDelete: () => void;
    viewMode?: "grid" | "list";
}) => {
    if (viewMode === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center justify-between p-4 bg-[#090b16]/60 backdrop-blur-xl border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all duration-300"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border border-white/10 shadow-lg",
                        "bg-cyan-500/10 text-cyan-400"
                    )}>
                        {client.type === "PJ" ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base leading-tight truncate">{client.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            {client.city && (
                                <span className="text-xs text-white/40 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {client.city}/{client.state}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col text-right text-xs text-white/60">
                        {client.email && <span>{client.email}</span>}
                        {client.phone && <span>{client.phone}</span>}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full border",
                            client.status === "ACTIVE" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                                client.status === "LEAD" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                    "bg-white/10 border-white/20 text-white/40"
                        )}>
                            {client.status}
                        </span>

                        <div className="flex gap-1">
                            <Can I="update" a="Client">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={onEdit}>
                                    <Users className="w-4 h-4" />
                                </Button>
                            </Can>
                            <Can I="delete" a="Client">
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
            className="group relative bg-[#090b16]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Status Stripe */}
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full shadow-[0_0_10px_currentColor]",
                client.status === "ACTIVE" ? "bg-cyan-500 text-cyan-500" :
                    client.status === "LEAD" ? "bg-amber-500 text-amber-500" :
                        "bg-white/20 text-white/20"
            )} />

            <div className="p-5 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border border-white/10 shadow-lg",
                        "bg-cyan-500/10 text-cyan-400"
                    )}>
                        {client.type === "PJ" ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-white text-lg leading-tight truncate">{client.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            {client.city && (
                                <span className="text-xs text-white/40 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {client.city}/{client.state}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-white/60">
                    {client.phone && (
                        <div className="flex items-center gap-2 truncate">
                            <Phone className="w-3 h-3 text-white/40" />
                            <span>{client.phone}</span>
                        </div>
                    )}
                    {client.email && (
                        <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3 h-3 text-white/40" />
                            <span className="truncate">{client.email}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 pt-2 border-t border-white/5">
                    <div className="text-center">
                        <span className="text-xs text-white/40 block">Status</span>
                        <span className={cn(
                            "text-sm font-bold",
                            client.status === "ACTIVE" ? "text-cyan-400" :
                                client.status === "LEAD" ? "text-amber-400" : "text-white/60"
                        )}>
                            {client.status}
                        </span>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <span className="text-xs text-white/40 block">Vendas</span>
                        <span className="text-sm font-bold text-white">
                            {client.totalPurchases || 0}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                    <Can I="update" a="Client">
                        <Button
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                        >
                            Editar
                        </Button>
                    </Can>
                    <Can I="delete" a="Client">
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

export function ClientsListClient() {
    const router = useRouter();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);

    const loadClients = useCallback(async () => {
        try {
            setLoading(true);
            const query: ListClientsQuery = {
                search,
                status: statusFilter !== "ALL" ? statusFilter : undefined,
                limit: 100
            };

            const res = await clientsApi.list(orgId, query);
            setClients(res.items || []);
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar clientes." });
        } finally {
            setLoading(false);
        }
    }, [orgId, search, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadClients();
        }, 500);
        return () => clearTimeout(timer);
    }, [loadClients]);

    const handleDelete = (id: string, name: string) => {
        setClientToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        setDeleteLoading(true);
        try {
            await clientsApi.delete(orgId, clientToDelete.id);
            notificationCenter.add({ type: "success", title: "Sucesso", message: "Cliente excluído." });
            loadClients();
            setDeleteDialogOpen(false);
            setClientToDelete(null);
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao excluir cliente." });
        } finally {
            setDeleteLoading(false);
        }
    };

    const stats = useMemo(() => {
        return {
            total: clients.length,
            active: clients.filter(c => c.status === "ACTIVE").length,
            leads: clients.filter(c => c.status === "LEAD").length,
        };
    }, [clients]);

    return (
        <AllowedGuard I="read" a="Client" redirectTo="/admin">
            <div className="p-8 space-y-8 min-h-screen text-white pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-cyan-500">
                            Clientes
                        </h1>
                        <p className="text-white/60 mt-1">Gestão de relacionamento e vendas</p>
                    </div>
                    <Can I="create" a="Client">
                        <Button
                            onClick={() => router.push("/admin/clients/new")}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/20"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Cliente
                        </Button>
                    </Can>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm font-medium text-white/40">Total da Base</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-2xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm font-medium text-white/40">Ativos</p>
                                <h3 className="text-3xl font-bold text-emerald-400 mt-1">{stats.active}</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Zap className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-2xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm font-medium text-white/40">Leads / Potenciais</p>
                                <h3 className="text-3xl font-bold text-amber-400 mt-1">
                                    {stats.leads}
                                </h3>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                                <User className="w-6 h-6" />
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
                                placeholder="Buscar por nome, documento ou cidade..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/80 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                            >
                                <option value="ALL" className="bg-[#090b16]">Todos Status</option>
                                <option value="ACTIVE" className="bg-[#090b16]">Ativos</option>
                                <option value="LEAD" className="bg-[#090b16]">Leads</option>
                                <option value="INACTIVE" className="bg-[#090b16]">Inativos</option>
                            </select>
                            <Button variant="outline" size="icon" onClick={loadClients} className="border-white/10 text-white/60 hover:text-white">
                                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                            </Button>
                            <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
                        </div>
                    </div>

                    {loading && clients.length === 0 ? (
                        <div className="text-center py-20 text-white/40">Carregando clientes...</div>
                    ) : clients.length === 0 ? (
                        <div className="text-center py-20 text-white/40 border border-white/5 border-dashed rounded-xl">Nenhum cliente encontrado.</div>
                    ) : (
                        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                            {clients.map(client => (
                                <ClientCard
                                    key={client.id}
                                    client={client}
                                    viewMode={viewMode}
                                    onEdit={() => router.push(`/admin/clients/${client.id}/edit`)}
                                    onDelete={() => handleDelete(client.id, client.name)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <DeleteConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={(open) => {
                        setDeleteDialogOpen(open);
                        if (!open) setClientToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    itemName={clientToDelete?.name || ""}
                    itemType="cliente"
                    isLoading={deleteLoading}
                />
            </div>
        </AllowedGuard>
    );
}
