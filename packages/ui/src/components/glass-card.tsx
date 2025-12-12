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
        "bg-[color-mix(in_oklab,hsl(var(--surface))_82%,transparent_18%)] border border-[color-mix(in_oklab,hsl(var(--border))_60%,transparent_40%)]",
        "rounded-none",
        "transition-all duration-300",
        glow && "hover:shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.15)]",
        // Top reflection line
        "before:absolute before:inset-x-0 before:top-0 before:h-[1px]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className,
      )}
    >
      {/* Tech corners */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-[hsl(var(--primary)/0.55)]" />
        <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-[hsl(var(--primary)/0.55)]" />
        <div className="absolute left-0 bottom-0 h-3 w-3 border-l border-b border-[hsl(var(--primary)/0.55)]" />
        <div className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-[hsl(var(--primary)/0.55)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary))/0.06,transparent_45%),radial-gradient(circle_at_80%_60%,hsl(var(--accent))/0.06,transparent_50%)] opacity-80" />
      </div>
      {children}
    </div>
  );
}
