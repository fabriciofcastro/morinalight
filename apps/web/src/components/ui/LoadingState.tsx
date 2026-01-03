"use client";

import { GlassCard, cn } from "@morina/ui";
import { Loader2 } from "lucide-react";

type LoadingStateProps = {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function LoadingState({
  message = "Carregando...",
  className,
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <GlassCard className={cn("flex flex-col items-center justify-center p-12", className)}>
      <Loader2 className={cn("animate-spin text-[hsl(var(--primary))]", sizeClasses[size])} />
      <p className="mt-4 text-sm text-white/60">{message}</p>
    </GlassCard>
  );
}


