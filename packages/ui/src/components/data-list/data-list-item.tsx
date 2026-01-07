"use client";

import { motion } from "framer-motion";
import { isValidElement } from "react";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { semanticTokens } from "../../theme/semantic-tokens";
import type { DataListItemProps } from "./data-list.types";

/**
 * DataListItem - Item de lista com layout padronizado
 *
 * @example
 * ```tsx
 * <DataListItem
 *   icon={<User className="h-5 w-5" />}
 *   title="João Silva"
 *   description="joao@email.com"
 *   meta={<Badge>Ativo</Badge>}
 *   actions={<Button variant="ghost">Editar</Button>}
 *   onClick={() => openDetails()}
 * />
 * ```
 */
export function DataListItem({
  children,
  icon,
  title,
  description,
  actions,
  meta,
  onClick,
  selected,
  className,
}: DataListItemProps) {
  // Se children for passado, renderiza conteúdo customizado
  if (children) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "p-4 rounded-lg transition-colors",
          onClick && "cursor-pointer hover:bg-white/5",
          selected && "bg-primary/5 ring-1 ring-primary/20",
          className,
        )}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      transition={{ duration: parseFloat(designTokens.duration.fast) / 1000 }}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-lg",
        "border border-transparent",
        onClick && "cursor-pointer",
        selected && "bg-primary/5 border-primary/20",
        !selected && "hover:bg-white/5 hover:border-white/10",
        className,
      )}
      onClick={onClick}
    >
      {/* Ícone / Avatar */}
      {icon && (
        <div
          className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg backdrop-blur-sm"
          style={{
            backgroundColor: `color-mix(in srgb, ${semanticTokens.color.background.glass} 50%, transparent)`,
            border: `1px solid ${semanticTokens.color.border.subtle}`,
          }}
        >
          {isValidElement(icon) ? icon : null}
        </div>
      )}

      {/* Info Principal */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          {title && (
            <h4
              className="font-medium truncate"
              style={{ color: semanticTokens.color.text.primary }}
            >
              {title}
            </h4>
          )}
          {meta}
        </div>

        {description && (
          <p className="text-sm truncate" style={{ color: semanticTokens.color.text.secondary }}>
            {description}
          </p>
        )}
      </div>

      {/* Ações */}
      {actions && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
