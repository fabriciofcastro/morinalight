import { cn } from "@morina/ui";
import React from "react";

interface TechContainerProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const TechContainer = ({ children, className, noPadding = false }: TechContainerProps) => (
    <div className={cn("relative", className)}>
        {/* Tech corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[hsl(var(--primary)/0.4)]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[hsl(var(--primary)/0.4)]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[hsl(var(--primary)/0.4)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[hsl(var(--primary)/0.4)]" />

        <div className={cn(
            "h-full rounded-none border border-white/10 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.04] transition-all duration-500",
            noPadding ? "p-0" : "p-6"
        )}>
            {children}
        </div>
    </div>
);
