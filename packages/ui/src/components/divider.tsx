import type * as React from "react";
import { cn } from "../lib/cn";

/**
 * Divider Component - Enterprise Grade
 *
 * Features:
 * - Horizontal or vertical
 * - Optional label
 * - Theme-aware
 */

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation */
  orientation?: "horizontal" | "vertical";
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: "left" | "center" | "right";
}

export function Divider({
  orientation = "horizontal",
  label,
  labelPosition = "center",
  className,
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return <div className={cn("w-px bg-border", "self-stretch", className)} {...props} />;
  }

  if (label) {
    return (
      <div className={cn("flex items-center gap-4", "w-full", className)} {...props}>
        {labelPosition !== "left" && <div className="flex-1 h-px bg-border" />}
        <span className="text-sm text-text-tertiary whitespace-nowrap">{label}</span>
        {labelPosition !== "right" && <div className="flex-1 h-px bg-border" />}
      </div>
    );
  }

  return <div className={cn("h-px bg-border", "w-full", className)} {...props} />;
}

Divider.displayName = "Divider";
