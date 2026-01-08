/**
 * Componente de Tooltip de Erro Elegante
 * 
 * Exibe erros de forma elegante e discreta usando tooltips.
 */

"use client";

import { parseError } from "@/lib/errors";
import { getUserFriendlyMessage } from "@/lib/errors/user-messages";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@morina/ui";
import { AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import React from "react";

interface ErrorTooltipProps {
  error: unknown;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  showIcon?: boolean;
  delayDuration?: number;
}

/**
 * Tooltip de erro elegante
 */
export function ErrorTooltip({
  error,
  children,
  side = "top",
  align = "center",
  className,
  showIcon = true,
  delayDuration = 300,
}: ErrorTooltipProps) {
  if (!error) return <>{children}</>;

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
      text: "text-red-300",
      border: "border-red-500/40",
      bg: "bg-[#1a0505]/95",
      accent: "border-red-500/60"
    },
    error: {
      text: "text-red-300",
      border: "border-red-500/40",
      bg: "bg-[#1a0505]/95",
      accent: "border-red-500/60"
    },
    warning: {
      text: "text-amber-300",
      border: "border-amber-500/40",
      bg: "bg-[#1a1505]/95",
      accent: "border-amber-500/60"
    },
    info: {
      text: "text-[#4d73ff]",
      border: "border-[#2957ff]/40",
      bg: "bg-[#050a1a]/95",
      accent: "border-[#2957ff]/60"
    },
  };

  const theme = colorMap[friendly.severity] || colorMap.error;

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center", className)}>
            {children}
            {showIcon && (
              <Icon className={cn("ml-1.5 h-4 w-4 shrink-0", theme.text)} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "max-w-xs border-2 shadow-xl backdrop-blur-md p-0 overflow-hidden",
            theme.border,
            theme.bg,
            className
          )}
        >
          {/* HUD Corner Decorations */}
          <div className={cn("absolute top-0 left-0 w-2 h-2 border-t border-l", theme.accent)} />
          <div className={cn("absolute bottom-0 right-0 w-2 h-2 border-b border-r", theme.accent)} />

          <div className="p-3 space-y-1.5 font-mono">
            <div className="flex items-start gap-2.5">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", theme.text)} />
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white leading-tight">
                    {friendly.title}
                </p>
                <div className="flex items-center gap-1 mt-1 mb-2 opacity-30">
                    <div className={cn("h-px w-3 bg-current", theme.text)} />
                    <span className="text-[8px] uppercase tracking-tighter">Diagnostic_Trace</span>
                </div>
                <p className="text-[10px] opacity-70 lowercase leading-relaxed">
                  {friendly.message}
                </p>
              </div>
            </div>
            {appError.fields && appError.fields.length > 0 && (
              <div className="mt-3 border-t border-white/5 pt-2">
                <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-white/30">Trace_Registry:</p>
                <ul className="space-y-1 text-[9px] opacity-60 lowercase">
                  {appError.fields.slice(0, 3).map((field, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500">»</span>
                      <span>
                        <strong className="text-white/60">{field.field}:</strong> {field.message}
                      </span>
                    </li>
                  ))}
                  {appError.fields.length > 3 && (
                    <li className="text-[8px] opacity-40 ml-4 py-1">
                      +[EXTENDED_DATA_OMITTED]
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Tooltip de erro para campos de formulário
 */
interface FieldErrorTooltipProps {
  error?: string | unknown;
  fieldName?: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function FieldErrorTooltip({
  error,
  fieldName,
  children,
  side = "right",
}: FieldErrorTooltipProps) {
  if (!error) return <>{children}</>;

  const errorMessage =
    typeof error === "string"
      ? error
      : parseError(error).getUserMessage();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center">
            {children}
            <XCircle className="ml-1.5 h-4 w-4 shrink-0 text-red-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-xs border border-red-500/30 bg-red-500/10 text-red-300 shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-start gap-2">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              {fieldName && (
                <p className="mb-1 font-semibold">Erro em {fieldName}:</p>
              )}
              <p className="text-xs opacity-90">{errorMessage}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Badge de erro com tooltip
 */
interface ErrorBadgeProps {
  error: unknown;
  variant?: "subtle" | "prominent";
  showTooltip?: boolean;
  className?: string;
}

export function ErrorBadge({
  error,
  variant = "subtle",
  showTooltip = true,
  className,
}: ErrorBadgeProps) {
  if (!error) return null;

  const appError = parseError(error);
  const friendly = getUserFriendlyMessage(appError);

  const Icon = XCircle;

  const badgeContent = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        variant === "subtle"
          ? "border border-red-500/20 bg-red-500/10 text-red-300"
          : "border border-red-500/40 bg-red-500/20 text-red-200",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{friendly.title}</span>
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <ErrorTooltip error={error} showIcon={false}>
      {badgeContent}
    </ErrorTooltip>
  );
}

/**
 * Indicador de erro inline elegante
 */
interface InlineErrorIndicatorProps {
  error: unknown;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  size?: "sm" | "md" | "lg";
}

export function InlineErrorIndicator({
  error,
  position = "top-right",
  size = "md",
}: InlineErrorIndicatorProps) {
  if (!error) return null;

  const appError = parseError(error);
  const friendly = getUserFriendlyMessage(appError);

  const Icon = XCircle;

  const sizeMap = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const positionMap = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  return (
    <ErrorTooltip error={error} showIcon={false}>
      <div
        className={cn(
          "absolute z-10 rounded-full border-2 border-red-500/40 bg-red-500/20 p-0.5 backdrop-blur-sm",
          positionMap[position],
          sizeMap[size]
        )}
      >
        <Icon className={cn("text-red-300", sizeMap[size])} />
      </div>
    </ErrorTooltip>
  );
}










