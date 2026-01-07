"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface ActionToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "prefix"> {
    children?: React.ReactNode;
    /**
     * Content to display on the left side (start)
     */
    prefix?: React.ReactNode;
    /**
     * Content to display on the right side (end)
     */
    suffix?: React.ReactNode;
}

export const ActionToolbar = React.forwardRef<HTMLDivElement, ActionToolbarProps>(
    ({ className, children, prefix, suffix, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full p-1",
                    className
                )}
                {...props}
            >
                <div className="flex flex-1 items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar mask-linear-fade">
                    {prefix}
                    {children}
                </div>

                {(suffix) && (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                        {suffix}
                    </div>
                )}
            </div>
        );
    },
);

ActionToolbar.displayName = "ActionToolbar";
