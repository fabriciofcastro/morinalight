import { cn } from "@morina/ui";
import type { ComponentProps } from "react";

export interface ProgressProps extends ComponentProps<"div"> {
  value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const bounded = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(bounded)}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--surface)_92%,transparent)]",
        className,
      )}
      {...props}
    >
      <div
        className="h-full w-full origin-left rounded-full bg-[linear-gradient(120deg,rgba(91,138,255,0.9),rgba(91,138,255,0.6))] shadow-[0_0_12px_rgba(91,138,255,0.45)] transition-transform"
        style={{ transform: `translateX(-${100 - bounded}%)` }}
      />
    </div>
  );
}
