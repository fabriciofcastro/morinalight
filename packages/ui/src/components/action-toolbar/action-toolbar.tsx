"use client";

import React from "react";
import { cn } from "../../lib/cn";
import { Stack } from "../stack";

export interface ActionToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    /**
     * Alignment of items in the toolbar
     */
    align?: "start" | "end" | "between";
    /**
     * Spacing between items
     */
    spacing?: "sm" | "md" | "lg";
}

/**
 * ActionToolbar - Container for grouping action buttons and inputs
 *
 * @example
 * <ActionToolbar>
 *   <FilterInput onValueChange={...} />
 *   <ActionButton action="export" />
 *   <Button>New Item</Button>
 * </ActionToolbar>
 */
export function ActionToolbar({
    children,
    align = "between",
    spacing = "md",
    className,
    ...props
}: ActionToolbarProps) {
    const justifyMap = {
        start: "start",
        end: "end",
        between: "between",
    } as const;

    return (
        <div
            className={cn(
                "flex w-full items-center p-2 rounded-lg border border-white/5 bg-black/20 backdrop-blur-sm",
                className
            )}
            {...props}
        >
            <Stack
                direction="horizontal"
                spacing={spacing}
                justify={justifyMap[align]}
                align="center"
                className="w-full flex-wrap gap-y-2"
            >
                {children}
            </Stack>
        </div>
    );
}
