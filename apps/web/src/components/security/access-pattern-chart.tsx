'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface AccessPatternData {
    time: string;
    count: number;
    anomalies: number;
}

interface AccessPatternChartProps {
    data: AccessPatternData[];
    height?: number;
}

export function AccessPatternChart({ data, height = 300 }: AccessPatternChartProps) {
    return (
        <div className="w-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl" style={{ height }}>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Padrões de Acesso e Anomalias (24h)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.8)',
                            borderColor: '#374151',
                            borderRadius: '8px',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        itemStyle={{ color: '#f3f4f6' }}
                        labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        name="Acessos"
                        animationDuration={2000}
                    />
                    <Area
                        type="monotone"
                        dataKey="anomalies"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fillOpacity={1}
                        fill="url(#colorAnomalies)"
                        name="Anomalias"
                        animationDuration={2500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
