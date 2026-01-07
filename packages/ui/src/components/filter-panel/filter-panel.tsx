"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { semanticTokens } from "../../theme/semantic-tokens";
import { Button } from "../button";
import type { FilterPanelProps } from "./filter-panel.types";

/**
 * FilterPanel - Panel expansível de filtros avançados
 *
 * @example
 * ```tsx
 * const [showFilters, setShowFilters] = useState(false);
 *
 * <FilterPanel
 *   isOpen={showFilters}
 *   onToggle={() => setShowFilters(!showFilters)}
 *   onClear={() => {
 *     setDataInicio("");
 *     setDataFim("");
 *   }}
 *   onApply={() => loadData()}
 * >
 *   <FormInput label="Data Início" type="date" />
 *   <FormInput label="Data Fim" type="date" />
 *   <FormSelect label="Status">
 *     <option value="">Todos</option>
 *     <option value="ativo">Ativo</option>
 *   </FormSelect>
 * </FilterPanel>
 * ```
 */
export function FilterPanel({
  isOpen,
  onToggle,
  onClear,
  onApply,
  children,
  title = "Filtros Avançados",
  className,
}: FilterPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            duration: parseFloat(designTokens.duration.base) / 1000,
            ease: designTokens.easing.easeInOut
              .split("(")[1]
              ?.split(")")[0]
              ?.split(",")
              .map(Number) || [0.4, 0, 0.2, 1],
          }}
          className={cn("overflow-hidden", className)}
        >
          <div
            className="p-4 rounded-lg border backdrop-blur-sm"
            style={{
              backgroundColor: semanticTokens.color.background.glass,
              borderColor: semanticTokens.color.border.default,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between mb-4"
              style={{
                paddingBottom: semanticTokens.spacing.component.padding.sm,
              }}
            >
              <h4
                className="text-sm font-semibold flex items-center gap-2"
                style={{
                  color: semanticTokens.color.text.primary,
                  fontFamily: semanticTokens.typography.fontFamily.sans,
                  fontSize: semanticTokens.typography.fontSize.sm,
                }}
              >
                <Filter className="h-4 w-4" />
                {title}
              </h4>
              <button
                onClick={onToggle}
                className="hover:opacity-70 transition-opacity"
                style={{
                  color: semanticTokens.color.text.secondary,
                  transition: semanticTokens.transition.fast,
                }}
                aria-label="Fechar filtros"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content - Grid responsivo */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              style={{
                gap: semanticTokens.spacing.component.gap.md,
              }}
            >
              {children}
            </div>

            {/* Footer com ações */}
            {(onClear || onApply) && (
              <div
                className="flex justify-end gap-2 pt-4"
                style={{
                  marginTop: semanticTokens.spacing.component.padding.md,
                  borderTop: `1px solid ${semanticTokens.color.border.subtle}`,
                }}
              >
                {onClear && (
                  <Button variant="ghost" onClick={onClear} size="sm">
                    Limpar
                  </Button>
                )}
                {onApply && (
                  <Button variant="default" onClick={onApply} size="sm">
                    Aplicar
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
