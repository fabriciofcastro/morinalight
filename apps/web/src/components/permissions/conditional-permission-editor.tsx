"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, Users, Plus, X, Save } from "lucide-react";
import { Button } from "@morina/ui";
import {
    type PermissionConditions,
    type TemporalCondition,
    type LocationCondition,
    type RoleCondition,
    formatConditionDescription,
} from "@/lib/permissions/conditional-permissions";
import { type Permission } from "@/config/permissions";

interface ConditionalPermissionEditorProps {
    permission: Permission;
    initialConditions?: PermissionConditions;
    onSave?: (conditions: PermissionConditions) => void;
    onCancel?: () => void;
}

export function ConditionalPermissionEditor({
    permission,
    initialConditions,
    onSave,
    onCancel,
}: ConditionalPermissionEditorProps) {
    const [conditions, setConditions] = useState<PermissionConditions>(
        initialConditions || { logic: 'AND' }
    );

    const [showTemporal, setShowTemporal] = useState(!!initialConditions?.temporal);
    const [showLocation, setShowLocation] = useState(!!initialConditions?.location);
    const [showRole, setShowRole] = useState(!!initialConditions?.role);

    const handleSave = () => {
        onSave?.(conditions);
    };

    const updateTemporal = (update: Partial<TemporalCondition>) => {
        setConditions(prev => ({
            ...prev,
            temporal: { ...prev.temporal, ...update },
        }));
    };

    const updateLocation = (update: Partial<LocationCondition>) => {
        setConditions(prev => ({
            ...prev,
            location: { ...prev.location, ...update },
        }));
    };

    const updateRole = (update: Partial<RoleCondition>) => {
        setConditions(prev => ({
            ...prev,
            role: { ...prev.role, ...update },
        }));
    };

    const descriptions = formatConditionDescription(conditions);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white">Permissão Condicional</h3>
                    <p className="text-sm text-white/60 font-mono">{permission}</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={conditions.logic || 'AND'}
                        onChange={(e) => setConditions(prev => ({ ...prev, logic: e.target.value as 'AND' | 'OR' }))}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    >
                        <option value="AND">Todas as condições (AND)</option>
                        <option value="OR">Qualquer condição (OR)</option>
                    </select>
                </div>
            </div>

            {/* Condition Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => setShowTemporal(!showTemporal)}
                    className={`p-4 rounded-xl border transition-all ${showTemporal
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                >
                    <Calendar className="w-5 h-5 mb-2" />
                    <div className="text-sm font-medium">Temporal</div>
                    <div className="text-xs opacity-60">Data/Horário</div>
                </button>

                <button
                    onClick={() => setShowLocation(!showLocation)}
                    className={`p-4 rounded-xl border transition-all ${showLocation
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                >
                    <MapPin className="w-5 h-5 mb-2" />
                    <div className="text-sm font-medium">Localização</div>
                    <div className="text-xs opacity-60">Filial/Depto</div>
                </button>

                <button
                    onClick={() => setShowRole(!showRole)}
                    className={`p-4 rounded-xl border transition-all ${showRole
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                >
                    <Users className="w-5 h-5 mb-2" />
                    <div className="text-sm font-medium">Cargo</div>
                    <div className="text-xs opacity-60">Posição/Nível</div>
                </button>
            </div>

            {/* Temporal Conditions */}
            {showTemporal && (
                <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <h4 className="font-bold text-white">Condições Temporais</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Data Início</label>
                            <input
                                type="date"
                                value={conditions.temporal?.startDate?.toISOString().split('T')[0] || ''}
                                onChange={(e) => updateTemporal({ startDate: e.target.value ? new Date(e.target.value) : undefined })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Data Fim</label>
                            <input
                                type="date"
                                value={conditions.temporal?.endDate?.toISOString().split('T')[0] || ''}
                                onChange={(e) => updateTemporal({ endDate: e.target.value ? new Date(e.target.value) : undefined })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Horário Início</label>
                            <input
                                type="time"
                                value={conditions.temporal?.timeRange?.start || ''}
                                onChange={(e) => updateTemporal({
                                    timeRange: {
                                        start: e.target.value,
                                        end: conditions.temporal?.timeRange?.end || '23:59'
                                    }
                                })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Horário Fim</label>
                            <input
                                type="time"
                                value={conditions.temporal?.timeRange?.end || ''}
                                onChange={(e) => updateTemporal({
                                    timeRange: {
                                        start: conditions.temporal?.timeRange?.start || '00:00',
                                        end: e.target.value
                                    }
                                })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Dias da Semana</label>
                        <div className="flex flex-wrap gap-2">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
                                const isSelected = conditions.temporal?.daysOfWeek?.includes(index);
                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            const current = conditions.temporal?.daysOfWeek || [];
                                            const updated = isSelected
                                                ? current.filter(d => d !== index)
                                                : [...current, index];
                                            updateTemporal({ daysOfWeek: updated });
                                        }}
                                        className={`px-3 py-1 rounded-lg text-sm transition-all ${isSelected
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Location Conditions */}
            {showLocation && (
                <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                        <h4 className="font-bold text-white">Condições de Localização</h4>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Filiais Permitidas</label>
                            <p className="text-xs text-white/40 mb-2">Selecione as filiais onde esta permissão é válida</p>
                            <select
                                multiple
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white h-24"
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                                    updateLocation({ branches: selected });
                                }}
                            >
                                <option value="branch-1">Filial São Paulo</option>
                                <option value="branch-2">Filial Rio de Janeiro</option>
                                <option value="branch-3">Filial Belo Horizonte</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Departamentos Permitidos</label>
                            <p className="text-xs text-white/40 mb-2">Selecione os departamentos onde esta permissão é válida</p>
                            <select
                                multiple
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white h-24"
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                                    updateLocation({ departments: selected });
                                }}
                            >
                                <option value="dept-1">Vendas</option>
                                <option value="dept-2">Produção</option>
                                <option value="dept-3">Administrativo</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Conditions */}
            {showRole && (
                <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-purple-400" />
                        <h4 className="font-bold text-white">Condições de Cargo</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Nível Mínimo</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={conditions.role?.minLevel || ''}
                                onChange={(e) => updateRole({ minLevel: e.target.value ? parseInt(e.target.value) : undefined })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                placeholder="Ex: 3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Nível Máximo</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={conditions.role?.maxLevel || ''}
                                onChange={(e) => updateRole({ maxLevel: e.target.value ? parseInt(e.target.value) : undefined })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                placeholder="Ex: 7"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Preview */}
            {descriptions.length > 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-2">Preview das Condições</h4>
                    <ul className="space-y-1">
                        {descriptions.map((desc, index) => (
                            <li key={index} className="text-sm text-white/70 flex items-start gap-2">
                                <span className="text-purple-400">→</span>
                                {desc}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    onClick={handleSave}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Condições
                </Button>
                {onCancel && (
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        className="border-white/10 text-white/80 hover:bg-white/5"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                    </Button>
                )}
            </div>
        </div>
    );
}
