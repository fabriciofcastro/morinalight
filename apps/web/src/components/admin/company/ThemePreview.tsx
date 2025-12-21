"use client";

import { useMemo } from "react";
import { Monitor, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

interface ThemePreviewProps {
  theme: {
    colors?: {
      primaryColor?: string;
      secondaryColor?: string;
      backgroundColor?: string;
      surfaceColor?: string;
      cardColor?: string;
    };
    borderRadius?: string;
    glassMorphism?: boolean;
    blurIntensity?: number;
  };
  className?: string;
}

export function ThemePreview({ theme, className }: ThemePreviewProps) {
  const borderRadiusClass = useMemo(() => {
    const radiusMap: Record<string, string> = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      full: "rounded-full",
    };
    return radiusMap[theme.borderRadius || "lg"] || "rounded-lg";
  }, [theme.borderRadius]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Monitor className="h-5 w-5 text-[hsl(var(--primary))]" />
        <h4 className="text-sm font-semibold text-white">Preview do Tema</h4>
      </div>

      <div
        className={cn(
          "p-6 border transition-all",
          borderRadiusClass,
          theme.glassMorphism ? "backdrop-blur-xl bg-white/10" : "bg-white/5",
        )}
        style={{
          borderColor: `${theme.colors?.primaryColor || "#5b8aff"}40`,
          backgroundColor: theme.glassMorphism
            ? `${theme.colors?.surfaceColor || "#121212"}85`
            : theme.colors?.cardColor || "#1a1a1a",
          backdropFilter: theme.glassMorphism ? `blur(${theme.blurIntensity || 20}px)` : "none",
        }}
      >
        {/* Botões de exemplo */}
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            className={cn("px-4 py-2 font-medium text-white transition-all", borderRadiusClass)}
            style={{
              backgroundColor: theme.colors?.primaryColor || "#5b8aff",
            }}
          >
            Botão Primário
          </button>
          <button
            type="button"
            className={cn(
              "px-4 py-2 font-medium text-white border transition-all",
              borderRadiusClass,
            )}
            style={{
              borderColor: `${theme.colors?.secondaryColor || "#9c27b0"}60`,
              backgroundColor: `${theme.colors?.secondaryColor || "#9c27b0"}20`,
            }}
          >
            Botão Secundário
          </button>
        </div>

        {/* Cards de exemplo */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className={cn("p-3 border transition-all", borderRadiusClass)}
            style={{
              borderColor: `${theme.colors?.primaryColor || "#5b8aff"}40`,
              backgroundColor: `${theme.colors?.primaryColor || "#5b8aff"}10`,
            }}
          >
            <div className="text-xs font-medium text-white/80">Card Primário</div>
          </div>
          <div
            className={cn("p-3 border transition-all", borderRadiusClass)}
            style={{
              borderColor: `${theme.colors?.secondaryColor || "#9c27b0"}40`,
              backgroundColor: `${theme.colors?.secondaryColor || "#9c27b0"}10`,
            }}
          >
            <div className="text-xs font-medium text-white/80">Card Secundário</div>
          </div>
        </div>

        {/* Paleta de cores */}
        <div className="flex gap-2 pt-3 border-t border-white/10">
          {[
            { color: theme.colors?.primaryColor || "#5b8aff", label: "Primária" },
            { color: theme.colors?.secondaryColor || "#9c27b0", label: "Secundária" },
            { color: theme.colors?.backgroundColor || "#09090b", label: "Fundo" },
            { color: theme.colors?.surfaceColor || "#121212", label: "Superfície" },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={cn("w-8 h-8 border border-white/10", borderRadiusClass)}
                style={{ backgroundColor: item.color }}
                title={item.label}
              />
              <span className="text-[10px] text-zinc-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



