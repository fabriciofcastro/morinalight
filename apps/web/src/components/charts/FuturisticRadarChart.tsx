"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { ExportButton } from "./ExportButton";

interface RadarChartData {
    metric: string;
    value: number;
    fullMark: number;
}

interface FuturisticRadarChartProps {
    data?: any[]; // Accept any array structure
    isLoading?: boolean;
    error?: Error | null;
    title?: string;
    dataKeys?: string[]; // Optional: keys for data series
    indexBy?: string; // Optional: key for angle axis
}

export function FuturisticRadarChart({
    data,
    isLoading,
    error,
    title = "Métricas de Performance",
    dataKeys = ["A"],
    indexBy = "subject"
}: FuturisticRadarChartProps) {
    // Loading skeleton
    if (isLoading) {
        return (
            <div className="h-full w-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32 animate-pulse" />
                <h3 className="text-lg font-semibold text-white mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-6 bg-violet-500 rounded-full animate-pulse" />
                    {title}
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
                    {title}
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
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
                <h3 className="text-lg font-semibold text-white mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-6 bg-violet-500 rounded-full" />
                    {title}
                </h3>
                <div className="h-[300px] w-full relative z-10 flex items-center justify-center">
                    <div className="text-white/50 text-sm">Nenhum dado disponível</div>
                </div>
            </div>
        );
    }

    return (
        <div id="radar-chart" className="h-full w-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-violet-500 rounded-full" />
                    {title}
                </h3>
                <ExportButton chartId="radar-chart" chartData={data} chartName="performance-metrics" />
            </div>

            <div className="h-[300px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data}>
                        <defs>
                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <PolarGrid
                            stroke="rgba(255,255,255,0.1)"
                            strokeDasharray="3 3"
                        />
                        <PolarAngleAxis
                            dataKey={indexBy}
                            stroke="rgba(255,255,255,0.5)"
                            fontSize={12}
                            tick={{ fill: "rgba(255,255,255,0.7)" }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={10}
                            tick={{ fill: "rgba(255,255,255,0.5)" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(15, 23, 42, 0.9)",
                                borderColor: "rgba(255, 255, 255, 0.1)",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                            itemStyle={{ color: "#fff" }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span style={{ color: "rgba(255,255,255,0.7)" }}>{value}</span>}
                        />
                        {dataKeys.map((key, index) => (
                            <Radar
                                key={key}
                                name={key}
                                dataKey={key}
                                stroke={`hsl(${index * 60 + 270}, 70%, 60%)`}
                                fill="url(#radarGradient)"
                                fillOpacity={0.6}
                                strokeWidth={2}
                                dot={{ fill: `hsl(${index * 60 + 270}, 70%, 60%)`, r: 4 }}
                            />
                        ))}
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
