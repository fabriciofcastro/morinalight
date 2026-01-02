"use client";

import { useState, useCallback } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";

interface BulkActionOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export function useBulkActions(options: BulkActionOptions = {}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const executeBulkAction = useCallback(
        async (
            action: "activate" | "deactivate" | "suspend" | "delete",
            userIds: string[]
        ) => {
            if (userIds.length === 0) {
                notificationCenter.add({
                    type: "warning",
                    title: "Nenhum usuário selecionado",
                    message: "Selecione pelo menos um usuário para executar esta ação.",
                });
                return { success: false };
            }

            // Confirmação removida do hook - deve ser tratada pela UI antes de chamar executeBulkAction

            setLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/users/bulk-action", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action,
                        userIds,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response
                        .json()
                        .catch(() => ({ message: "Erro ao executar ação em massa" }));
                    throw new Error(errorData.message || "Falha ao executar ação");
                }

                const result = await response.json();

                // Success notification
                const actionLabels: Record<string, string> = {
                    activate: "ativados",
                    deactivate: "desativados",
                    suspend: "suspensos",
                    delete: "deletados",
                };

                notificationCenter.add({
                    type: "success",
                    title: "Ação executada com sucesso",
                    message: `${result.affected || userIds.length} usuário(s) ${actionLabels[action]} com sucesso.`,
                });

                options.onSuccess?.();
                setLoading(false);
                return { success: true, result };
            } catch (err) {
                const error = err instanceof Error ? err : new Error("Erro desconhecido");
                setError(error);

                notificationCenter.add({
                    type: "error",
                    title: "Erro na ação em massa",
                    message: error.message,
                });

                options.onError?.(error);
                setLoading(false);
                return { success: false, error };
            }
        },
        [options]
    );

    const activateUsers = useCallback(
        (userIds: string[]) => executeBulkAction("activate", userIds),
        [executeBulkAction]
    );

    const deactivateUsers = useCallback(
        (userIds: string[]) => executeBulkAction("deactivate", userIds),
        [executeBulkAction]
    );

    const suspendUsers = useCallback(
        (userIds: string[]) => executeBulkAction("suspend", userIds),
        [executeBulkAction]
    );

    const deleteUsers = useCallback(
        (userIds: string[]) => executeBulkAction("delete", userIds),
        [executeBulkAction]
    );

    return {
        loading,
        error,
        executeBulkAction,
        activateUsers,
        deactivateUsers,
        suspendUsers,
        deleteUsers,
    };
}
