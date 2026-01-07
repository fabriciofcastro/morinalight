"use client";

import React from "react";
import { cn } from "../../lib/cn";
import { semanticTokens } from "../../theme/semantic-tokens";
import type { StatsGroupProps, StatsLayout } from "./stats-group.types";

/**
 * Obtém as classes CSS para o layout
 */
function getLayoutClasses(layout: StatsLayout): string {
  const layoutMap = {
    horizontal: "flex items-center flex-wrap",
    "grid-2": "grid grid-cols-1 md:grid-cols-2",
    "grid-3": "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    "grid-4": "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return layoutMap[layout];
}

/**
 * StatsGroup - Container para agrupar StatCards
 *
 * @example
 * ```tsx
 * <StatsGroup layout="grid-3">
 *   <StatCard icon={Building2} label="Total" value={100} variant="primary" />
 *   <StatCard icon={CheckCircle2} label="Ativos" value={80} variant="success" />
 *   <StatCard icon={XCircle} label="Inativos" value={20} variant="danger" />
 * </StatsGroup>
 * ```
 *
 * @example
 * ```tsx
 * <StatsGroup layout="horizontal" showSeparators>
 *   <StatCard icon={Building2} label="Total" value={100} variant="primary" />
 *   <StatCard icon={CheckCircle2} label="Ativos" value={80} variant="success" />
 * </StatsGroup>
 * ```
 */
export function StatsGroup({
  children,
  layout = "grid-3",
  showSeparators = false,
  className,
}: StatsGroupProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div
      className={cn(getLayoutClasses(layout), className)}
      style={{
        gap: semanticTokens.spacing.component.gap.lg,
      }}
    >
      {showSeparators && layout === "horizontal"
        ? childrenArray.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < childrenArray.length - 1 && (
                <div
                  className="h-8 w-px flex-shrink-0"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${semanticTokens.color.border.default}, transparent)`,
                  }}
                />
              )}
            </React.Fragment>
          ))
        : children}
    </div>
  );
}
