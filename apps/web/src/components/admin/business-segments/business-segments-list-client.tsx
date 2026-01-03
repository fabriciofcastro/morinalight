"use client";

import { AllowedGuard } from "@/components/auth/allowed-guard";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    Globe,
    Plus,
    Search,
    Trash2,
    Factory,
    CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { organizationalStructureApi, BusinessSegment } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";

const SegmentCard = ({
    segment,
    onEdit,
    onDelete,
}: {
    segment: BusinessSegment;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-[#090b16]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-orange-500/30 transition-all duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className={cn(
                "absolute top-0 left-0 w-1 h-full shadow-[0_0_10px_currentColor]",
                segment.active ? "bg-emerald-500 text-emerald-500" : "bg-red-500 text-red-500"
            )} />

            <div className="p-5 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg",
                        "bg-orange-500/10 text-orange-400"
                    )}>
                        <Factory className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg leading-tight">{segment.description}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                                {segment.code}
                            </span>
                        </div>
                    </div>
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

export function BusinessSegmentsListClient() {
    const router = useRouter();
    const [segments, setSegments] = useState<BusinessSegment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [segmentToDelete, setSegmentToDelete] = useState<{ id: string; description: string } | null>(null);

    const loadSegments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await organizationalStructureApi.getBusinessSegments();
            setSegments(Array.isArray(data) ? data : (data as any).data || []);
        } catch (error) {
            console.error("Erro ao carregar segmentos:", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar segmentos." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSegments();
    }, [loadSegments]);

    const handleDelete = (id: string, description: string) => {
        setSegmentToDelete({ id, description });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!segmentToDelete) return;
        setDeleteLoading(true);
        try {
            await organizationalStructureApi.deleteBusinessSegment(segmentToDelete.id);
            notificationCenter.add({ type: "success", title: "Sucesso", message: "Segmento excluído." });
            loadSegments();
            setDeleteDialogOpen(false);
            setSegmentToDelete(null);
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao excluir segmento." });
        } finally {
            setDeleteLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return segments.filter(s =>
            s.description.toLowerCase().includes(search.toLowerCase()) ||
            s.code.toLowerCase().includes(search.toLowerCase())
        );
    }, [segments, search]);

    const stats = useMemo(() => {
        return {
            total: segments.length,
            active: segments.filter(s => s.active).length,
        };
    }, [segments]);

    return (
        <AllowedGuard I="read" a={"BusinessSegment" as any} redirectTo="/admin">
            <div className="p-8 space-y-8 min-h-screen text-white pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-orange-500">
                            Segmentos de Negócio
                        </h1>
                        <p className="text-white/60 mt-1">Classificação estratégica para análise de mercado</p>
                    </div>
                    <Button
                        onClick={() => router.push("/admin/business-segments/new")}
                        className="bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] border border-orange-400/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Segmento
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm font-medium text-white/40">Total de Segmentos</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                                <Globe className="w-6 h-6" />
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
                                placeholder="Buscar segmento..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-white/40">Carregando segmentos...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-white/40 border border-white/5 border-dashed rounded-xl">Nenhum segmento encontrado.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map(segment => (
                                <SegmentCard
                                    key={segment.id}
                                    segment={segment}
                                    onEdit={() => router.push(`/admin/business-segments/${segment.id}/edit`)}
                                    onDelete={() => handleDelete(segment.id, segment.description)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <DeleteConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={(open) => {
                        setDeleteDialogOpen(open);
                        if (!open) setSegmentToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    itemName={segmentToDelete?.description || ""}
                    itemType="segmento"
                    isLoading={deleteLoading}
                />
            </div>
        </AllowedGuard>
    );
}
