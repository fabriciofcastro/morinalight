"use client";

import * as React from "react";
import { PieChart as RechartsPieChart } from "recharts";

type PieChartProps = React.ComponentProps<typeof RechartsPieChart>;

const PieChart = React.forwardRef<HTMLDivElement, PieChartProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <RechartsPieChart
                ref={ref as any}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                {...props}
            >
                {children}
            </RechartsPieChart>
        );
    }
);
PieChart.displayName = "PieChart";

export { PieChart };
