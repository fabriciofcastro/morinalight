"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { semanticTokens } from "../../theme/semantic-tokens";
import type { SearchBarProps } from "./search-bar.types";

/**
 * SearchBar - Barra de busca com tema integrado
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState("");
 *
 * <SearchBar
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Buscar fornecedores..."
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Com conteúdo adicional à direita
 * <SearchBar
 *   value={search}
 *   onChange={setSearch}
 *   rightContent={
 *     <Button variant="ghost" size="sm">
 *       Filtros
 *     </Button>
 *   }
 * />
 * ```
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  icon: Icon = Search,
  showClear = true,
  onClear,
  loading = false,
  className,
  rightContent,
  disabled = false,
}: SearchBarProps) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative flex-1 w-full max-w-md group", className)}>
      {/* Glow effect on focus */}
      <motion.div
        className="absolute -inset-0.5 rounded-lg opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity pointer-events-none"
        style={{
          background: `linear-gradient(to right, color-mix(in srgb, ${semanticTokens.color.action.primary} 30%, transparent), color-mix(in srgb, ${semanticTokens.color.action.accent} 30%, transparent))`,
          transition: semanticTokens.transition.base,
        }}
      />

      <div
        className={cn(
          "relative flex items-center gap-3 rounded-lg border backdrop-blur-xl",
          "focus-within:border-opacity-50 hover:border-opacity-30 transition-all",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        style={{
          padding: semanticTokens.spacing.component.padding.md,
          borderColor: semanticTokens.color.border.default,
          backgroundColor: `color-mix(in srgb, ${semanticTokens.color.background.glass} 80%, transparent)`,
          transition: semanticTokens.transition.base,
        }}
      >
        <Icon
          className={cn(
            "h-5 w-5 transition-colors flex-shrink-0",
            !disabled && "group-focus-within:text-blue-400",
          )}
          style={{
            color: semanticTokens.color.text.tertiary,
            transition: semanticTokens.transition.fast,
          }}
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent border-none outline-none text-sm",
            "placeholder:opacity-30",
          )}
          style={{
            color: semanticTokens.color.text.primary,
            fontFamily: semanticTokens.typography.fontFamily.sans,
            fontSize: semanticTokens.typography.fontSize.sm,
          }}
        />

        {/* Loading spinner */}
        {loading && (
          <div className="flex-shrink-0">
            <div
              className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
              style={{
                borderColor: semanticTokens.color.action.primary,
              }}
            />
          </div>
        )}

        {/* Clear button */}
        <AnimatePresence>
          {showClear && value && !loading && !disabled && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: parseFloat(designTokens.duration.fast) / 1000 }}
              onClick={handleClear}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
              style={{
                color: semanticTokens.color.text.secondary,
                transition: semanticTokens.transition.fast,
              }}
              type="button"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right content */}
        {rightContent && (
          <div className="flex-shrink-0 flex items-center gap-2">{rightContent}</div>
        )}
      </div>
    </div>
  );
}
