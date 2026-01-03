/**
 * Notificação de Erro Elegante com Tooltip
 * 
 * Notificações elegantes que podem ser expandidas com tooltips.
 */

"use client";

import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@morina/ui";
import {
  AlertCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { parseError } from "@/lib/errors";
import { getUserFriendlyMessage } from "@/lib/errors/user-messages";
import { cn } from "@/lib/utils";

interface ElegantErrorNotificationProps {
  error: unknown;
  onDismiss?: () => void;
  variant?: "compact" | "expanded" | "minimal";
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}

/**
 * Notificação de erro elegante e compacta
 */
export function ElegantErrorNotification({
  error,
  onDismiss,
  variant = "compact",
  position = "top-right",
  className,
}: ElegantErrorNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Posicionamento
  const positionMap = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  // Variante minimal - apenas ícone com tooltip
  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "fixed z-50",
          positionMap[position],
          className
        )}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all hover:scale-110",
                  colors
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side={position.includes("top") ? "bottom" : "top"}
              className={cn("max-w-xs", colors)}
            >
              <div className="space-y-1.5">
                <p className="font-semibold">{friendly.title}</p>
                <p className="text-xs opacity-90 whitespace-pre-line">
                  {friendly.message}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Variante compact - linha com tooltip
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "fixed z-50 rounded-lg border backdrop-blur-sm shadow-lg transition-all",
          colors,
          positionMap[position],
          className
        )}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">{friendly.title}</span>
                {onDismiss && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss?.();
                    }}
                    className="ml-2 text-current/60 hover:text-current"
                  >
                    ×
                  </button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent
              side={position.includes("top") ? "bottom" : "top"}
              className={cn("max-w-xs", colors)}
            >
              <div className="space-y-1.5">
                <p className="text-xs opacity-90 whitespace-pre-line">
                  {friendly.message}
                </p>
                {appError.fields && appError.fields.length > 0 && (
                  <div className="mt-2 border-t border-current/20 pt-2">
                    <p className="mb-1 text-xs font-semibold">Campos:</p>
                    <ul className="space-y-0.5 text-xs opacity-90">
                      {appError.fields.slice(0, 3).map((field, index) => (
                        <li key={index}>
                          • {field.field}: {field.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Variante expanded - card expansível
  return (
    <div
      className={cn(
        "fixed z-50 rounded-lg border backdrop-blur-sm shadow-lg transition-all",
        colors,
        positionMap[position],
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold">{friendly.title}</h4>
            <p className="mt-1 text-sm opacity-90 whitespace-pre-line">
              {friendly.message}
            </p>
            {isExpanded && appError.fields && appError.fields.length > 0 && (
              <div className="mt-3 border-t border-current/20 pt-3">
                <p className="mb-2 text-xs font-semibold">Campos com erro:</p>
                <ul className="space-y-1 text-xs opacity-90">
                  {appError.fields.map((field, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>•</span>
                      <span>
                        <strong>{field.field}:</strong> {field.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {appError.fields && appError.fields.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-current/60 hover:text-current"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-current/60 hover:text-current"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Toast de erro elegante (para notificações temporárias)
 */
interface ElegantErrorToastProps {
  error: unknown;
  duration?: number;
  onDismiss?: () => void;
}

export function ElegantErrorToast({
  error,
  duration = 5000,
  onDismiss,
}: ElegantErrorToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <ElegantErrorNotification
      error={error}
      variant="compact"
      position="top-right"
      onDismiss={() => {
        setIsVisible(false);
        onDismiss?.();
      }}
      className="animate-in slide-in-from-top-2 fade-in-0"
    />
  );
}









