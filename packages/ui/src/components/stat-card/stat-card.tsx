"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { semanticTokens } from "../../theme/semantic-tokens";
import type { StatCardProps, StatVariant } from "./stat-card.types";

/**
 * Obtém os estilos de variante baseados nos tokens do tema
 */
function getVariantStyles(variant: StatVariant) {
  const variantMap = {
    primary: {
      bg: semanticTokens.color.action.primary,
      bgHover: semanticTokens.color.action.primaryHover,
      text: semanticTokens.color.action.primary,
      border: semanticTokens.color.action.primary,
      glow: semanticTokens.shadow.glow.primary,
    },
    success: {
      bg: semanticTokens.color.feedback.success,
      bgHover: semanticTokens.color.feedback.success,
      text: semanticTokens.color.feedback.success,
      border: semanticTokens.color.feedback.success,
      glow: semanticTokens.shadow.glow.success,
    },
    warning: {
      bg: "#f59e0b", // semanticTokens não tem warning, usando fallback
      bgHover: "#d97706",
      text: "#f59e0b",
      border: "#f59e0b",
      glow: "0 0 20px rgba(245, 158, 11, 0.4)",
    },
    danger: {
      bg: semanticTokens.color.feedback.error,
      bgHover: semanticTokens.color.feedback.error,
      text: semanticTokens.color.feedback.error,
      border: semanticTokens.color.feedback.error,
      glow: semanticTokens.shadow.glow.error,
    },
    info: {
      bg: semanticTokens.color.feedback.info,
      bgHover: semanticTokens.color.feedback.info,
      text: semanticTokens.color.feedback.info,
      border: semanticTokens.color.feedback.info,
      glow: semanticTokens.shadow.glow.primary,
    },
    secondary: {
      bg: semanticTokens.color.action.secondary,
      bgHover: semanticTokens.color.action.secondaryHover,
      text: semanticTokens.color.action.secondary,
      border: semanticTokens.color.action.secondary,
      glow: "0 0 20px rgba(168, 85, 247, 0.4)",
    },
  };

  return variantMap[variant];
}

/**
 * StatCard - Card de estatística com tema integrado
 *
 * @example
 * ```tsx
 * <StatCard
 *   icon={Building2}
 *   label="Total"
 *   value={100}
 *   variant="primary"
 *   subtitle="Fornecedores cadastrados"
 * />
 * ```
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  variant,
  subtitle,
  className,
  onClick,
}: StatCardProps) {
  const styles = getVariantStyles(variant);
  const isClickable = !!onClick;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: parseFloat(designTokens.duration.base) / 1000,
        ease: designTokens.easing.standard.split("(")[1]?.split(")")[0]?.split(",").map(Number) || [
          0.4, 0, 0.2, 1,
        ],
      }}
      onClick={onClick}
      className={cn(
        "group relative",
        "p-6 rounded-lg",
        "border backdrop-blur-sm",
        "transition-all",
        isClickable && "cursor-pointer hover:scale-[1.02]",
        className,
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${styles.bg} 10%, transparent)`,
        borderColor: `color-mix(in srgb, ${styles.border} 20%, transparent)`,
        transition: semanticTokens.transition.base,
      }}
      whileHover={isClickable ? { y: -4 } : undefined}
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 blur transition-opacity pointer-events-none"
        style={{
          background: `linear-gradient(to bottom right, color-mix(in srgb, ${styles.bg} 10%, transparent), transparent)`,
          transition: semanticTokens.transition.slow,
        }}
      />

      <div className="relative flex items-center justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-4 w-4" style={{ color: styles.text }} />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{
                color: `color-mix(in srgb, ${styles.text} 70%, transparent)`,
                fontFamily: semanticTokens.typography.fontFamily.sans,
                fontSize: semanticTokens.typography.fontSize.xs,
              }}
            >
              {label}
            </span>
          </div>
          <p
            className="text-3xl font-bold"
            style={{
              color: styles.text,
              fontFamily: semanticTokens.typography.fontFamily.display,
              fontSize: semanticTokens.typography.fontSize["3xl"],
              lineHeight: semanticTokens.typography.lineHeight.tight,
            }}
          >
            {value}
          </p>
          {subtitle && (
            <div
              className="flex items-center gap-1 text-xs mt-1"
              style={{
                color: `color-mix(in srgb, ${styles.text} 60%, transparent)`,
                fontSize: semanticTokens.typography.fontSize.xs,
              }}
            >
              <span>{subtitle}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
