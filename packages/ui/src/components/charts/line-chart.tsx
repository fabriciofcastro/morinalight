"use client";

import * as React from "react";
import { LineChart as RechartsLineChart } from "recharts";

type LineChartProps = React.ComponentProps<typeof RechartsLineChart>;

const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <RechartsLineChart
                ref={ref as any}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                {...props}
            >
                {children}
            </RechartsLineChart>
        );
    }
);
LineChart.displayName = "LineChart";

export { LineChart };
