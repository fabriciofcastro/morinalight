"use client";

import { motion } from "framer-motion";
import { Grid, List } from "lucide-react";
import { cn } from "../../lib/cn";
import { semanticTokens } from "../../theme/semantic-tokens";
import type { ViewMode, ViewToggleProps } from "./view-toggle.types";

/**
 * ViewToggle - Toggle entre visualização grid e lista
 *
 * @example
 * ```tsx
 * const [viewMode, setViewMode] = useState<ViewMode>("grid");
 *
 * <ViewToggle value={viewMode} onChange={setViewMode} />
 * ```
 */
export function ViewToggle({
  value,
  onChange,
  gridIcon: GridIcon = Grid,
  listIcon: ListIcon = List,
  className,
  disabled = false,
}: ViewToggleProps) {
  const modes: Array<{ value: ViewMode; icon: typeof GridIcon; label: string }> = [
    { value: "grid", icon: GridIcon, label: "Visualização em grid" },
    { value: "list", icon: ListIcon, label: "Visualização em lista" },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-lg border backdrop-blur-xl",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      style={{
        borderColor: semanticTokens.color.border.subtle,
        backgroundColor: `color-mix(in srgb, ${semanticTokens.color.background.glass} 80%, transparent)`,
      }}
      role="group"
      aria-label="Alternar visualização"
    >
      {modes.map((mode) => {
        const isActive = value === mode.value;
        const Icon = mode.icon;

        return (
          <motion.button
            key={mode.value}
            whileHover={!disabled ? { scale: 1.05 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
            onClick={() => !disabled && onChange(mode.value)}
            disabled={disabled}
            className={cn(
              "relative p-2.5 rounded-lg transition-all",
              !disabled && "cursor-pointer",
              disabled && "cursor-not-allowed",
            )}
            style={{
              transition: semanticTokens.transition.fast,
            }}
            aria-label={mode.label}
            aria-pressed={isActive}
          >
            {/* Active background */}
            {isActive && (
              <motion.div
                layoutId="view-toggle-active"
                className="absolute inset-0 rounded-lg shadow-lg"
                style={{
                  background: `linear-gradient(to right, ${semanticTokens.color.action.primary}, ${semanticTokens.color.action.accent})`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}

            <Icon
              className={cn("relative h-4 w-4 transition-colors", isActive ? "text-white" : "")}
              style={{
                color: isActive ? "white" : semanticTokens.color.text.secondary,
                transition: semanticTokens.transition.fast,
              }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
