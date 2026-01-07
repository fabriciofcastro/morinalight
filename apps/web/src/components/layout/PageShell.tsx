import { cn } from "@morina/ui";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface PageShellProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    breadcrumbs?: { label: string; href?: string }[];
    actions?: React.ReactNode;
    headerContent?: React.ReactNode; // Slot for stats or extra header info
    className?: string;
    icon?: React.ElementType; // Optional icon for the title
}

export function PageShell({
    children,
    title,
    description,
    breadcrumbs,
    actions,
    headerContent,
    className,
    icon: Icon,
}: PageShellProps) {
    return (
        <div className={cn("relative min-h-screen p-6 space-y-8", className)}>
            {/* Premium Header Container */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
            >
                {/* Background Atmosphere Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />

                {/* Glass Panel */}
                <div className="relative flex flex-col gap-6 p-8 rounded-none border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl shadow-2xl">

                    {/* Decorative Tech Corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

                    {/* Top Row: Breadcrumbs & Actions */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 relative z-10">
                        <div className="space-y-4 flex-1">
                            {/* Breadcrumbs */}
                            {breadcrumbs && breadcrumbs.length > 0 && (
                                <nav aria-label="Breadcrumb">
                                    <ol className="flex items-center gap-1 text-xs text-muted-foreground/60 uppercase tracking-wider">
                                        {breadcrumbs.map((crumb, index) => (
                                            <li key={crumb.label} className="flex items-center gap-1">
                                                {index > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
                                                {crumb.href ? (
                                                    <Link
                                                        href={crumb.href}
                                                        className="transition-colors hover:text-[hsl(var(--primary))] hover:underline"
                                                    >
                                                        {crumb.label}
                                                    </Link>
                                                ) : (
                                                    <span className={cn(index === breadcrumbs.length - 1 && "text-[hsl(var(--primary))] font-semibold")}>
                                                        {crumb.label}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </nav>
                            )}

                            {/* Title Section */}
                            <div className="flex items-start gap-4">
                                {Icon && <Icon className="h-8 w-8 text-[hsl(var(--primary))]" />}
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                                        {title}
                                    </h1>
                                    {description && (
                                        <p className="text-sm text-white/60 font-medium mt-1 max-w-2xl">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {actions && (
                            <div className="flex items-center gap-3 pt-2">
                                {actions}
                            </div>
                        )}
                    </div>

                    {/* Header Content (Stats, etc) */}
                    {headerContent && (
                        <div className="relative z-10 mt-2 border-t border-white/5 pt-6">
                            {headerContent}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex-1"
            >
                {children}
            </motion.div>
        </div>
    );
}
