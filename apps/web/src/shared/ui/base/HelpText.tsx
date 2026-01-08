"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@morina/ui";
import { cn } from "@morina/ui";

interface HelpTextProps {
  text: string;
  className?: string;
  variant?: "default" | "subtle" | "warning" | "info";
}

export function HelpText({ text, className, variant = "default" }: HelpTextProps) {
  const variantStyles = {
    default: "text-zinc-400",
    subtle: "text-zinc-500",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };

  return (
    <div className={cn("flex items-start gap-1.5 text-xs", className)}>
      <Info className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", variantStyles[variant])} aria-hidden="true" />
      <p className={cn("leading-relaxed", variantStyles[variant])}>{text}</p>
    </div>
  );
}

interface HelpTextWithTooltipProps {
  text: string;
  tooltip: string;
  className?: string;
  variant?: "default" | "subtle" | "warning" | "info";
}

export function HelpTextWithTooltip({
  text,
  tooltip,
  className,
  variant = "default",
}: HelpTextWithTooltipProps) {
  const variantStyles = {
    default: "text-zinc-400",
    subtle: "text-zinc-500",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-start gap-1.5 text-xs", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                "h-3.5 w-3.5 mt-0.5 shrink-0 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-colors",
                variantStyles[variant],
              )}
              aria-label="Mais informações"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
        <p className={cn("leading-relaxed", variantStyles[variant])}>{text}</p>
      </div>
    </TooltipProvider>
  );
}


