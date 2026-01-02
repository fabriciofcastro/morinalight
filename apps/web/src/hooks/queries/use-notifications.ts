/**
 * Notifications Query Hooks
 * 
 * Hooks do TanStack Query para gerenciar notificações
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/base";
import { queryKeys, queryConfigs } from "@/lib/query/client";
import type { QueryParams } from "@/lib/api/factory";

/**
 * Tipo de notificação
 */
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    createdAt: string;
}

/**
 * Hook para listar notificações não lidas
 */
export function useUnreadNotifications() {
    return useQuery({
        queryKey: queryKeys.notifications.unread(),
        queryFn: async () => {
            const response = await apiClient.get<Notification[]>("/notifications/unread");
            return response;
        },
        ...queryConfigs.realtime, // Refetch a cada 30s
    });
}

/**
 * Hook para listar todas as notificações
 */
export function useNotifications(params?: QueryParams) {
    return useQuery({
        queryKey: queryKeys.notifications.list(params || {}),
        queryFn: async () => {
            const response = await apiClient.get<Notification[]>("/notifications", { params });
            return response;
        },
    });
}

/**
 * Hook para marcar notificação como lida
 */
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

/**
 * Hook para marcar todas como lidas
 */
export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await apiClient.post("/notifications/mark-all-read");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

/**
 * Hook para deletar notificação
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/notifications/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}

/**
 * Hook para contador de não lidas
 */
export function useUnreadCount() {
    const { data: notifications } = useUnreadNotifications();
    return notifications?.length || 0;
}
