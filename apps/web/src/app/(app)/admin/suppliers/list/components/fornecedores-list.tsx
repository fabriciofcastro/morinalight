"use client";

import type { useFornecedoresBulkActions } from "@/hooks/use-fornecedores-bulk-actions";
import { DataTable } from "@morina/ui";
import { useRouter } from "next/navigation";
import { useFornecedoresColumns } from "../../fornecedores-table-columns";
import type { FornecedorItem } from "./types";

interface FornecedoresListProps {
    data: FornecedorItem[];
    loading: boolean;
    bulkActions: ReturnType<typeof useFornecedoresBulkActions>;
}

export function FornecedoresList({
    data,
    loading,
    bulkActions,
}: FornecedoresListProps) {
    const router = useRouter();
    const columns = useFornecedoresColumns();
    const { selected } = bulkActions;

    return (
        <DataTable
            columns={columns as any}
            data={data}
            loading={loading}
            onRowClick={(row) => {
                const isFromFichaCusto = "origem" in row && row.origem === "ficha-custo";
                if (!isFromFichaCusto) {
                    router.push(`/fornecedores/${row.id}`);
                }
            }}
            enableRowSelection
            state={{
                rowSelection: Object.fromEntries(
                    Array.from(selected).map((id) => {
                        const index = data.findIndex((r) => r.id === id);
                        return index !== -1 ? [index, true] : null;
                    }).filter((item): item is [number, boolean] => item !== null)
                )
            }}
            onRowSelectionChange={(updater) => {
                // Synchronization logic if needed, but Fornecedores uses a custom hook 'selected'
                // For now, we assume selection is handled by the hook and sync is one-way
            }}
        />
    );
}
