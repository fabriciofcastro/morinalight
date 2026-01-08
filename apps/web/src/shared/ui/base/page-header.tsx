"use client";

import { cn } from "@morina/ui";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatItem {
    label: string;
    value: string | number;
    color?: string;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    stats?: StatItem[];
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    subtitle,
    stats,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-6 mb-8", className)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight"
                    >
                        {title}
                    </motion.h1>
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-white/50 mt-1 font-medium"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>

                {actions && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 w-full md:w-auto"
                    >
                        {actions}
                    </motion.div>
                )}
            </div>

            {stats && stats.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap items-center gap-6 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-fit"
                >
                    {stats.map((stat, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/30">
                                {stat.label}
                            </span>
                            <span
                                className={cn(
                                    "text-lg font-mono font-bold",
                                    stat.color || "text-white"
                                )}
                            >
                                {stat.value}
                            </span>
                            {index < stats.length - 1 && (
                                <div className="h-4 w-px bg-white/10 ml-3" />
                            )}
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
