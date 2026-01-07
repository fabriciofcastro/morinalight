"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { semanticTokens } from "../../theme/semantic-tokens";
import { Button } from "../button";

export interface BulkActionsBarProps {
  /** Número de itens selecionados */
  selectedCount: number;
  /** Ações disponíveis */
  actions: ReactNode;
  /** Callback ao desmarcar todos */
  onClearSelection?: () => void;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * BulkActionsBar - Barra de ações em lote
 *
 * @example
 * ```tsx
 * <BulkActionsBar
 *   selectedCount={5}
 *   onClearSelection={() => setSelected(new Set())}
 *   actions={
 *     <>
 *       <Button variant="ghost" onClick={handleExport}>
 *         <Download className="h-4 w-4 mr-2" />
 *         Exportar
 *       </Button>
 *       <Button variant="destructive" onClick={handleDelete}>
 *         <Trash2 className="h-4 w-4 mr-2" />
 *         Excluir
 *       </Button>
 *     </>
 *   }
 * />
 * ```
 */
export function BulkActionsBar({
  selectedCount,
  actions,
  onClearSelection,
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: parseFloat(designTokens.duration.fast) / 1000,
      }}
      className={cn(
        "p-4 rounded-lg border backdrop-blur-sm",
        "flex items-center justify-between",
        className,
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${semanticTokens.color.action.primary} 10%, transparent)`,
        borderColor: `color-mix(in srgb, ${semanticTokens.color.action.primary} 30%, transparent)`,
      }}
    >
      {/* Contador */}
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5" style={{ color: semanticTokens.color.action.primary }} />
        <span
          className="text-sm font-medium"
          style={{
            color: `color-mix(in srgb, ${semanticTokens.color.text.primary} 90%, transparent)`,
            fontFamily: semanticTokens.typography.fontFamily.sans,
            fontSize: semanticTokens.typography.fontSize.sm,
          }}
        >
          {selectedCount} {selectedCount === 1 ? "item selecionado" : "itens selecionados"}
        </span>
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        {onClearSelection && (
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Desmarcar
          </Button>
        )}
        {actions}
      </div>
    </motion.div>
  );
}
