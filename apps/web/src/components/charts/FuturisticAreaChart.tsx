"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ExportButton } from "./ExportButton";

interface RevenueData {
    name: string;
    value: number;
}

interface FuturisticAreaChartProps {
    data?: RevenueData[];
    isLoading?: boolean;
    error?: Error | null;
}

export function FuturisticAreaChart({ data, isLoading, error }: FuturisticAreaChartProps) {
    // Loading skeleton
    if (isLoading) {
        return (
            <div className="h-full w-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32 animate-pulse" />
                <h3 className="text-lg font-semibold text-white mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full animate-pulse" />
                    Faturamento Anual
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
                    Faturamento Anual
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
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
                <h3 className="text-lg font-semibold text-white mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full" />
                    Faturamento Anual
                </h3>
                <div className="h-[300px] w-full relative z-10 flex items-center justify-center">
                    <div className="text-white/50 text-sm">Nenhum dado disponível</div>
                </div>
            </div>
        );
    }

    return (
        <div id="revenue-chart" className="h-full w-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full" />
                    Faturamento Anual
                </h3>
                <ExportButton chartId="revenue-chart" chartData={data} chartName="faturamento-anual" />
            </div>

            <div className="h-[300px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis
                            dataKey="name"
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
                            tickFormatter={(value) => `R$ ${value / 1000}k`}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(15, 23, 42, 0.9)",
                                borderColor: "rgba(255, 255, 255, 0.1)",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                            itemStyle={{ color: "#fff" }}
                            cursor={{ stroke: "#3b82f6", strokeWidth: 2 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
