"use client";

import { useState } from "react";
import { Clock, Plus, Trash2, Copy } from "lucide-react";
import type { BusinessHours, BusinessHoursShift } from "@/types/business-hours";
import {
    DAY_LABELS,
    DAY_SHORT_LABELS,
    BUSINESS_HOURS_TEMPLATES,
} from "@/types/business-hours";

interface BusinessHoursEditorProps {
    value: BusinessHours[];
    onChange: (hours: BusinessHours[]) => void;
}

export function BusinessHoursEditor({ value, onChange }: BusinessHoursEditorProps) {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const applyTemplate = (templateKey: keyof typeof BUSINESS_HOURS_TEMPLATES) => {
        const template = BUSINESS_HOURS_TEMPLATES[templateKey];
        onChange(template.hours);
    };

    const toggleDay = (dayOfWeek: number) => {
        const newHours = value.map((day) => {
            if (day.dayOfWeek === dayOfWeek) {
                return {
                    ...day,
                    isOpen: !day.isOpen,
                    shifts: !day.isOpen ? [{ start: "08:00", end: "18:00" }] : [],
                };
            }
            return day;
        });
        onChange(newHours);
    };

    const addShift = (dayOfWeek: number) => {
        const newHours = value.map((day) => {
            if (day.dayOfWeek === dayOfWeek) {
                return {
                    ...day,
                    shifts: [...day.shifts, { start: "08:00", end: "18:00" }],
                };
            }
            return day;
        });
        onChange(newHours);
    };

    const removeShift = (dayOfWeek: number, shiftIndex: number) => {
        const newHours = value.map((day) => {
            if (day.dayOfWeek === dayOfWeek) {
                return {
                    ...day,
                    shifts: day.shifts.filter((_, idx) => idx !== shiftIndex),
                };
            }
            return day;
        });
        onChange(newHours);
    };

    const updateShift = (
        dayOfWeek: number,
        shiftIndex: number,
        field: "start" | "end",
        newValue: string
    ) => {
        const newHours = value.map((day) => {
            if (day.dayOfWeek === dayOfWeek) {
                return {
                    ...day,
                    shifts: day.shifts.map((shift, idx) => {
                        if (idx === shiftIndex) {
                            return { ...shift, [field]: newValue };
                        }
                        return shift;
                    }),
                };
            }
            return day;
        });
        onChange(newHours);
    };

    const copyFromPreviousDay = (dayOfWeek: number) => {
        if (dayOfWeek === 0) return;

        const previousDay = value.find(d => d.dayOfWeek === dayOfWeek - 1);
        if (!previousDay) return;

        const newHours = value.map((day) => {
            if (day.dayOfWeek === dayOfWeek) {
                return {
                    ...day,
                    isOpen: previousDay.isOpen,
                    shifts: previousDay.shifts.map(s => ({ ...s })),
                };
            }
            return day;
        });
        onChange(newHours);
    };

    return (
        <div className="space-y-6">
            {/* Templates */}
            <div>
                <h4 className="text-sm font-semibold text-white/90 mb-3">Templates Rápidos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(BUSINESS_HOURS_TEMPLATES).map(([key, template]) => (
                        <button
                            key={key}
                            onClick={() => applyTemplate(key as keyof typeof BUSINESS_HOURS_TEMPLATES)}
                            className="px-3 py-2 text-sm rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/80 hover:text-white"
                            type="button"
                        >
                            {template.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Days Editor */}
            <div className="space-y-2">
                {value.map((day) => (
                    <div
                        key={day.dayOfWeek}
                        className={`border rounded-lg overflow-hidden transition-all ${day.isOpen
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-white/10 bg-white/5"
                            }`}
                    >
                        {/* Day header */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={day.isOpen}
                                        onChange={() => toggleDay(day.dayOfWeek)}
                                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-green-500 focus:ring-2 focus:ring-green-500"
                                    />
                                    <span className="font-medium text-white">
                                        {DAY_LABELS[day.dayOfWeek]}
                                    </span>
                                </label>
                                {!day.isOpen && (
                                    <span className="text-xs text-white/40">Fechado</span>
                                )}
                            </div>

                            {day.isOpen && (
                                <div className="flex items-center gap-2">
                                    {day.dayOfWeek > 0 && (
                                        <button
                                            onClick={() => copyFromPreviousDay(day.dayOfWeek)}
                                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                            title="Copiar do dia anterior"
                                            type="button"
                                        >
                                            <Copy className="w-4 h-4 text-white/70" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => addShift(day.dayOfWeek)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors"
                                        type="button"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Adicionar Turno
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Shifts */}
                        {day.isOpen && day.shifts.length > 0 && (
                            <div className="px-4 pb-4 space-y-2">
                                {day.shifts.map((shift, shiftIndex) => (
                                    <div
                                        key={shiftIndex}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                                    >
                                        <Clock className="w-4 h-4 text-white/50 flex-shrink-0" />

                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="time"
                                                value={shift.start}
                                                onChange={(e) =>
                                                    updateShift(day.dayOfWeek, shiftIndex, "start", e.target.value)
                                                }
                                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-white/50">até</span>
                                            <input
                                                type="time"
                                                value={shift.end}
                                                onChange={(e) =>
                                                    updateShift(day.dayOfWeek, shiftIndex, "end", e.target.value)
                                                }
                                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {day.shifts.length > 1 && (
                                            <button
                                                onClick={() => removeShift(day.dayOfWeek, shiftIndex)}
                                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                                title="Remover turno"
                                                type="button"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400">
                    <strong>Resumo:</strong>{" "}
                    {value.filter((d) => d.isOpen).length} dias abertos •{" "}
                    {value.filter((d) => !d.isOpen).length} dias fechados
                </p>
            </div>
        </div>
    );
}
