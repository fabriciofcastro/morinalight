"use client";

import { Info } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/cn";
import { Button, type ButtonProps } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export interface ActionButtonProps extends ButtonProps {
    /**
     * Icon to display (replaces children if provided, or renders alongside if children exists)
     */
    icon?: React.ReactNode;
    /**
     * Tooltip text to display on hover
     */
    tooltip?: string;
    /**
     * Tooltip side position
     */
    tooltipSide?: "top" | "bottom" | "left" | "right";
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
    ({ className, icon, tooltip, tooltipSide = "top", children, variant = "ghost", size = "icon", ...props }, ref) => {
        const button = (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                className={cn("shrink-0", className)}
                {...props}
            >
                {icon}
                {children}
            </Button>
        );

        if (!tooltip) {
            return button;
        }

        return (
            <TooltipProvider>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side={tooltipSide}>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    },
);

ActionButton.displayName = "ActionButton";
