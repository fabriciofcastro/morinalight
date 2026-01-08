"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@morina/ui";
import {
    CheckCircle2,
    XCircle,
    Trash2,
    Download,
} from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type { FornecedorCompleto } from "./fornecedores-table-columns";

export interface FornecedoresBulkActionsProps {
    table: Table<FornecedorCompleto>;
    onStatusChange: (status: string) => void;
    onDelete: () => void;
    onExport: () => void;
}

export function FornecedoresBulkActions({
    table,
    onStatusChange,
    onDelete,
    onExport,
}: FornecedoresBulkActionsProps) {
    const selectedCount = table.getFilteredSelectedRowModel().rows.length;

    if (selectedCount === 0) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-4 p-4 rounded-none border border-[hsl(var(--primary))/30] bg-[hsl(var(--primary))/10] backdrop-blur-md"
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-none bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] font-bold text-xs">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-medium text-[hsl(var(--primary))]">
                        selecionados
                    </span>
                </div>
                <div className="h-6 w-px bg-[hsl(var(--primary))/30]" />
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => onStatusChange("ativo")}
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-none h-8 text-xs"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        Ativar
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onStatusChange("inativo")}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-none h-8 text-xs"
                    >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                        Desativar
                    </Button>
                    <Button
                        size="sm"
                        onClick={onDelete}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-none h-8 text-xs ml-auto"
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Deletar
                    </Button>
                    <Button
                        size="sm"
                        onClick={onExport}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-none h-8 text-xs"
                    >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Exportar
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
