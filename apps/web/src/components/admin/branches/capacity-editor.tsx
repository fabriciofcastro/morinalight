"use client";

import { useState } from "react";
import { TrendingUp, Target, Activity, Zap, AlertCircle } from "lucide-react";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import {
    CircularProgressbar,
    buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface CapacityEditorProps {
    value: {
        productionLines: number;
        maxDailyProduction: number;
        maxMonthlyProduction: number;
        currentUtilization: number;
        goals: {
            monthly: number;
            quarterly: number;
            annual: number;
        };
    };
    onChange: (value: any) => void;
}

export function CapacityEditor({ value, onChange }: CapacityEditorProps) {
    const utilizationPercent = value.currentUtilization || 0;
    const monthlyGoalProgress = value.maxMonthlyProduction > 0
        ? Math.min((value.goals.monthly / value.maxMonthlyProduction) * 100, 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Cards de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Utilização Atual */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-white/90">Utilização Atual</h4>
                        <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="w-32 h-32 mx-auto">
                        <CircularProgressbar
                            value={utilizationPercent}
                            text={`${utilizationPercent.toFixed(1)}%`}
                            styles={buildStyles({
                                textColor: "#fff",
                                pathColor: utilizationPercent > 80 ? "#ef4444" : "#3b82f6",
                                trailColor: "rgba(255,255,255,0.1)",
                            })}
                        />
                    </div>
                </div>

                {/* Meta Mensal */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-white/90">Meta Mensal</h4>
                        <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="w-32 h-32 mx-auto">
                        <CircularProgressbar
                            value={monthlyGoalProgress}
                            text={`${monthlyGoalProgress.toFixed(0)}%`}
                            styles={buildStyles({
                                textColor: "#fff",
                                pathColor: "#10b981",
                                trailColor: "rgba(255,255,255,0.1)",
                            })}
                        />
                    </div>
                </div>

                {/* Capacidade Ociosa */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-white/90">Capacidade Ociosa</h4>
                        <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-white mb-2">
                            {(100 - utilizationPercent).toFixed(1)}%
                        </p>
                        <p className="text-sm text-white/60">
                            {value.maxDailyProduction > 0
                                ? `${Math.round((value.maxDailyProduction * (100 - utilizationPercent)) / 100)} un/dia`
                                : "0 un/dia"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Configuração de Capacidade */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Capacidade Produtiva
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FuturisticInput
                        label="Linhas de Produção"
                        type="number"
                        value={value.productionLines}
                        onChange={(e) =>
                            onChange({ ...value, productionLines: Number(e.target.value) })
                        }
                        placeholder="0"
                        helperText="Número de linhas produtivas ativas"
                    />

                    <FuturisticInput
                        label="Capacidade Diária (un)"
                        type="number"
                        value={value.maxDailyProduction}
                        onChange={(e) =>
                            onChange({ ...value, maxDailyProduction: Number(e.target.value) })
                        }
                        placeholder="0"
                        helperText="Máximo de unidades por dia"
                    />

                    <FuturisticInput
                        label="Capacidade Mensal (un)"
                        type="number"
                        value={value.maxMonthlyProduction}
                        onChange={(e) =>
                            onChange({ ...value, maxMonthlyProduction: Number(e.target.value) })
                        }
                        placeholder="0"
                        helperText="Máximo de unidades por mês"
                    />
                </div>

                <div className="mt-4">
                    <FuturisticInput
                        label="Utilização Atual (%)"
                        type="number"
                        value={value.currentUtilization}
                        onChange={(e) =>
                            onChange({ ...value, currentUtilization: Number(e.target.value) })
                        }
                        placeholder="0"
                        helperText="Percentual de utilização atual"
                        max={100}
                    />
                </div>
            </div>

            {/* Metas */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Metas de Produção
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Futuristic Input
                        label="Meta Mensal (un)"
                        type="number"
                        value={value.goals.monthly}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                goals: { ...value.goals, monthly: Number(e.target.value) },
                            })
                        }
                        placeholder="0"
                        tooltip="Meta de produção para o mês atual"
                    />

                    <FuturisticInput
                        label="Meta Trimestral (un)"
                        type="number"
                        value={value.goals.quarterly}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                goals: { ...value.goals, quarterly: Number(e.target.value) },
                            })
                        }
                        placeholder="0"
                        tooltip="Meta de produção trimestral"
                    />

                    <FuturisticInput
                        label="Meta Anual (un)"
                        type="number"
                        value={value.goals.annual}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                goals: { ...value.goals, annual: Number(e.target.value) },
                            })
                        }
                        placeholder="0"
                        tooltip="Meta de produção para o ano"
                    />
                </div>
            </div>

            {/* Alertas */}
            {utilizationPercent > 90 && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-400">Capacidade Crítica</p>
                        <p className="text-sm text-red-400/80 mt-1">
                            A utilização está acima de 90%. Considere expandir a capacidade produtiva ou otimizar processos.
                        </p>
                    </div>
                </div>
            )}

            {utilizationPercent < 50 && value.maxDailyProduction > 0 && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                        <p className="font-medium text-yellow-400">Capacidade Subutilizada</p>
                        <p className="text-sm text-yellow-400/80 mt-1">
                            Há capacidade ociosa significativa. Considere aumentar a produção ou buscar novos clientes.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
