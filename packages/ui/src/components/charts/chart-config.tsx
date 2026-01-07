"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "../../lib/cn";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type ChartConfig = {
    [key: string]: {
        label?: React.ReactNode;
        icon?: React.ComponentType;
        color?: string;
        theme?: Record<"light" | "dark", string>;
    };
};

type ChartContextProps = {
    config: ChartConfig;
};

// ----------------------------------------------------------------------------
// Context
// ----------------------------------------------------------------------------

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
    const context = React.useContext(ChartContext);

    if (!context) {
        throw new Error("useChart must be used within a <ChartContainer />");
    }

    return context;
}

// ----------------------------------------------------------------------------
// ChartContainer
// ----------------------------------------------------------------------------

interface ChartContainerProps extends React.ComponentProps<"div"> {
    config: ChartConfig;
    children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
    ({ id, className, children, config, ...props }, ref) => {
        const uniqueId = React.useId();
        const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

        return (
            <ChartContext.Provider value={{ config }}>
                <div
                    data-chart={chartId}
                    ref={ref}
                    className={cn(
                        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='bbbbbb']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_line]:stroke-border [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-line[stroke='bbbbbb']]:stroke-transparent",
                        className
                    )}
                    {...props}
                >
                    <ChartStyle id={chartId} config={config} />
                    <ResponsiveContainer>{children}</ResponsiveContainer>
                </div>
            </ChartContext.Provider>
        );
    }
);
ChartContainer.displayName = "ChartContainer";

// ----------------------------------------------------------------------------
// ChartStyle
// ----------------------------------------------------------------------------

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
    const colorConfig = Object.entries(config).filter(
        ([, config]) => config.theme || config.color
    );

    if (!colorConfig.length) {
        return null;
    }

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
        [data-chart=${id}] {
          ${colorConfig
                    .map(([key, item]) => {
                        const color =
                            item.theme?.light || item.color;
                        return color ? `--color-${key}: ${color};` : null;
                    })
                    .join("\n")}
                }

                .dark [data-chart=${id}] {
                    ${colorConfig
                    .map(([key, item]) => {
                        const color =
                            item.theme?.dark || item.color;
                        return color ? `--color-${key}: ${color};` : null;
                    })
                    .join("\n")}
                }
      `,
        }} />
    );
};

export { ChartContainer, ChartContext, useChart };
