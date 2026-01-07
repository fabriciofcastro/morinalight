"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell
} from "recharts";
import { ExportButton } from "./ExportButton";

interface CategorySales {
    name: string;
    value: number;
    color: string;
}

interface FuturisticBarChartProps {
    data?: any[]; // Accept any array structure
    isLoading?: boolean;
    error?: Error | null;
    xAxis?: string; // Optional: key for x-axis
    yAxis?: string; // Optional: key for y-axis
    tooltipFormat?: (value: any) => string; // Optional: custom tooltip formatter
}

export function FuturisticBarChart({
    data,
    isLoading,
    error,
    xAxis = "name",
    yAxis = "value",
    tooltipFormat
}: FuturisticBarChartProps) {
    // Loading skeleton
    if (isLoading) {
        return (
            <div className="h-full w-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32 animate-pulse" />
                <h3 className="text-lg font-semibold text-white mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full animate-pulse" />
                    Vendas por Categoria
                </h3>
                <div className="h-[300px] w-full relative z-10 flex items-center justify-center">
                    <div className="text-white/50 text-sm">Carregando dados...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-full w-full p-4 rounded-xl bg-white/5 border border-red-500/20 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
                <h3 className="text-lg font-semibold text-white mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-6 bg-red-500 rounded-full" />
                    Vendas por Categoria
                </h3>
                <div className="h-[300px] w-full relative z-10 flex items-center justify-center">
                    <div className="text-red-400/70 text-sm text-center">
                        <p>Erro ao carregar dados</p>
                        <p className="text-xs text-white/40 mt-2">Exibindo dados de exemplo</p>
                    </div>
                </div>
            </div>
        );
    }

    // No data state
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
                <h3 className="text-lg font-semibold text-white mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full" />
                    Vendas por Categoria
                </h3>
                <div className="h-[300px] w-full relative z-10 flex items-center justify-center">
                    <div className="text-white/50 text-sm">Nenhum dado disponível</div>
                </div>
            </div>
        );
    }

    return (
        <div id="sales-category-chart" className="h-full w-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full" />
                    Vendas por Categoria
                </h3>
                <ExportButton chartId="sales-category-chart" chartData={data} chartName="vendas-categoria" />
            </div>

            <div className="h-[300px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis
                            dataKey={xAxis}
                            stroke="rgba(255,255,255,0.5)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.5)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={tooltipFormat || ((value) => `${value}`)}
                            dx={-10}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                            contentStyle={{
                                backgroundColor: "rgba(15, 23, 42, 0.9)",
                                borderColor: "rgba(255, 255, 255, 0.1)",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                        />
                        <Bar dataKey={yAxis} radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 60%)`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
