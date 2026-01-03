/**
 * Componente de Tooltip de Erro Elegante
 * 
 * Exibe erros de forma elegante e discreta usando tooltips.
 */

"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@morina/ui";
import { AlertCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { parseError, type AppError } from "@/lib/errors";
import { getUserFriendlyMessage } from "@/lib/errors/user-messages";
import { cn } from "@/lib/utils";

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
    critical: "border-red-500/30 bg-red-500/10 text-red-300",
    error: "border-red-500/30 bg-red-500/10 text-red-300",
    warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  };

  const colors = colorMap[friendly.severity] || colorMap.error;

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center", className)}>
            {children}
            {showIcon && (
              <Icon className="ml-1.5 h-4 w-4 shrink-0 text-red-400" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "max-w-xs border shadow-lg backdrop-blur-sm",
            colors,
            className
          )}
        >
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{friendly.title}</p>
                <p className="mt-1 text-xs opacity-90 whitespace-pre-line">
                  {friendly.message}
                </p>
              </div>
            </div>
            {appError.fields && appError.fields.length > 0 && (
              <div className="mt-2 border-t border-current/20 pt-2">
                <p className="mb-1 text-xs font-semibold">Campos com erro:</p>
                <ul className="space-y-0.5 text-xs opacity-90">
                  {appError.fields.slice(0, 3).map((field, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="mt-0.5">•</span>
                      <span>
                        <strong>{field.field}:</strong> {field.message}
                      </span>
                    </li>
                  ))}
                  {appError.fields.length > 3 && (
                    <li className="text-xs opacity-70">
                      +{appError.fields.length - 3} mais
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









