"use client"

import React from "react"
import {
    ResponsiveContainer,
    FunnelChart,
    Funnel,
    LabelList,
    Tooltip,
    Cell,
} from "recharts"
import { motion } from "framer-motion"

interface FunnelDataPoint {
    name: string
    value: number
    fill?: string
}

interface FuturisticFunnelChartProps {
    data: FunnelDataPoint[]
    title?: string
    colors?: string[]
    height?: number
}

const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
]

export function FuturisticFunnelChart({
    data,
    title,
    colors = defaultColors,
    height = 400,
}: FuturisticFunnelChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            {title && (
                <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
            )}
            <ResponsiveContainer width="100%" height={height}>
                <FunnelChart>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--popover-foreground))",
                        }}
                        formatter={(value: number) => [
                            value.toLocaleString("pt-BR"),
                            "Valor",
                        ]}
                    />
                    <Funnel
                        dataKey="value"
                        data={data}
                        isAnimationActive={true}
                        animationDuration={800}
                    >
                        <LabelList
                            position="center"
                            fill="hsl(var(--background))"
                            stroke="none"
                            dataKey="name"
                            style={{ fontSize: "14px", fontWeight: "600" }}
                        />
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.fill || colors[index % colors.length]}
                                opacity={0.9}
                            />
                        ))}
                    </Funnel>
                </FunnelChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{
                                backgroundColor: item.fill || colors[index % colors.length],
                            }}
                        />
                        <span className="text-muted-foreground">
                            {item.name}: <strong>{item.value.toLocaleString("pt-BR")}</strong>
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
