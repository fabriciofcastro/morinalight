/**
 * Componente de Exibição de Erros Amigável
 * 
 * Exibe erros de forma amigável e acionável para o usuário.
 */

"use client";

import { parseError } from "@/lib/errors";
import { getUserFriendlyMessage } from "@/lib/errors/user-messages";
import { cn } from "@/lib/utils";
import { Button } from "@morina/ui";
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Info,
    RefreshCw,
    XCircle,
} from "lucide-react";

interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
  variant?: "inline" | "card" | "fullscreen";
  showDetails?: boolean;
}

/**
 * Componente de exibição de erro amigável
 */
export function ErrorDisplay({
  error,
  onRetry,
  onGoBack,
  className,
  variant = "card",
  showDetails = false,
}: ErrorDisplayProps) {
  const appError = parseError(error);
  const friendly = getUserFriendlyMessage(appError);

  // Ícones baseados na severidade
  const iconMap = {
    critical: AlertTriangle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = iconMap[friendly.severity] || AlertCircle;

  // Cores baseadas na severidade
  const colorMap = {
    critical: {
      text: "text-red-400",
      border: "border-red-500/20",
      bg: "bg-red-500/10",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.1)]",
      accent: "border-red-500/60"
    },
    error: {
      text: "text-red-400",
      border: "border-red-500/20",
      bg: "bg-red-500/10",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.1)]",
      accent: "border-red-500/60"
    },
    warning: {
      text: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.1)]",
      accent: "border-amber-500/60"
    },
    info: {
      text: "text-[#2957ff]",
      border: "border-[#2957ff]/20",
      bg: "bg-[#2957ff]/10",
      glow: "shadow-[0_0_20px_rgba(41,87,255,0.1)]",
      accent: "border-[#2957ff]/60"
    },
  };

  const theme = colorMap[friendly.severity] || colorMap.error;

  // Renderizar inline
  if (variant === "inline") {
    return (
      <div className={cn("relative flex items-start gap-4 p-4 border overflow-hidden", theme.border, theme.bg, theme.glow, className)}>
        {/* HUD Corner Mini Brackets */}
        <div className={cn("absolute top-0 left-0 w-2 h-2 border-t border-l", theme.accent)} />
        <div className={cn("absolute bottom-0 right-0 w-2 h-2 border-b border-r", theme.accent)} />
        
        <Icon className={cn("mt-1 h-5 w-5 shrink-0", theme.text)} />
        <div className="flex-1">
          <h4 className="font-mono text-xs uppercase tracking-widest text-white mb-1">{friendly.title}</h4>
          <p className="text-sm text-white/60 whitespace-pre-line leading-relaxed">{friendly.message}</p>
          
          <div className="mt-4 flex gap-3">
            {onRetry && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                className="h-8 font-mono text-[10px] uppercase tracking-widest bg-white/5 border border-white/5 hover:bg-white/10"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry_Sequence
              </Button>
            )}
            {onGoBack && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onGoBack}
                className="h-8 font-mono text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100"
              >
                <ArrowLeft className="mr-2 h-3 w-3" />
                Back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar card / fullscreen base styling
  return (
    <div className={cn(
        variant === "fullscreen" ? "flex min-h-[60vh] items-center justify-center p-4 bg-black/5" : "w-full"
    )}>
      <div className={cn(
        "relative w-full overflow-hidden bg-[#0a0f1d]/90 border py-10 px-8 transition-all duration-500",
        variant === "fullscreen" ? "max-w-2xl" : "max-w-md",
        theme.border,
        theme.glow,
        className
      )}>
        {/* HUD Background Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            <div className={cn("absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent animate-scan z-10", theme.text)} />
            
            {/* 90° Corner Brackets */}
            <div className={cn("absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2", theme.accent)} />
            <div className={cn("absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2", theme.accent)} />
            <div className={cn("absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2", theme.accent)} />
            <div className={cn("absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2", theme.accent)} />
        </div>

        <div className="relative flex flex-col items-center text-center">
            {/* Icon HUD */}
            <div className="mb-6">
                <div className={cn("flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white/[0.03] shadow-inner", theme.border)}>
                    <Icon className={cn("h-8 w-8", theme.text)} />
                </div>
            </div>

            <h2 className={cn("mb-2 text-xl font-bold text-white uppercase tracking-tight", variant === "fullscreen" && "text-2xl")}>
                {friendly.title}
            </h2>

            <div className="flex items-center justify-center gap-2 mb-6">
                <div className={cn("h-px w-6", theme.bg)} />
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">System_Log::Alert</span>
                <div className={cn("h-px w-6", theme.bg)} />
            </div>

            <p className="mb-8 text-sm text-white/50 leading-relaxed max-w-sm">
                {friendly.message}
            </p>

            {appError.fields && appError.fields.length > 0 && (
                <div className="mb-8 w-full border border-white/10 bg-white/[0.02] p-4 text-left">
                    <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">
                        Validation_Details
                    </h3>
                    <ul className="space-y-2">
                        {appError.fields.map((field, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs">
                                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                                <span>
                                    <strong className="text-white/80">{field.field}:</strong> 
                                    <span className="ml-1 text-white/50">{field.message}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showDetails && process.env.NODE_ENV === "development" && (
                <div className="mb-8 w-full">
                    <details className="group border border-white/5 bg-black/20">
                        <summary className="cursor-pointer p-3 font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors">
                            Technical_Decomposition
                        </summary>
                        <div className="p-4 pt-0 space-y-2 font-mono text-[10px] text-white/40">
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span>Code::</span>
                                <span className="text-red-400">{appError.code}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span>Status::</span>
                                <span className="text-amber-500">{appError.statusCode}</span>
                            </div>
                            {appError.stack && (
                                <pre className="mt-2 max-h-40 overflow-auto bg-black border border-white/5 p-2 text-[9px] lowercase opacity-50 custom-scrollbar text-left">
                                    {appError.stack}
                                </pre>
                            )}
                        </div>
                    </details>
                </div>
            )}

            <div className="flex w-full gap-4">
                {onRetry && (
                    <Button 
                        onClick={onRetry} 
                        className={cn(
                            "flex-1 font-mono text-[11px] uppercase tracking-widest transition-all",
                            friendly.severity === "info" ? "bg-[#2957ff] hover:bg-[#2957ff]/80" : "bg-red-600 hover:bg-red-500"
                        )}
                    >
                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                        {friendly.action || "Retry_Sequence"}
                    </Button>
                )}
                {onGoBack && (
                    <Button 
                        onClick={onGoBack} 
                        variant="ghost" 
                        className="flex-1 font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 border border-white/5"
                    >
                        <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                        Back
                    </Button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de sucesso (para feedback positivo)
 */
interface SuccessDisplayProps {
  title: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function SuccessDisplay({
  title,
  message,
  onClose,
  className,
}: SuccessDisplayProps) {
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4", className)}>
      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
      <div className="flex-1">
        <h4 className="mb-1 font-semibold text-white">{title}</h4>
        <p className="text-sm text-white/80">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white"
          aria-label="Fechar"
        >
          ×
        </button>
      )}
    </div>
  );
}










