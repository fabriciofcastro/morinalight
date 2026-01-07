"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "../../lib/cn";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../tooltip";

// --- Types ---

export interface SidebarSubItem {
    id: string;
    label: string;
    href?: string;
    action?: () => void;
    description?: string;
    icon?: LucideIcon;
}

export interface SidebarItemDefinition {
    id: string;
    label: string;
    icon: LucideIcon;
    href?: string;
    color?: string; // e.g. "from-blue-500 to-cyan-500"
    badge?: number;
    subItems?: SidebarSubItem[];
    action?: () => void; // If no href
}

export interface SidebarProps {
    items: SidebarItemDefinition[];
    activePath: string;
    onSearch?: () => void;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

// --- Components ---

interface SidebarItemProps {
    item: SidebarItemDefinition;
    activePath: string;
    hoveredItem: string | null;
    setHoveredItem: (id: string | null) => void;
    isActive: (path: string, item: SidebarItemDefinition) => boolean;
}

function SidebarItem({
    item,
    activePath,
    hoveredItem,
    setHoveredItem,
    isActive,
}: SidebarItemProps) {
    const active = isActive(activePath, item);
    const isHovered = hoveredItem === item.id;
    const hasSubItems = item.subItems && item.subItems.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        if (item.action) {
            e.preventDefault();
            item.action();
        }
    };

    const Content = (
        <div
            className={cn(
                "relative flex h-10 w-10 items-center justify-center transition-all duration-300 border border-transparent rounded-none",
                active
                    ? "bg-white/5 text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)] shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white hover:border-white/10",
                isHovered &&
                !active &&
                "bg-white/5 text-white scale-105 border-white/20",
            )}
        >
            <item.icon
                className={cn("h-4 w-4", active && "text-[hsl(var(--primary))]")}
            />

            {/* Active Indicator - Full Bar Effect */}
            {active && (
                <motion.div
                    layoutId="active-line"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--primary))] shadow-[0_0_15px_hsl(var(--primary))]"
                />
            )}

            {/* Badge */}
            {item.badge ? (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 rounded-none">
                    {item.badge}
                </span>
            ) : null}
        </div>
    );

    return (
        <div className="relative flex w-full justify-center py-0.5">
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        {item.href ? (
                            <Link
                                href={item.href}
                                onClick={handleClick}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="cursor-pointer"
                            >
                                {Content}
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={handleClick}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="w-full flex justify-center cursor-pointer"
                            >
                                {Content}
                            </button>
                        )}
                    </TooltipTrigger>
                    <TooltipContent
                        side="right"
                        sideOffset={10}
                        className="bg-[#0A0D14] border-white/10 text-white font-medium rounded-none"
                    >
                        {item.label}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Sliding Drawer Panel */}
            <AnimatePresence>
                {isHovered && hasSubItems && (
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -10, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed left-[80px] top-0 bottom-0 z-30 w-72 overflow-hidden border-r border-[color-mix(in_oklab,hsl(var(--border))_78%,transparent_22%)] bg-(--surface-veil,#020617) shadow-[0_28px_140px_-45px_rgba(0,0,0,0.98)] ring-1 ring-white/8 rounded-none"
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        {/* Card HUD Layers */}
                        <div
                            className="pointer-events-none absolute inset-0 bg-(--surface-veil,#020617)"
                            aria-hidden="true"
                        />
                        <div
                            className="pointer-events-none absolute inset-0 bg-black"
                            aria-hidden="true"
                        />
                        <div
                            className="pointer-events-none absolute inset-0"
                            aria-hidden="true"
                            style={{
                                background:
                                    "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.60) 55%, rgba(0,0,0,0.88) 100%)",
                            }}
                        />
                        <div
                            className="pointer-events-none absolute inset-0"
                            aria-hidden="true"
                            style={{
                                background:
                                    "radial-gradient(circle at 18% 12%, rgba(109,213,255,0.08), transparent 38%), radial-gradient(circle at 78% 72%, rgba(99,102,241,0.06), transparent 52%)",
                            }}
                        />
                        <div
                            className="pointer-events-none absolute inset-0 holo-grid"
                            aria-hidden="true"
                        />
                        <div
                            className="pointer-events-none absolute inset-y-0 left-0 w-px beam-line"
                            aria-hidden="true"
                        />
                        <div
                            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[radial-gradient(circle_at_center,hsla(var(--primary)/0.45),transparent_70%)]"
                            aria-hidden="true"
                        />
                        <div
                            className="pointer-events-none absolute inset-0 motion-reduce:hidden"
                            aria-hidden="true"
                        >
                            <div className="absolute left-0 right-0 top-0 h-0.5 bg-linear-to-r from-transparent via-[hsl(var(--primary)/0.22)] to-transparent animate-auth-scanline" />
                        </div>

                        <div className="flex h-full flex-col">
                            {/* Header */}
                            <div className="relative flex h-20 items-center gap-4 border-b border-white/10 px-6 bg-(--surface-veil,#020617)">
                                <div
                                    className="pointer-events-none absolute inset-0"
                                    aria-hidden="true"
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_30%,rgba(109,213,255,0.08),transparent_55%)]" />
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.05),transparent)]" />
                                </div>
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center bg-linear-to-br shadow-lg rounded-none",
                                        item.color || "from-gray-800 to-slate-800",
                                    )}
                                >
                                    <div className="absolute inset-0 border border-white/10" />
                                    <item.icon className="relative h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <span className="block font-bold text-white text-lg tracking-wide">
                                        {item.label}
                                    </span>
                                    <span className="text-xs text-white/50 uppercase tracking-widest">
                                        Menu
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative flex-1 overflow-y-auto p-4">
                                <div
                                    className="pointer-events-none absolute inset-0"
                                    aria-hidden="true"
                                    style={{
                                        background:
                                            "radial-gradient(circle at 15% 10%, rgba(109,213,255,0.06), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.10) 55%, rgba(0,0,0,0.35) 100%)",
                                    }}
                                />

                                <div className="relative space-y-2">
                                    {item.subItems?.map((sub) => {
                                        const isSubActive =
                                            sub.href && (activePath === sub.href ||
                                                activePath.startsWith(`${sub.href}/`));

                                        const content = (
                                            <>
                                                {/* Accent rail */}
                                                <span
                                                    className={cn(
                                                        "pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-transparent",
                                                        isSubActive
                                                            ? "bg-[hsl(var(--primary))]"
                                                            : "bg-white/12",
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        className={cn(
                                                            "font-medium transition-colors",
                                                            isSubActive
                                                                ? "text-[hsl(var(--primary))]"
                                                                : "text-white group-hover:text-white",
                                                        )}
                                                    >
                                                        {sub.label}
                                                    </span>
                                                    <ChevronRight
                                                        className={cn(
                                                            "h-3 w-3 transition-transform opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0",
                                                            isSubActive &&
                                                            "opacity-100 translate-x-0 text-[hsl(var(--primary))]",
                                                        )}
                                                    />
                                                </div>
                                                {sub.description && (
                                                    <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors line-clamp-1">
                                                        {sub.description}
                                                    </span>
                                                )}
                                            </>
                                        );

                                        const commonClasses = cn(
                                            "group relative flex flex-col gap-1 border border-white/12 bg-linear-to-br from-white/7 to-white/2 px-4 py-3 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)] transition hover:border-white/18 hover:from-white/9 hover:to-white/3 text-left w-full",
                                            isSubActive
                                                ? "border-l-2 border-l-[hsl(var(--primary))] shadow-[0_0_40px_rgba(55,224,246,0.14)]"
                                                : "text-white/80",
                                        );

                                        if (sub.href) {
                                            return (
                                                <Link
                                                    key={sub.id}
                                                    href={sub.href}
                                                    className={commonClasses}
                                                >
                                                    {content}
                                                </Link>
                                            );
                                        }

                                        return (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                onClick={(e) => {
                                                    if (sub.action) sub.action();
                                                }}
                                                className={commonClasses}
                                            >
                                                {content}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function Sidebar({
    items,
    activePath,
    onSearch,
    header,
    footer,
    className,
}: SidebarProps) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path: string, item: SidebarItemDefinition) => {
        if (item.href && (path === item.href || path.startsWith(`${item.href}/`))) {
            return true;
        }
        if (item.subItems) {
            return item.subItems.some(
                (sub) => sub.href && (path === sub.href || path.startsWith(`${sub.href}/`)),
            );
        }
        return false;
    };

    const sidebarContent = (
        <div className="flex h-full flex-col items-center bg-[color-mix(in_oklab,var(--surface-veil,#020617)_88%,transparent_12%)] backdrop-blur-2xl py-5 relative z-40 border-r border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] shadow-[0_0_40px_rgba(55,224,246,0.12)]">
            {/* Holo layers */}
            <div className="pointer-events-none absolute inset-0 opacity-50">
                <div className="absolute inset-0 holo-grid" />
                <div className="absolute left-0 top-0 h-full w-[2px] beam-line opacity-40" />
            </div>

            {/* Header (Logo) */}
            <div className="mb-8">{header}</div>

            {/* Main Navigation */}
            <div className="flex w-full flex-1 flex-col gap-2 overflow-y-auto px-0 scrollbar-none">
                {onSearch && (
                    <SidebarItem
                        item={{
                            id: "search",
                            label: "Busca (Ctrl+K)",
                            icon: Search,
                            action: onSearch,
                        }}
                        activePath={activePath}
                        hoveredItem={hoveredItem}
                        setHoveredItem={setHoveredItem}
                        isActive={() => false}
                    />
                )}

                {items.map((item, index) => {
                    // Add separator before specific items if needed?
                    // For now just flat list
                    return (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            activePath={activePath}
                            hoveredItem={hoveredItem}
                            setHoveredItem={setHoveredItem}
                            isActive={isActive}
                        />
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="mt-auto flex w-full flex-col gap-3 px-0 pt-6">
                <div className="my-2 h-px w-10 mx-auto bg-white/10" />
                {footer}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Rail) */}
            <aside
                className={cn(
                    "hidden lg:flex fixed inset-y-0 left-0 z-50 w-[80px] flex-col border-r border-white/10 bg-transparent",
                    className,
                )}
            >
                {sidebarContent}
            </aside>

            {/* Spacer to push content */}
            <div className="hidden lg:block w-[80px] shrink-0" />

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 z-50 w-80 lg:hidden bg-(--surface-veil,#020617) border-r border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)]"
                        >
                            <div className="h-full w-full p-6 overflow-y-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="font-bold text-white text-xl tracking-wide">
                                        MENU
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen(false)}
                                        className="p-2 hover:bg-white/10 transition-colors"
                                    >
                                        <X className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {items.map((d) => (
                                        <div key={d.id}>
                                            <Link
                                                href={d.href || "#"}
                                                className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-4 hover:text-white transition-colors"
                                            >
                                                {d.label}
                                            </Link>
                                            {d.subItems && (
                                                <div className="pl-4 space-y-3 border-l border-white/10">
                                                    {d.subItems.map((s) => {
                                                        if (s.href) {
                                                            return (
                                                                <Link
                                                                    key={s.id}
                                                                    href={s.href}
                                                                    className="block text-white/70 hover:text-white transition-colors cursor-pointer text-left w-full"
                                                                >
                                                                    {s.label}
                                                                </Link>
                                                            );
                                                        }
                                                        return (
                                                            <button
                                                                key={s.id}
                                                                type="button"
                                                                onClick={(e) => {
                                                                    if (s.action) {
                                                                        s.action();
                                                                        setMobileOpen(false);
                                                                    }
                                                                }}
                                                                className="block text-white/70 hover:text-white transition-colors cursor-pointer text-left w-full"
                                                            >
                                                                {s.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Menu Button */}
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center bg-[hsl(var(--primary))] shadow-[0_0_20px_hsl(var(--primary)/0.5)] lg:hidden active:scale-95 transition-transform"
            >
                <Menu className="h-6 w-6 text-white" />
            </button>
        </>
    );
}
