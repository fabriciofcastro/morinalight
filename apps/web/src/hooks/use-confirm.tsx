"use client";

import { useState, useCallback } from "react";
import { ConfirmDialog, ConfirmDialogVariant } from "@/shared/ui/base/confirm-dialog";

interface UseConfirmOptions {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmDialogVariant;
}

interface UseConfirmReturn {
    ConfirmComponent: React.FC;
    confirm: () => Promise<boolean>;
    isOpen: boolean;
}

/**
 * Hook para uso programático de confirmações
 */
export function useConfirm(options: UseConfirmOptions): UseConfirmReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((): Promise<boolean> => {
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (resolvePromise) {
            resolvePromise(true);
            setResolvePromise(null);
        }
        setIsOpen(false);
    }, [resolvePromise]);

    const handleCancel = useCallback(() => {
        if (resolvePromise) {
            resolvePromise(false);
            setResolvePromise(null);
        }
        setIsOpen(false);
    }, [resolvePromise]);

    const ConfirmComponent = useCallback(() => {
        return (
            <ConfirmDialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) handleCancel();
                }}
                onConfirm={handleConfirm}
                title={options.title}
                description={options.description}
                confirmText={options.confirmText}
                cancelText={options.cancelText}
                variant={options.variant}
            />
        );
    }, [isOpen, options, handleConfirm, handleCancel]);

    return {
        ConfirmComponent,
        confirm,
        isOpen,
    };
}
