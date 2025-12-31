"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    GitMerge,
    Plus,
    Search,
    Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { organizationalStructureApi, WorkflowPolicy } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";

const PolicyCard = ({
    policy,
    onEdit,
    onDelete,
}: {
    policy: WorkflowPolicy;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const stepsCount = (policy.config as any)?.steps?.length || 0;

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
                        <GitMerge className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg leading-tight">{policy.module}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {policy.flowType}
                            </span>
                            <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                                {stepsCount} steps
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-6 min-h-[40px] text-xs text-white/40">
                    {policy.active ? (
                        <span className="text-emerald-500 flex items-center gap-1">● Ativo</span>
                    ) : (
                        <span className="text-red-500 flex items-center gap-1">● Inativo</span>
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

export function ApprovalsListClient() {
    const router = useRouter();
    const [policies, setPolicies] = useState<WorkflowPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState<{ id: string; module: string } | null>(null);

    const loadPolicies = useCallback(async () => {
        try {
            setLoading(true);
            const data = await organizationalStructureApi.getWorkflowPolicies();
            setPolicies(Array.isArray(data) ? data : (data as any).data || []);
        } catch (error) {
            console.error("Erro ao carregar policies:", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar fluxos de aprovação." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPolicies();
    }, [loadPolicies]);

    const handleDelete = (id: string, module: string) => {
        setPolicyToDelete({ id, module });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!policyToDelete) return;
        setDeleteLoading(true);
        try {
            await organizationalStructureApi.deleteWorkflowPolicy(policyToDelete.id);
            notificationCenter.add({ type: "success", title: "Sucesso", message: "Fluxo excluído." });
            loadPolicies();
            setDeleteDialogOpen(false);
            setPolicyToDelete(null);
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao excluir fluxo." });
        } finally {
            setDeleteLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return policies.filter(p =>
            p.module.toLowerCase().includes(search.toLowerCase())
        );
    }, [policies, search]);

    return (
        <div className="p-8 space-y-8 min-h-screen text-white pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Aprovações RBAC
                    </h1>
                    <p className="text-white/60 mt-1">Configure fluxos de aprovação por módulo</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/access/approvals/new")}
                    className="bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] border border-violet-400/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Fluxo
                </Button>
            </div>

            <div className="space-y-4">
                <div className="flex gap-4 bg-[#090b16]/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Buscar por módulo..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-white/40">Carregando fluxos...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-white/40 border border-white/5 border-dashed rounded-xl">Nenhum fluxo encontrado.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(policy => (
                            <PolicyCard
                                key={policy.id}
                                policy={policy}
                                onEdit={() => router.push(`/admin/access/approvals/${policy.id}/edit`)}
                                onDelete={() => handleDelete(policy.id, policy.module)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setPolicyToDelete(null);
                }}
                onConfirm={confirmDelete}
                itemName={`Fluxo do módulo ${policyToDelete?.module || ""}`}
                itemType="fluxo"
                isLoading={deleteLoading}
            />
        </div>
    );
}
