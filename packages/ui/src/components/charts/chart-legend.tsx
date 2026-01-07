"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "../../lib/cn";
import { useChart } from "./chart-config";

// ----------------------------------------------------------------------------
// ChartLegend
// ----------------------------------------------------------------------------

const ChartLegend = RechartsPrimitive.Legend;

// ----------------------------------------------------------------------------
// ChartLegendContent
// ----------------------------------------------------------------------------

interface ChartLegendContentProps
    extends React.ComponentProps<"div"> {
    hideIcon?: boolean;
    nameKey?: string;
    payload?: any[];
    verticalAlign?: "top" | "middle" | "bottom";
}

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
    ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
        const { config } = useChart();

        if (!payload?.length) {
            return null;
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center justify-center gap-4",
                    verticalAlign === "top" ? "pb-3" : "pt-3",
                    className
                )}
            >
                {payload.map((item: any) => {
                    const key = `${nameKey || item.dataKey || "value"}`;
                    const itemConfig = getPayloadConfigFromPayload(config, item, key);

                    return (
                        <div
                            key={item.value}
                            className={cn(
                                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
                            )}
                        >
                            {itemConfig?.icon && !hideIcon ? (
                                <itemConfig.icon />
                            ) : (
                                <div
                                    className="h-2 w-2 shrink-0 rounded-[2px]"
                                    style={{
                                        backgroundColor: item.color,
                                    }}
                                />
                            )}
                            {itemConfig?.label}
                        </div>
                    );
                })}
            </div>
        );
    }
);
ChartLegendContent.displayName = "ChartLegendContent";

// Helper (duplicated for now, could be shared util)
function getPayloadConfigFromPayload(
    config: any,
    payload: any,
    key: string
) {
    if (typeof payload !== "object" || payload === null) {
        return undefined;
    }

    const payloadPayload = payload.payload;
    let configLabelKey: string = key;

    if (
        key in payload &&
        typeof payload[key as keyof typeof payload] === "string"
    ) {
        configLabelKey = payload[key as keyof typeof payload] as string;
    } else if (
        payloadPayload &&
        key in payloadPayload &&
        typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
    ) {
        configLabelKey = payloadPayload[
            key as keyof typeof payloadPayload
        ] as string;
    }

    return configLabelKey in config
        ? config[configLabelKey]
        : config[key as keyof typeof config];
}

export { ChartLegend, ChartLegendContent };
