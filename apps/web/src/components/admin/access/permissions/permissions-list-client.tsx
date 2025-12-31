"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    Key,
    CheckCircle2,
    Lock,
    Plus,
    Search,
    Trash2,
    ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { permissionsApi, Permission } from "@/lib/api/permissions";
import { notificationCenter } from "@/components/notifications/notification-center";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";

const PermissionCard = ({
    permission,
    onEdit,
    onDelete,
}: {
    permission: Permission;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-[#090b16]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-violet-500/30 transition-all duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-5 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg bg-violet-500/10 text-violet-400">
                        <Key className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg leading-tight">{permission.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                                {permission.code}
                            </span>
                            <span className="text-xs font-medium text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {permission.module}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-6 min-h-[40px] text-xs text-white/40">
                    {permission.description ? (
                        <p className="line-clamp-2 mb-2">{permission.description}</p>
                    ) : (
                        <p className="italic opacity-50">Sem descrição</p>
                    )}
                </div>

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

export function PermissionsListClient() {
    const router = useRouter();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState<{ id: string; name: string } | null>(null);

    const loadPermissions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await permissionsApi.getPermissions();
            setPermissions(data);
        } catch (error) {
            console.error("Erro ao carregar permissões:", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar permissões." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    const handleDelete = (id: string, name: string) => {
        setPermissionToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!permissionToDelete) return;
        setDeleteLoading(true);
        try {
            await permissionsApi.deletePermission(permissionToDelete.id);
            notificationCenter.add({ type: "success", title: "Sucesso", message: "Permissão excluída." });
            loadPermissions();
            setDeleteDialogOpen(false);
            setPermissionToDelete(null);
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao excluir permissão." });
        } finally {
            setDeleteLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return permissions.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.code.toLowerCase().includes(search.toLowerCase()) ||
            p.module.toLowerCase().includes(search.toLowerCase())
        );
    }, [permissions, search]);

    const stats = useMemo(() => {
        return {
            total: permissions.length,
            modules: new Set(permissions.map(p => p.module)).size,
        };
    }, [permissions]);

    return (
        <div className="p-8 space-y-8 min-h-screen text-white pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Permissões
                    </h1>
                    <p className="text-white/60 mt-1">Gerencie a granularidade de acesso aos recursos</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/access/permissions/new")}
                    className="bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] border border-violet-400/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Permissão
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-white/40">Total de Permissões</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                            <Key className="w-6 h-6" />
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
                            <p className="text-sm font-medium text-white/40">Módulos</p>
                            <h3 className="text-3xl font-bold text-emerald-400 mt-1">{stats.modules}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-4 bg-[#090b16]/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Buscar permissão..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-white/40">Carregando permissões...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-white/40 border border-white/5 border-dashed rounded-xl">Nenhuma permissão encontrada.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(permission => (
                            <PermissionCard
                                key={permission.id}
                                permission={permission}
                                onEdit={() => router.push(`/admin/access/permissions/${permission.id}/edit`)}
                                onDelete={() => handleDelete(permission.id, permission.name)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setPermissionToDelete(null);
                }}
                onConfirm={confirmDelete}
                itemName={permissionToDelete?.name || ""}
                itemType="permissão"
                isLoading={deleteLoading}
            />
        </div>
    );
}
