"use client";

import { cn } from "../../lib/cn";

export interface StatsCardProps {
    label: string;
    value: number | string;
    icon?: React.ReactNode;
    subtitle?: string;
    color?: "primary" | "success" | "danger" | "warning" | "info" | "default";
    className?: string;
}

const colorClasses = {
    primary: "border-b-[hsl(var(--primary))] text-[hsl(var(--primary))]",
    success: "border-b-green-500 text-green-500",
    danger: "border-b-red-500 text-red-500",
    warning: "border-b-yellow-500 text-yellow-500",
    info: "border-b-blue-400 text-blue-400",
    default: "border-b-white/20 text-white",
};

const iconColorClasses = {
    primary: "text-[hsl(var(--primary))]",
    success: "text-green-500",
    danger: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-400",
    default: "text-white/60",
};

/**
 * StatsCard component for displaying summary statistics
 * 
 * Features:
 * - Glassmorphism styling
 * - Color variants
 * - Icon support
 * - Subtitle for additional context
 * 
 * @example
 * ```tsx
 * <StatsCard
 *   label="Total"
 *   value={150}
 *   icon={<Users className="h-4 w-4" />}
 *   subtitle="100% REGISTROS"
 *   color="primary"
 * />
 * ```
 */
export function StatsCard({
    label,
    value,
    icon,
    subtitle,
    color = "default",
    className,
}: StatsCardProps) {
    return (
        <div
            className={cn(
                "p-4 hover:bg-white/5 transition-colors cursor-default",
                "rounded-none border-t-0 border-x-0 border-b-2 bg-white/[0.02]",
                "backdrop-blur-sm",
                colorClasses[color],
                className
            )}
        >
            <div className="flex items-center gap-2 mb-1">
                {icon && (
                    <div className={cn("h-4 w-4", iconColorClasses[color])}>
                        {icon}
                    </div>
                )}
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">
                    {label}
                </span>
            </div>
            <p className={cn("text-2xl font-bold", color === "default" ? "text-white" : "")}>
                {value}
            </p>
            {subtitle && (
                <p className="text-[10px] text-white/40 mt-1 font-mono">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
