"use client";

import { useFornecedoresBulkActions } from "@/hooks/use-fornecedores-bulk-actions";
import { useFornecedoresFilters } from "@/hooks/use-fornecedores-filters";
import { Button, ListControls, ViewToggle } from "@morina/ui";
import { Filter, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FornecedoresBulkActions } from "./fornecedores-bulk-actions";

interface FornecedoresControlsProps {
    filters: ReturnType<typeof useFornecedoresFilters>;
    bulkActions: ReturnType<typeof useFornecedoresBulkActions>;
    total: number;
    onBulkExport: () => void;
}

export function FornecedoresControls({
    filters,
    bulkActions,
    total,
    onBulkExport,
}: FornecedoresControlsProps) {
    const router = useRouter();
    const { filters: state, setSearch, setViewMode, toggleAdvanced } = filters;
    const { selected } = bulkActions;

    return (
        <ListControls
            searchValue={state.search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar por nome, documento ou email..."
            hasSelection={selected.size > 0}
            bulkActions={
                <FornecedoresBulkActions
                    bulkActions={bulkActions}
                    total={total}
                    onExport={onBulkExport}
                />
            }
            filterButton={
                <Button
                    variant={state.showAdvanced ? "gradient" : "outline"}
                    onClick={toggleAdvanced}
                    className="gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filtros
                </Button>
            }
            viewToggle={
                <ViewToggle
                    value={state.viewMode}
                    onChange={(v) => setViewMode(v as "grid" | "list")}
                />
            }
            actions={
                <Button onClick={() => router.push("/fornecedores/new")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Fornecedor
                </Button>
            }
        />
    );
}
