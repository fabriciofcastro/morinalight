"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "../../lib/cn";

export type ViewModeType = "grid" | "list";

export interface ViewModeToggleProps {
    mode: ViewModeType;
    onModeChange: (mode: ViewModeType) => void;
    className?: string;
}

/**
 * ViewModeToggle component for switching between grid and list views
 * 
 * Features:
 * - Grid and List icons
 * - Active state highlighting
 * - Glassmorphism styling
 * 
 * @example
 * ```tsx
 * <ViewModeToggle
 *   mode={viewMode}
 *   onModeChange={setViewMode}
 * />
 * ```
 */
export function ViewModeToggle({
    mode,
    onModeChange,
    className,
}: ViewModeToggleProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-1 bg-black/40 border border-white/10 rounded-none p-1",
                className
            )}
        >
            <button
                onClick={() => onModeChange("grid")}
                className={cn(
                    "p-2 rounded-none transition-colors",
                    mode === "grid"
                        ? "bg-[hsl(var(--primary))] text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                title="Grid View"
            >
                <LayoutGrid className="h-4 w-4" />
            </button>
            <button
                onClick={() => onModeChange("list")}
                className={cn(
                    "p-2 rounded-none transition-colors",
                    mode === "list"
                        ? "bg-[hsl(var(--primary))] text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                title="List View"
            >
                <List className="h-4 w-4" />
            </button>
        </div>
    );
}
