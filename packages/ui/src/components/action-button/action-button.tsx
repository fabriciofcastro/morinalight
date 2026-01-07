"use client";

import { Edit, Eye, Trash2, Download } from "lucide-react";
import React from "react";
import { Button, type ButtonProps } from "../button";
import { cn } from "../../lib/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

export type ActionButtonAction = "edit" | "view" | "delete" | "export" | "custom";

export interface ActionButtonProps extends Omit<ButtonProps, "leftIcon"> {
    /**
     * Type of action to determine icon and style defaults
     */
    action?: ActionButtonAction;
    /**
     * Tooltip text
     */
    tooltip?: string;
}

/**
 * ActionButton - Specialized button for common actions with consistent styling
 *
 * @example
 * <ActionButton action="edit" onClick={handleEdit} />
 * <ActionButton action="delete" onClick={handleDelete} />
 */
export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
    ({ action = "custom", tooltip, className, variant, size = "sm", children, ...props }, ref) => {

        const getActionConfig = (actionType: ActionButtonAction) => {
            switch (actionType) {
                case "edit":
                    return {
                        icon: Edit,
                        defaultVariant: "ghost" as const,
                        defaultTooltip: "Editar",
                        className: "text-blue-500 hover:text-blue-600 hover:bg-blue-500/10",
                    };
                case "view":
                    return {
                        icon: Eye,
                        defaultVariant: "ghost" as const,
                        defaultTooltip: "Visualizar",
                        className: "text-gray-500 hover:text-gray-600 hover:bg-gray-500/10",
                    };
                case "delete":
                    return {
                        icon: Trash2,
                        defaultVariant: "ghost" as const,
                        defaultTooltip: "Excluir",
                        className: "text-red-500 hover:text-red-600 hover:bg-red-500/10",
                    };
                case "export":
                    return {
                        icon: Download,
                        defaultVariant: "outline" as const,
                        defaultTooltip: "Exportar",
                        className: "",
                    };
                default:
                    return {
                        icon: undefined,
                        defaultVariant: "default" as const,
                        defaultTooltip: undefined,
                        className: "",
                    };
            }
        };

        const config = getActionConfig(action);
        const resolvedVariant = variant || config.defaultVariant;
        const resolvedTooltip = tooltip || config.defaultTooltip;
        const Icon = config.icon;

        const button = (
            <Button
                ref={ref}
                variant={resolvedVariant}
                size={size}
                className={cn(config.className, className)}
                leftIcon={Icon ? <Icon className="h-4 w-4" /> : undefined}
                {...props}
            >
                {children}
            </Button>
        );

        if (resolvedTooltip) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        {button}
                    </TooltipTrigger>
                    <TooltipContent>
                        {resolvedTooltip}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return button;
    }
);

ActionButton.displayName = "ActionButton";
