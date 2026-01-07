"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { semanticTokens } from "../../theme/semantic-tokens";
import type { EmptyStateProps } from "./empty-state-enhanced.types";

/**
 * EmptyState - Estado vazio com animação
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={FileText}
 *   title="Nenhuma ficha encontrada"
 *   description="Tente ajustar os filtros ou criar uma nova ficha"
 *   actions={
 *     <Button onClick={() => router.push('/fichas-custo/new')}>
 *       <Plus className="mr-2 h-4 w-4" />
 *       Nova Ficha
 *     </Button>
 *   }
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  animateIcon = true,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: parseFloat(designTokens.duration.base) / 1000,
        ease: designTokens.easing.easeOut.split("(")[1]?.split(")")[0]?.split(",").map(Number) || [
          0, 0, 0.2, 1,
        ],
      }}
      className={cn("p-16 text-center rounded-2xl border backdrop-blur-xl", className)}
      style={{
        borderColor: semanticTokens.color.border.subtle,
        background: `linear-gradient(to bottom right, color-mix(in srgb, ${semanticTokens.color.background.glass} 50%, transparent), transparent)`,
      }}
    >
      {/* Ícone animado */}
      <motion.div
        animate={animateIcon ? { y: [0, -10, 0] } : undefined}
        transition={
          animateIcon
            ? {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : undefined
        }
        className="flex justify-center mb-6"
      >
        <Icon
          className="h-24 w-24"
          style={{
            color: `color-mix(in srgb, ${semanticTokens.color.text.primary} 20%, transparent)`,
          }}
        />
      </motion.div>

      {/* Título */}
      <h3
        className="text-2xl font-bold mb-2"
        style={{
          color: `color-mix(in srgb, ${semanticTokens.color.text.primary} 80%, transparent)`,
          fontFamily: semanticTokens.typography.fontFamily.display,
          fontSize: semanticTokens.typography.fontSize["2xl"],
        }}
      >
        {title}
      </h3>

      {/* Descrição */}
      {description && (
        <p
          className="mb-6"
          style={{
            color: semanticTokens.color.text.secondary,
            fontFamily: semanticTokens.typography.fontFamily.sans,
            fontSize: semanticTokens.typography.fontSize.base,
          }}
        >
          {description}
        </p>
      )}

      {/* Ações */}
      {actions && <div className="flex justify-center gap-3">{actions}</div>}
    </motion.div>
  );
}
