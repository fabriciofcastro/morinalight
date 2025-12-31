"use client";

import { toast as sonnerToast } from "sonner";

/**
 * Toast wrapper que mantém a API do notification-center antigo
 * enquanto usa shadcn Sonner por baixo
 */

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationOptions {
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
}

/**
 * API compatível com o notificationCenter antigo
 * Uso: toast.add({ type: 'success', title: 'Sucesso', message: 'Operação realizada' })
 */
export const toast = {
    add: ({ type, title, message, duration = 5000 }: NotificationOptions) => {
        const description = message;

        switch (type) {
            case "success":
                sonnerToast.success(title, { description, duration });
                break;
            case "error":
                sonnerToast.error(title, { description, duration });
                break;
            case "warning":
                sonnerToast.warning(title, { description, duration });
                break;
            case "info":
            default:
                sonnerToast.info(title, { description, duration });
                break;
        }
    },

    // Aliases para uso direto
    success: (title: string, message: string, duration?: number) => {
        sonnerToast.success(title, { description: message, duration });
    },

    error: (title: string, message: string, duration?: number) => {
        sonnerToast.error(title, { description: message, duration });
    },

    warning: (title: string, message: string, duration?: number) => {
        sonnerToast.warning(title, { description: message, duration });
    },

    info: (title: string, message: string, duration?: number) => {
        sonnerToast.info(title, { description: message, duration });
    },
};

/**
 * Re-export do notificationCenter para compatibilidade retroativa
 * Permite usar import { notificationCenter } sem quebrar código existente
 */
export const notificationCenter = toast;
