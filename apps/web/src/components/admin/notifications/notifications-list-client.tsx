"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    Bell,
    Plus,
    Search,
    Trash2,
    Zap,
    Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { notificationRulesApi, NotificationRule } from "@/lib/api/notification-rules";
import { notificationCenter } from "@/components/notifications/notification-center";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";

const RuleCard = ({
    rule,
    onEdit,
    onDelete,
}: {
    rule: NotificationRule;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-[#090b16]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className={cn(
                "absolute top-0 left-0 w-1 h-full shadow-[0_0_10px_currentColor]",
                rule.active ? "bg-emerald-500 text-emerald-500" : "bg-red-500 text-red-500"
            )} />

            <div className="p-5 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg",
                        "bg-cyan-500/10 text-cyan-400"
                    )}>
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg leading-tight truncate pr-4">{rule.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                                {rule.eventType}
                            </span>
                            <span className="text-xs font-medium text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                {rule.scope}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-white/40 line-clamp-2 h-10 mb-2">
                    {rule.description || "Sem descrição."}
                </p>

                <div className="flex gap-1 mb-4 flex-wrap">
                    {rule.channels.map(ch => (
                        <span key={ch} className="text-[10px] uppercase font-bold text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                            {ch}
                        </span>
                    ))}
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

export function NotificationsListClient() {
    const router = useRouter();
    const [rules, setRules] = useState<NotificationRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<{ id: string; name: string } | null>(null);

    const loadRules = useCallback(async () => {
        try {
            setLoading(true);
            const res = await notificationRulesApi.findAll();
            setRules(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error("Erro ao carregar regras:", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar regras de notificação." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRules();
    }, [loadRules]);

    const handleDelete = (id: string, name: string) => {
        setRuleToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!ruleToDelete) return;
        setDeleteLoading(true);
        try {
            await notificationRulesApi.remove(ruleToDelete.id);
            notificationCenter.add({ type: "success", title: "Sucesso", message: "Regra excluída." });
            loadRules();
            setDeleteDialogOpen(false);
            setRuleToDelete(null);
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao excluir regra." });
        } finally {
            setDeleteLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return rules.filter(r =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.eventType.toLowerCase().includes(search.toLowerCase())
        );
    }, [rules, search]);

    const stats = useMemo(() => {
        return {
            total: rules.length,
            active: rules.filter(r => r.active).length,
        };
    }, [rules]);

    return (
        <div className="p-8 space-y-8 min-h-screen text-white pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-cyan-500">
                        Regras de Notificação
                    </h1>
                    <p className="text-white/60 mt-1">Gerencie alertas automáticos do sistema</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/notifications/new")}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Regra
                </Button>
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
                            <p className="text-sm font-medium text-white/40">Total de Regras</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                            <Globe className="w-6 h-6" />
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
                            <p className="text-sm font-medium text-white/40">Ativas</p>
                            <h3 className="text-3xl font-bold text-emerald-400 mt-1">{stats.active}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Zap className="w-6 h-6" />
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
                            placeholder="Buscar por nome ou evento..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-white/40">Carregando regras...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-white/40 border border-white/5 border-dashed rounded-xl">Nenhuma regra encontrada.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(rule => (
                            <RuleCard
                                key={rule.id}
                                rule={rule}
                                onEdit={() => router.push(`/admin/notifications/${rule.id}/edit`)}
                                onDelete={() => handleDelete(rule.id, rule.name)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setRuleToDelete(null);
                }}
                onConfirm={confirmDelete}
                itemName={ruleToDelete?.name || ""}
                itemType="regra"
                isLoading={deleteLoading}
            />
        </div>
    );
}
