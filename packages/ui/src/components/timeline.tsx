"use client";

import type * as React from "react";
import { cn } from "../lib/cn";

/**
 * Timeline Component - Enterprise Grade
 *
 * Features:
 * - Vertical timeline
 * - Custom icons
 * - Active/completed states
 * - Theme-aware
 */

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Item is active */
  active?: boolean;
  /** Item is completed */
  completed?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Is last item */
  isLast?: boolean;
}

export function TimelineItem({
  active,
  completed,
  icon,
  isLast,
  className,
  children,
  ...props
}: TimelineItemProps) {
  return (
    <div className={cn("relative flex gap-4 pb-8", isLast && "pb-0", className)} {...props}>
      {/* Line */}
      {!isLast && <div className="absolute left-[15px] top-[30px] bottom-0 w-px bg-border" />}

      {/* Icon/Point */}
      <div
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
          "transition-colors",
          completed && "bg-success border-success text-white",
          active && !completed && "bg-primary border-primary text-white",
          !active && !completed && "bg-surface border-border text-text-tertiary",
        )}
      >
        {icon || (
          <div className={cn("h-2 w-2 rounded-full", (active || completed) && "bg-white")} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">{children}</div>
    </div>
  );
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Timeline({ className, children, ...props }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)} {...props}>
      {children}
    </div>
  );
}

Timeline.displayName = "Timeline";
TimelineItem.displayName = "TimelineItem";

export { Timeline as default };
