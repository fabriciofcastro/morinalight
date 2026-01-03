"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";

interface CostsEditorProps {
    value: Record<string, number>;
    onChange: (value: Record<string, number>) => void;
}

const COST_CATEGORIES = [
    { key: "rent", label: "Aluguel/IPTU", icon: DollarSign },
    { key: "energy", label: "Energia Elétrica", icon: DollarSign },
    { key: "water", label: "Água/Saneamento", icon: DollarSign },
    { key: "internet", label: "Internet/Telefone", icon: DollarSign },
    { key: "maintenance", label: "Manutenção", icon: DollarSign },
    { key: "security", label: "Segurança", icon: DollarSign },
    { key: "cleaning", label: "Limpeza", icon: DollarSign },
    { key: "others", label: "Outros", icon: DollarSign },
];

export function CostsEditor({ value, onChange }: CostsEditorProps) {
    const total = Object.values(value).reduce((sum, val) => sum + (val || 0), 0);

    // Mock data para histórico
    const historicalData = [
        { month: "Jan", total: total * 0.9 },
        { month: "Fev", total: total * 0.95 },
        { month: "Mar", total: total * 1.02 },
        { month: "Abr", total: total * 0.98 },
        { month: "Mai", total: total * 1.05 },
        { month: "Jun", total },
    ];

    const categoryData = COST_CATEGORIES.map(cat => ({
        name: cat.label,
        value: value[cat.key] || 0,
    })).filter(item => item.value > 0);

    const variation = total > 0 ? ((total - historicalData[historicalData.length - 2].total) / historicalData[historicalData.length - 2].total) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Custo Total */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white/90">Custo Total Mensal</h4>
                        <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <div className={`flex items-center gap-1 text-sm ${variation >= 0 ? "text-red-400" : "text-green-400"}`}>
                        {variation >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(variation).toFixed(1)}% vs mês anterior
                    </div>
                </div>

                {/* Maior Gasto */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white/90">Maior Gasto</h4>
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                    {categoryData.length > 0 ? (
                        <>
                            <p className="text-2xl font-bold text-white mb-1">
                                {categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, categoryData[0]).name}
                            </p>
                            <p className="text-sm text-white/60">
                                R$ {categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, categoryData[0]).value.toLocaleString("pt-BR")}
                            </p>
                        </>
                    ) : (
                        <p className="text-white/60">Sem dados</p>
                    )}
                </div>

                {/* Média Diária */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white/90">Custo Médio Diário</h4>
                        <DollarSign className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        R$ {(total / 30).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-white/60">Baseado em 30 dias</p>
                </div>
            </div>

            {/* Formulário de Custos */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Categorias de Custos Mensais
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COST_CATEGORIES.map((category) => (
                        <FuturisticInput
                            key={category.key}
                            label={category.label}
                            type="number"
                            value={value[category.key] || 0}
                            onChange={(e) =>
                                onChange({ ...value, [category.key]: Number(e.target.value) })
                            }
                            placeholder="0.00"
                            helperText={`Gasto mensal com ${category.label.toLowerCase()}`}
                        />
                    ))}
                </div>
            </div>

            {/* Gráficos */}
            {total > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribuição por Categoria */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Categoria</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="rgba(255,255,255,0.5)"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(0,0,0,0.8)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "8px",
                                    }}
                                    formatter={(value: any) => `R$ ${Number(value).toLocaleString("pt-BR")}`}
                                />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Evolução nos Últimos 6 Meses */}
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Evolução dos Custos</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(0,0,0,0.8)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "8px",
                                    }}
                                    formatter={(value: any) => `R$ ${Number(value).toLocaleString("pt-BR")}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Custo Total"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
