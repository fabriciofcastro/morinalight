"use client";

import { useState, useCallback } from "react";
import { suppliersApi } from "@/lib/api/suppliers";
import { notificationCenter } from "@/components/notifications/notification-center";

/**
 * Custom hook for managing bulk actions on fornecedores
 */
export function useFornecedoresBulkActions(orgId: string, onSuccess?: () => void) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleSelection = useCallback((id: string) => {
        setSelected((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const selectAll = useCallback((ids: string[]) => {
        setSelected(new Set(ids));
    }, []);

    const clearSelection = useCallback(() => {
        setSelected(new Set());
    }, []);

    const updateStatus = useCallback(
        async (status: string) => {
            if (selected.size === 0) return;

            setIsProcessing(true);
            try {
                await Promise.all(
                    Array.from(selected).map((id) =>
                        suppliersApi.update(orgId, id, { status: status as any })
                    )
                );

                notificationCenter.add({
                    type: "success",
                    title: "Status atualizado",
                    message: `${selected.size} fornecedor(es) atualizado(s) com sucesso.`,
                });

                clearSelection();
                onSuccess?.();
            } catch {
                notificationCenter.add({
                    type: "error",
                    title: "Erro",
                    message: "Não foi possível atualizar o status dos fornecedores.",
                });
            } finally {
                setIsProcessing(false);
            }
        },
        [orgId, selected, onSuccess, clearSelection]
    );

    const deleteSelected = useCallback(async () => {
        if (selected.size === 0) return;

        setIsProcessing(true);
        try {
            await Promise.all(
                Array.from(selected).map((id) => suppliersApi.delete(orgId, id))
            );

            notificationCenter.add({
                type: "success",
                title: "Fornecedores deletados",
                message: `${selected.size} fornecedor(es) deletado(s) com sucesso.`,
            });

            clearSelection();
            onSuccess?.();
        } catch {
            notificationCenter.add({
                type: "error",
                title: "Erro",
                message: "Não foi possível deletar os fornecedores.",
            });
        } finally {
            setIsProcessing(false);
        }
    }, [orgId, selected, onSuccess, clearSelection]);

    return {
        selected,
        isProcessing,
        toggleSelection,
        selectAll,
        clearSelection,
        updateStatus,
        deleteSelected,
    };
}
