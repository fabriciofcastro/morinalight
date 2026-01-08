"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
    icon: LucideIcon;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    trendLabel?: string;
    onClick?: () => void;
    children?: React.ReactNode;
}

export function KPICard({
    icon: Icon,
    title,
    value,
    subtitle,
    trend,
    trendLabel,
    onClick,
    children,
}: KPICardProps) {
    const isPositiveTrend = trend !== undefined && trend >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 ${onClick ? "cursor-pointer" : ""
                }`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={
                onClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onClick();
                        }
                    }
                    : undefined
            }
        >
            {/* Icon */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>

                {trend !== undefined && (
                    <div
                        className={`flex items-center gap-1 text-sm font-medium ${isPositiveTrend ? "text-emerald-400" : "text-red-400"
                            }`}
                        aria-label={`Tendência: ${isPositiveTrend ? "positiva" : "negativa"} ${Math.abs(trend)}%`}
                    >
                        <span>{isPositiveTrend ? "+" : ""}{trend}%</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-white/50">{title}</h3>
                <p className="text-3xl font-bold text-white">{value}</p>
                {subtitle && <p className="text-sm text-white/40">{subtitle}</p>}
                {trendLabel && <p className="text-xs text-white/30">{trendLabel}</p>}
            </div>

            {/* Additional content */}
            {children && <div className="mt-4">{children}</div>}

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))]/0 to-[hsl(var(--primary))]/10 opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.div>
    );
}
