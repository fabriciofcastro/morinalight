"use client";

import type { PropsWithChildren } from "react";
import { cn } from "../lib/cn";

type GlassCardEnhancedProps = PropsWithChildren<{
  className?: string;
  variant?: "base" | "elevated" | "subtle";
  blur?: "normal" | "strong";
  glow?: boolean;
}>;

export function GlassCardEnhanced({
  children,
  className,
  variant = "base",
  blur = "normal",
  glow = true,
}: GlassCardEnhancedProps) {
  const blurClass = blur === "strong" ? "backdrop-blur-[40px]" : "backdrop-blur-[20px]";
  
  const variantClasses = {
    base: "bg-[color-mix(in_oklab,hsl(var(--surface))_85%,transparent_15%)]",
    elevated: "bg-[color-mix(in_oklab,hsl(var(--surface))_90%,transparent_10%)]",
    subtle: "bg-[color-mix(in_oklab,hsl(var(--surface))_70%,transparent_30%)]",
  };

  return (
    <div
      className={cn(
        // Base: Quadrado, glass effect, blur
        "relative overflow-hidden border border-[color-mix(in_oklab,hsl(var(--border))_60%,transparent_40%)]",
        variantClasses[variant],
        blurClass,
        // Sombra glass
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        // Glow opcional
        glow && "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15)_0%,transparent_50%)] before:opacity-60 before:pointer-events-none",
        className,
      )}
    >
      {/* Gradient overlay sutil */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,transparent_65%)]" />
      </div>
      
      {/* Conteúdo */}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

