"use client";

import { DateRangePicker, DateRangePreset } from "./DateRangePicker";
import { RotateCcw } from "lucide-react";

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
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
                    title="Resetar filtros"
                >
                    <RotateCcw className="h-4 w-4 text-white/50" />
                    <span className="text-sm text-white/70">Resetar</span>
                </button>
            )}
        </div>
    );
}
