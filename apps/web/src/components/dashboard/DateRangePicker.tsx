"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

export type DateRangePreset = "7d" | "30d" | "90d" | "12m" | "custom";

interface DateRangePickerProps {
    value: DateRangePreset;
    onChange: (value: DateRangePreset) => void;
}

const presets: Array<{ value: DateRangePreset; label: string }> = [
    { value: "7d", label: "Últimos 7 dias" },
    { value: "30d", label: "Últimos 30 dias" },
    { value: "90d", label: "Últimos 90 dias" },
    { value: "12m", label: "Últimos 12 meses" },
    { value: "custom", label: "Período Personalizado" },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedPreset = presets.find((p) => p.value === value);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 group active:scale-95"
            >
                <Calendar className="h-3.5 w-3.5 text-white/50 group-hover:text-white/80 transition-colors" />
                <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors uppercase tracking-wide">{selectedPreset?.label}</span>
                <ChevronDown
                    className={`h-3.5 w-3.5 text-white/50 transition-transform group-hover:text-white/80 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-lg"
                        >
                            <div className="p-1">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => {
                                            onChange(preset.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${value === preset.value
                                            ? "bg-blue-500/20 text-blue-400"
                                            : "text-white/70 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
