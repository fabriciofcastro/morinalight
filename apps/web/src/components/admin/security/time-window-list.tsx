"use client";

import {
    Clock,
    Calendar,
    MoreVertical,
    Edit2,
    Trash2,
    Power,
    Timer
} from "lucide-react";
import {
    GlassCard,
    Badge,
    Button
} from "@/components/ui/futuristic";
import { TimeWindow } from "@morina/shared-kernel";
import { Can } from "@/lib/auth/CaslContext";

interface TimeWindowsListProps {
    windows: TimeWindow[];
    onEdit: (window: TimeWindow) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function TimeWindowsList({ windows, onEdit, onDelete, onToggle }: TimeWindowsListProps) {
    if (windows.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                <Clock className="h-12 w-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/80">Nenhuma Janela de Tempo</h3>
                <p className="text-white/40 max-w-md mx-auto mt-2">
                    Restrinja o acesso ao sistema a horários específicos ou dias úteis.
                </p>
                <Button variant="primary" className="mt-6">
                    Configurar Horário Comercial
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {windows.map((window) => (
                <GlassCard
                    key={window.id}
                    className={`p-5 border-white/5 hover:border-[hsl(var(--primary)/0.2)] group transition-all ${!window.active ? 'opacity-50' : ''}`}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                                    {window.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <Timer className="h-3 w-3 text-white/20" />
                                    <span className="text-sm font-mono text-white/60">
                                        {window.startTime} — {window.endTime}
                                    </span>
                                    <span className="text-[10px] text-white/20 uppercase">{window.timezone}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Can I="update" a="TimeWindow">
                                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => onToggle(window.id)}>
                                    <Power className={`h-3.5 w-3.5 ${window.active ? 'text-emerald-400' : 'text-white/40'}`} />
                                </Button>
                                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => onEdit(window)}>
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                            </Can>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {dayNames.map((day, index) => {
                            const isActive = window.daysOfWeek?.includes(index);
                            return (
                                <div
                                    key={day}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter transition-colors ${isActive
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-white/5 text-white/10 border border-white/5'
                                        }`}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                        <Can I="delete" a="TimeWindow">
                            <Button variant="link" size="sm" className="h-6 text-[10px] text-red-400/60 hover:text-red-400" onClick={() => onDelete(window.id)}>
                                <Trash2 className="mr-1 h-3 w-3" /> Excluir Janela
                            </Button>
                        </Can>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
