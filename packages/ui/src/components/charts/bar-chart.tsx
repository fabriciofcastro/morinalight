"use client";

import * as React from "react";
import { BarChart as RechartsBarChart } from "recharts";

type BarChartProps = React.ComponentProps<typeof RechartsBarChart>;

const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <RechartsBarChart
                ref={ref as any}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                {...props}
            >
                {children}
            </RechartsBarChart>
        );
    }
);
BarChart.displayName = "BarChart";

export { BarChart };
