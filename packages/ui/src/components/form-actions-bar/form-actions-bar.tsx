"use client";

import React from "react";
import { cn } from "../../lib/cn";
import { ActionBar } from "../action-bar";
import { GlassCard } from "../glass-card";

export interface FormActionsBarProps {
    children: React.ReactNode;
    align?: "start" | "end" | "between";
    className?: string;
    sticky?: boolean;
}

/**
 * FormActionsBar - Consistent footer for form actions (Save, Cancel)
 *
 * @example
 * <FormActionsBar>
 *   <Button variant="ghost">Cancel</Button>
 *   <Button>Save Changes</Button>
 * </FormActionsBar>
 */
export function FormActionsBar({
    children,
    align = "end",
    className,
    sticky = true,
}: FormActionsBarProps) {
    return (
        <div
            className={cn(
                "mt-8",
                sticky && "sticky bottom-0 z-10 -mx-6 -mb-6 p-6",
                className
            )}
        >
            <GlassCard
                className={cn(
                    "p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl",
                    // Adding a nice gradient border on top to separate from content
                    "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
                )}
            >
                <ActionBar align={align}>
                    {children}
                </ActionBar>
            </GlassCard>
        </div>
    );
}
