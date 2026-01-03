"use client";

import { useState } from "react";
import {
    Clock,
    Save,
    X,
    Globe,
    CalendarDays
} from "lucide-react";
import {
    GlassCard,
    GlassInput,
    Button,
    GlassSelect
} from "@/components/ui/futuristic";
import { TimeWindow } from "@morina/shared-kernel";

interface TimeWindowFormProps {
    initialData?: Partial<TimeWindow>;
    onSave: (data: Partial<TimeWindow>) => void;
    onCancel: () => void;
}

const DAYS = [
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
    { value: 6, label: "Sábado" },
    { value: 0, label: "Domingo" },
];

export function TimeWindowForm({ initialData, onSave, onCancel }: TimeWindowFormProps) {
    const [formData, setFormData] = useState<Partial<TimeWindow>>({
        name: initialData?.name || "",
        startTime: initialData?.startTime || "08:00",
        endTime: initialData?.endTime || "18:00",
        daysOfWeek: initialData?.daysOfWeek || [1, 2, 3, 4, 5],
        timezone: initialData?.timezone || "America/Sao_Paulo",
        ...initialData
    });

    const toggleDay = (day: number) => {
        const days = formData.daysOfWeek || [];
        if (days.includes(day)) {
            setFormData({ ...formData, daysOfWeek: days.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, daysOfWeek: [...days, day].sort() });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <GlassCard className="p-6 border-amber-500/20 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {initialData?.id ? 'Editar Janela de Tempo' : 'Nova Restrição Temporal'}
                        </h3>
                        <p className="text-sm text-white/40">Defina os horários permitidos para acesso.</p>
                    </div>
                </div>
                <Button variant="secondary" size="icon" onClick={onCancel} className="rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Nome da Regra</label>
                            <GlassInput
                                placeholder="Ex: Horário Comercial"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Início</label>
                                <GlassInput
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Fim</label>
                                <GlassInput
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider flex items-center gap-2">
                                <Globe className="h-3 w-3" /> Fuso Horário
                            </label>
                            <GlassSelect
                                value={formData.timezone || "America/Sao_Paulo"}
                                onChange={(val: string) => setFormData({ ...formData, timezone: val })}
                                options={[
                                    { value: "America/Sao_Paulo", label: "Brasília (BRT)" },
                                    { value: "UTC", label: "UTC / GMT" },
                                    { value: "America/New_York", label: "New York (EST)" },
                                    { value: "Europe/London", label: "London (GMT)" },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Days Selection */}
                    <div>
                        <label className="text-xs font-semibold text-white/60 mb-3 block uppercase tracking-wider flex items-center gap-2">
                            <CalendarDays className="h-3 w-3" /> Dias de Acesso
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {DAYS.map((day) => {
                                const isSelected = formData.daysOfWeek?.includes(day.value);
                                return (
                                    <div
                                        key={day.value}
                                        onClick={() => toggleDay(day.value)}
                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{day.label}</span>
                                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-amber-500 border-amber-400' : 'border-white/10'
                                            }`}>
                                            {isSelected && <X className="h-3 w-3 text-black" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button variant="secondary" type="button" onClick={onCancel}>
                        Descartar
                    </Button>
                    <Button variant="primary" type="submit" className="min-w-[120px] bg-amber-500 hover:bg-amber-400 text-black border-none">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Janela
                    </Button>
                </div>
            </form>
        </GlassCard>
    );
}
