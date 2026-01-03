"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@morina/ui";
import { AlertCircle, AlertTriangle, Info, Loader2, Trash2 } from "lucide-react";
import { ReactNode } from "react";

export type ConfirmDialogVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description?: ReactNode;
    confirmText?: string;
    confirmLabel?: string;
    cancelText?: string;
    variant?: ConfirmDialogVariant;
    isLoading?: boolean;
    icon?: ReactNode;
}

const variantConfig = {
    danger: {
        icon: Trash2,
        iconColor: "text-red-500",
        iconBg: "bg-red-500/10",
        confirmClass: "bg-red-600 hover:bg-red-700 text-white",
        borderClass: "border-red-500/20",
    },
    warning: {
        icon: AlertTriangle,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-500/10",
        confirmClass: "bg-amber-600 hover:bg-amber-700 text-white",
        borderClass: "border-amber-500/20",
    },
    info: {
        icon: Info,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-500/10",
        confirmClass: "bg-blue-600 hover:bg-blue-700 text-white",
        borderClass: "border-blue-500/20",
    },
};

/**
 * ConfirmDialog - Componente avançado de confirmação
 * 
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * const [loading, setLoading] = useState(false);
 * 
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   onConfirm={async () => {
 *     setLoading(true);
 *     await deleteItem();
 *     setLoading(false);
 *     setOpen(false);
 *   }}
 *   title="Excluir fornecedor?"
 *   description="Esta ação não pode ser desfeita."
 *   variant="danger"
 *   isLoading={loading}
 * />
 * ```
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText,
    confirmLabel,
    cancelText = "Cancelar",
    variant = "danger",
    isLoading = false,
    icon,
}: ConfirmDialogProps) {
    const config = variantConfig[variant];
    const IconComponent = config.icon;
    const finalConfirmText = confirmLabel || confirmText || "Confirmar";

    const handleConfirm = async () => {
        const result = onConfirm();
        // Se retornar Promise, aguarda
        if (result instanceof Promise) {
            await result;
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                            config.iconBg
                        )}>
                            {icon ? (
                                icon
                            ) : (
                                <IconComponent className={cn("h-6 w-6", config.iconColor)} />
                            )}
                        </div>
                        <div className="flex-1">
                            <AlertDialogTitle className="text-xl font-bold">
                                {title}
                            </AlertDialogTitle>
                            {description && (
                                <AlertDialogDescription className="mt-2 text-sm text-muted-foreground">
                                    {description}
                                </AlertDialogDescription>
                            )}
                        </div>
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel disabled={isLoading}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={cn(config.confirmClass, "min-w-[100px]")}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            finalConfirmText
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/**
 * DeleteConfirmDialog - Atalho específico para confirmações de exclusão
 */
interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    itemName: string;
    itemType?: string;
    isLoading?: boolean;
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    itemName,
    itemType = "item",
    isLoading = false,
}: DeleteConfirmDialogProps) {
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={onConfirm}
            title={`Excluir ${itemType}?`}
            description={
                <>
                    Você está prestes a excluir <strong className="text-foreground">{itemName}</strong>.
                    Esta ação não pode ser desfeita.
                </>
            }
            confirmText="Sim, excluir"
            cancelText="Cancelar"
            variant="danger"
            isLoading={isLoading}
        />
    );
}
