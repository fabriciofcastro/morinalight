"use client";

import {
    Scatter,
    ScatterChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis,
    Legend,
    Cell,
} from "recharts";
import { ExportButton } from "./ExportButton";

interface ScatterDataPoint {
    x: number;
    y: number;
    z: number;
    category: string;
}

interface ScatterSeries {
    name: string;
    data: ScatterDataPoint[];
    color: string;
}

interface FuturisticScatterChartProps {
    series?: ScatterSeries[];
    isLoading?: boolean;
    error?: Error | null;
    title?: string;
    xLabel?: string;
    yLabel?: string;
}

export function FuturisticScatterChart({
    series = [],
    isLoading,
    error,
    title = "Análise de Correlação",
    xLabel = "Valor X",
    yLabel = "Valor Y"
}: FuturisticScatterChartProps) {
    // Loading skeleton
    if (isLoading) {
        return (
            <div className="h-full w-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl translate-y-32 translate-x-32 animate-pulse" />
                <h3 className="text-lg font-semibold text-white mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-6 bg-pink-500 rounded-full animate-pulse" />
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
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl translate-y-32 translate-x-32" />
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
    if (!series || series.length === 0) {
        return (
            <div className="h-full w-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl translate-y-32 translate-x-32" />
                <h3 className="text-lg font-semibold text-white mb-6 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-6 bg-pink-500 rounded-full" />
                    {title}
                </h3>
                <div className="h-[300px] w-full relative z-10 flex items-center justify-center">
                    <div className="text-white/50 text-sm">Nenhum dado disponível</div>
                </div>
            </div>
        );
    }

    return (
        <div id="scatter-chart" className="h-full w-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group">
            {/* Decorative background glow */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl translate-y-32 translate-x-32" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-pink-500 rounded-full" />
                    {title}
                </h3>
                <ExportButton
                    chartId="scatter-chart"
                    chartData={series.flatMap(s => s.data)}
                    chartName="analise-correlacao"
                />
            </div>

            <div className="h-[300px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name={xLabel}
                            stroke="rgba(255,255,255,0.5)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            label={{
                                value: xLabel,
                                position: "insideBottom",
                                offset: -10,
                                style: { fill: "rgba(255,255,255,0.5)", fontSize: 12 }
                            }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name={yLabel}
                            stroke="rgba(255,255,255,0.5)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            label={{
                                value: yLabel,
                                angle: -90,
                                position: "insideLeft",
                                style: { fill: "rgba(255,255,255,0.5)", fontSize: 12 }
                            }}
                        />
                        <ZAxis type="number" dataKey="z" range={[50, 400]} />
                        <Tooltip
                            cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.3)" }}
                            contentStyle={{
                                backgroundColor: "rgba(15, 23, 42, 0.9)",
                                borderColor: "rgba(255, 255, 255, 0.1)",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                            itemStyle={{ color: "#fff" }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => <span style={{ color: "rgba(255,255,255,0.7)" }}>{value}</span>}
                        />
                        {series.map((s, index) => (
                            <Scatter
                                key={index}
                                name={s.name}
                                data={s.data}
                                fill={s.color}
                                shape="circle"
                            >
                                {s.data.map((entry, idx) => (
                                    <Cell
                                        key={`cell-${idx}`}
                                        fill={s.color}
                                        style={{
                                            filter: `drop-shadow(0px 0px 6px ${s.color})`
                                        }}
                                    />
                                ))}
                            </Scatter>
                        ))}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
