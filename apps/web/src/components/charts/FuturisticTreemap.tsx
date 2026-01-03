"use client"

import React from "react"
import { ResponsiveContainer, Treemap, Tooltip } from "recharts"
import { motion } from "framer-motion"

interface TreemapDataPoint {
    name: string
    size: number
    children?: TreemapDataPoint[]
    fill?: string
}

interface FuturisticTreemapProps {
    data: TreemapDataPoint[]
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

const CustomizedContent = (props: any) => {
    const { x, y, width, height, index, name, size, colors } = props

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: colors[index % colors.length],
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                    opacity: 0.9,
                }}
            />
            {width > 60 && height > 40 && (
                <>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 - 8}
                        textAnchor="middle"
                        fill="hsl(var(--background))"
                        fontSize={14}
                        fontWeight={600}
                    >
                        {name}
                    </text>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 10}
                        textAnchor="middle"
                        fill="hsl(var(--background))"
                        fontSize={12}
                    >
                        {size.toLocaleString("pt-BR")}
                    </text>
                </>
            )}
        </g>
    )
}

export function FuturisticTreemap({
    data,
    title,
    colors = defaultColors,
    height = 400,
}: FuturisticTreemapProps) {
    // Flatten data for treemap
    const flattenedData = data.flatMap((item) =>
        item.children && item.children.length > 0
            ? item.children.map((child) => ({
                ...child,
                fill: child.fill || item.fill,
            }))
            : [item]
    )

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
                <Treemap
                    data={flattenedData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="hsl(var(--background))"
                    fill="hsl(var(--primary))"
                    content={<CustomizedContent colors={colors} />}
                    isAnimationActive={true}
                    animationDuration={800}
                >
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
                </Treemap>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {flattenedData.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{
                                backgroundColor: item.fill || colors[index % colors.length],
                            }}
                        />
                        <span className="text-muted-foreground">
                            {item.name}: <strong>{item.size.toLocaleString("pt-BR")}</strong>
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
