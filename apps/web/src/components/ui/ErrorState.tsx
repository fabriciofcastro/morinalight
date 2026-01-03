"use client";

import { Button, GlassCard, cn } from "@morina/ui";
import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Erro ao carregar",
  message = "Ocorreu um erro ao carregar os dados. Tente novamente.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <GlassCard className={cn("p-12 text-center", className)}>
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded border border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mb-6 text-sm text-white/60">{message}</p>
      {onRetry && (
        <Button type="button" onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      )}
    </GlassCard>
  );
}


