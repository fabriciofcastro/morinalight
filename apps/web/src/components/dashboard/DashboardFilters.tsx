"use client";

import { RotateCcw } from "lucide-react";
import { DateRangePicker, DateRangePreset } from "./DateRangePicker";

interface DashboardFiltersProps {
    dateRange: DateRangePreset;
    onDateRangeChange: (value: DateRangePreset) => void;
    onReset?: () => void;
}

export function DashboardFilters({
    dateRange,
    onDateRangeChange,
    onReset,
}: DashboardFiltersProps) {
    return (
        <div className="flex items-center gap-3">
            <DateRangePicker value={dateRange} onChange={onDateRangeChange} />

            {onReset && (
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 group active:scale-95"
                    title="Resetar filtros"
                >
                    <RotateCcw className="h-3.5 w-3.5 text-white/50 group-hover:text-white/80 transition-colors" />
                    <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors uppercase tracking-wide">Resetar</span>
                </button>
            )}
        </div>
    );
}
