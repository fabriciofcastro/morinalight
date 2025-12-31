"use client";

import { Button, cn } from "@morina/ui";
import { Grid, List, Table, Map as MapIcon } from "lucide-react";

export type ViewMode = "grid" | "list" | "table" | "map";

interface ViewModeToggleProps {
    viewMode: ViewMode;
    onChange: (mode: ViewMode) => void;
    modes?: ViewMode[];
    className?: string;
}

export function ViewModeToggle({
    viewMode,
    onChange,
    modes = ["grid", "list"],
    className,
}: ViewModeToggleProps) {
    const modeConfig: Record<ViewMode, { icon: typeof Grid; label: string }> = {
        grid: { icon: Grid, label: "Grade" },
        list: { icon: List, label: "Lista" },
        table: { icon: Table, label: "Tabela" },
        map: { icon: MapIcon, label: "Mapa" },
    };

    return (
        <div className={cn("flex gap-2", className)}>
            {modes.map((mode) => {
                const config = modeConfig[mode];
                const Icon = config.icon;
                return (
                    <Button
                        key={mode}
                        variant={viewMode === mode ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onChange(mode)}
                        className={cn(
                            "flex items-center gap-2 transition-all",
                            viewMode === mode
                                ? "bg-white/10 text-white"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{config.label}</span>
                    </Button>
                );
            })}
        </div>
    );
}
