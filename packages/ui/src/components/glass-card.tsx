import type { PropsWithChildren } from "react";

import { cn } from "../lib/cn";

type GlassCardProps = PropsWithChildren<{
  className?: string;
  glow?: boolean;
}>;

export function GlassCard({ children, className, glow = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-[hsl(var(--surface))] border border-[hsl(var(--border))]",
        "rounded-[var(--radius-sm)]", // Sharp corners
        "transition-all duration-300",
        glow && "hover:shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.15)]",
        // Top reflection line
        "before:absolute before:inset-x-0 before:top-0 before:h-[1px]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}
