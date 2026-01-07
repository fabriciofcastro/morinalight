"use client";

import { cn } from "../../lib/cn";
import { Button } from "../button";

export interface BulkAction {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "outline" | "destructive" | "ghost";
    disabled?: boolean;
}

export interface BulkActionsBarProps {
    selectedCount: number;
    actions: BulkAction[];
    onCancel: () => void;
    className?: string;
}

/**
 * BulkActionsBar component for multi-select actions
 * 
 * Features:
 * - Shows selected item count
 * - Configurable action buttons
 * - Cancel button to clear selection
 * - Glassmorphism styling with primary accent
 * 
 * @example
 * ```tsx
 * <BulkActionsBar
 *   selectedCount={5}
 *   actions={[
 *     {
 *       label: "Ativar",
 *       icon: <CheckCircle2 className="h-4 w-4" />,
 *       onClick: () => handleActivate(),
 *       variant: "outline"
 *     },
 *     {
 *       label: "Excluir",
 *       icon: <Trash2 className="h-4 w-4" />,
 *       onClick: () => handleDelete(),
 *       variant: "destructive"
 *     }
 *   ]}
 *   onCancel={() => clearSelection()}
 * />
 * ```
 */
export function BulkActionsBar({
    selectedCount,
    actions,
    onCancel,
    className,
}: BulkActionsBarProps) {
    if (selectedCount === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                "p-4 rounded-none border-l-4 border-l-[hsl(var(--primary))]",
                "bg-white/[0.02] backdrop-blur-sm border border-white/10",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">
                        {selectedCount} {selectedCount === 1 ? "item selecionado" : "itens selecionados"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant || "outline"}
                            size="sm"
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={cn(
                                "gap-2 rounded-none",
                                action.variant === "destructive" && "text-red-500 hover:text-red-600"
                            )}
                        >
                            {action.icon}
                            {action.label}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                        className="rounded-none"
                    >
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
}
