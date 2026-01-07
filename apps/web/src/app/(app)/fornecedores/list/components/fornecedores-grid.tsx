"use client";

import type { useFornecedoresBulkActions } from "@/hooks/use-fornecedores-bulk-actions";
import { Badge, Button, cn, DataGrid, DataGridItem, GlassCard } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
    Edit,
    Eye,
    FileText,
    Mail,
    MapPin,
    Phone,
    Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { FornecedorItem } from "./types";

interface FornecedoresGridProps {
    data: FornecedorItem[];
    loading: boolean;
    bulkActions: ReturnType<typeof useFornecedoresBulkActions>;
}

export function FornecedoresGrid({
    data,
    loading,
    bulkActions,
}: FornecedoresGridProps) {
    const router = useRouter();
    const { selected, toggleSelection } = bulkActions;

    return (
        <DataGrid
            loading={loading}
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap="md"
        >
            <AnimatePresence mode="popLayout">
                {data.map((fornecedor, index) => {
                    const isFromFichaCusto =
                        "origem" in fornecedor && fornecedor.origem === "ficha-custo";
                    const statusVariant = fornecedor.status === "ativo" ? "success" : fornecedor.status === "inativo" ? "danger" : "warning";

                    return (
                        <DataGridItem key={fornecedor.id} className="h-full">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.02 }}
                                className="h-full"
                                onClick={() => !isFromFichaCusto && toggleSelection(fornecedor.id)}
                            >
                                <GlassCard
                                    className={cn(
                                        "p-6 h-full flex flex-col group relative overflow-hidden transition-all duration-300 hover:border-primary/30 cursor-pointer",
                                        selected.has(fornecedor.id) && "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors truncate">
                                                    {fornecedor.name}
                                                </h3>
                                                {isFromFichaCusto && (
                                                    <Badge variant="info" size="sm">
                                                        Autodetectado
                                                    </Badge>
                                                )}
                                            </div>
                                            <Badge variant={statusVariant} size="sm">
                                                {fornecedor.status}
                                            </Badge>
                                        </div>
                                        {!isFromFichaCusto && (
                                            <input
                                                type="checkbox"
                                                checked={selected.has(fornecedor.id)}
                                                onChange={() => toggleSelection(fornecedor.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 rounded-sm border-white/30 bg-white/5 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] focus:ring-offset-0 cursor-pointer"
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-6 text-sm text-white/60 flex-grow">
                                        {fornecedor.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 text-white/40" />
                                                <span className="truncate">{fornecedor.email}</span>
                                            </div>
                                        )}
                                        {fornecedor.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 text-white/40" />
                                                <span className="truncate">{fornecedor.phone}</span>
                                            </div>
                                        )}
                                        {fornecedor.document && (
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5 text-white/40" />
                                                <span className="truncate font-mono text-xs">
                                                    {fornecedor.document}
                                                </span>
                                            </div>
                                        )}
                                        {(fornecedor.address || fornecedor.city) && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-white/40" />
                                                <span className="truncate">
                                                    {[fornecedor.address, fornecedor.city, fornecedor.state]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-white/5 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!isFromFichaCusto ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/fornecedores/${fornecedor.id}`);
                                                    }}
                                                >
                                                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                                                    Detalhes
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/fornecedores/${fornecedor.id}/edit`);
                                                    }}
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                className="w-full bg-[hsl(var(--primary))/20] hover:bg-[hsl(var(--primary))/30] text-[hsl(var(--primary))] border border-[hsl(var(--primary))/30] rounded-none h-9 text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(
                                                        `/fornecedores/new?nome=${encodeURIComponent(
                                                            fornecedor.name
                                                        )}&documento=${encodeURIComponent(
                                                            fornecedor.document || ""
                                                        )}`
                                                    );
                                                }}
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                Completar Cadastro
                                            </Button>
                                        )}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </DataGridItem>
                    );
                })}
            </AnimatePresence>
        </DataGrid>
    );
}
