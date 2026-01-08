"use client";

import { BulkActionsBar, Button } from "@morina/ui";
import { CheckCircle2, Download, Trash2 } from "lucide-react";
import { useFornecedoresBulkActions } from "@/hooks/use-fornecedores-bulk-actions";

interface FornecedoresBulkActionsProps {
    bulkActions: ReturnType<typeof useFornecedoresBulkActions>;
    total?: number;
    onExport: () => void;
}

export function FornecedoresBulkActions({ bulkActions, onExport }: FornecedoresBulkActionsProps) {
    const { selected, clearSelection, updateStatus, deleteSelected } = bulkActions;

    return (
        <BulkActionsBar
            selectedCount={selected.size}
            onCancel={clearSelection}
            actions={[
                {
                    label: "Ativar",
                    onClick: () => updateStatus("ativo"),
                    variant: "outline",
                },
                {
                    label: "Exportar",
                    icon: <Download className="h-4 w-4" />,
                    onClick: onExport,
                    variant: "outline",
                },
                {
                    label: "Excluir",
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: deleteSelected,
                    variant: "destructive",
                },
            ]}
        />
    );
}
