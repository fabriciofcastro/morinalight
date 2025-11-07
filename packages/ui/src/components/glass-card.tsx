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
        "relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-muted)_82%,transparent)] backdrop-blur-[36px]",
        glow && "shadow-[var(--shadow-soft)]",
        "text-[var(--fg)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--primary)_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,transparent_65%)]" />
      </div>
      <div className="relative z-[1] p-[var(--space-6)]">{children}</div>
    </div>
  );
}
