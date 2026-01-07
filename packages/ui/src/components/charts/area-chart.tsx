"use client";

import * as React from "react";
import { AreaChart as RechartsAreaChart, ResponsiveContainer } from "recharts";

type AreaChartProps = React.ComponentProps<typeof RechartsAreaChart>;

const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <RechartsAreaChart
                ref={ref as any}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                {...props}
            >
                <defs>
                    <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                {children}
            </RechartsAreaChart>
        );
    }
);
AreaChart.displayName = "AreaChart";

export { AreaChart };
