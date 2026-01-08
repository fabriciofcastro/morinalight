/**
 * Notificação de Erro Elegante com Tooltip
 * 
 * Notificações elegantes que podem ser expandidas com tooltips.
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
import {
    AlertCircle,
    AlertTriangle,
    Info,
    XCircle
} from "lucide-react";
import React, { useState } from "react";

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
    critical: {
      text: "text-red-400",
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      accent: "border-red-500/60"
    },
    error: {
      text: "text-red-400",
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      accent: "border-red-500/60"
    },
    warning: {
      text: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      accent: "border-amber-500/60"
    },
    info: {
      text: "text-[#2957ff]",
      border: "border-[#2957ff]/30",
      bg: "bg-[#2957ff]/10",
      accent: "border-[#2957ff]/60"
    },
  };

  const theme = colorMap[friendly.severity] || colorMap.error;

  // Posicionamento
  const positionMap = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const handleCopyError = () => {
    navigator.clipboard.writeText(JSON.stringify(appError, null, 2));
  };

  // Variante minimal - apenas ícone com tooltip
  if (variant === "minimal") {
    return (
      <div className={cn("fixed z-50", positionMap[position], className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center border backdrop-blur-md transition-all hover:scale-105 overflow-hidden",
                  theme.border, theme.bg, theme.text
                )}
              >
                {/* Mini Corners */}
                <div className={cn("absolute top-0 left-0 w-1.5 h-1.5 border-t border-l", theme.accent)} />
                <div className={cn("absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r", theme.accent)} />
                <Icon className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side={position.includes("top") ? "bottom" : "top"}
              className={cn("max-w-xs bg-[#0a0f1d] border-2 font-mono text-[10px]", theme.border)}
            >
              <div className="space-y-1.5 p-1">
                <p className="font-bold uppercase tracking-widest text-white">{friendly.title}</p>
                <p className="opacity-70 lowercase leading-relaxed">
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
          "fixed z-50 border backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all overflow-hidden",
          theme.border, theme.bg, theme.text,
          positionMap[position],
          className
        )}
      >
        {/* Scanning beam */}
        <div className={cn("absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent animate-scan z-10", theme.text)} />
        
        {/* HUD Corners */}
        <div className={cn("absolute top-0 left-0 w-2 h-2 border-t border-l", theme.accent)} />
        <div className={cn("absolute bottom-0 right-0 w-2 h-2 border-b border-r", theme.accent)} />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 px-4 py-2 cursor-help">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-white/90">{friendly.title}</span>
                {onDismiss && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss?.();
                    }}
                    className="ml-2 text-current/40 hover:text-current transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent
              side={position.includes("top") ? "bottom" : "top"}
              className={cn("max-w-xs bg-[#0a0f1d] border-2 font-mono text-[9px]", theme.border)}
            >
              <div className="space-y-2 p-1">
                <p className="opacity-70 lowercase leading-relaxed">
                  {friendly.message}
                </p>
                {appError.fields && appError.fields.length > 0 && (
                  <div className="mt-2 border-t border-white/10 pt-2">
                    <p className="mb-1 uppercase tracking-widest text-white/40">Trace_Fields:</p>
                    <ul className="space-y-0.5 opacity-60 lowercase">
                      {appError.fields.slice(0, 3).map((field, index) => (
                        <li key={index}>
                          • {field.field}:: {field.message}
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
        "fixed z-50 border backdrop-blur-md shadow-xl transition-all overflow-hidden max-w-sm",
        theme.border, theme.bg, theme.text,
        positionMap[position],
        className
      )}
    >
      {/* HUD Enhancements */}
      <div className={cn("absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2", theme.accent)} />
      <div className={cn("absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2", theme.accent)} />
      
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn("mt-1 flex h-8 w-8 items-center justify-center rounded-sm bg-white/[0.03] border", theme.border)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white leading-none mb-2">
                {friendly.title}
            </h4>
            <div className="flex items-center gap-2 mb-3">
                <div className={cn("h-px w-4", theme.bg)} />
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">Diagnostic::Alert</span>
            </div>
            <p className="text-[11px] opacity-60 lowercase leading-relaxed mb-4">
              {friendly.message}
            </p>
            
            <div className="flex items-center gap-4">
                <button 
                  onClick={handleCopyError}
                  className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
                >
                    [Copy_Diag]
                </button>
                {appError.fields && appError.fields.length > 0 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors flex items-center gap-1"
                    >
                        {isExpanded ? "[-] Hide_Fields" : "[+] Trace_Fields"}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && appError.fields && appError.fields.length > 0 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 border-t border-white/5 pt-4 overflow-hidden"
                  >
                    <ul className="space-y-2 font-mono text-[9px] opacity-50 lowercase tracking-tight">
                      {appError.fields.map((field, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500">»</span>
                          <span>
                            <strong className="text-white/60">{field.field}:</strong> {field.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="mt-0.5 text-current/30 hover:text-current transition-colors"
            >
              ×
            </button>
          )}
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
    return undefined;
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










