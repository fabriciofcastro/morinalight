"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { semanticTokens } from "../../theme/semantic-tokens";
import type { StatCardCircularProps, StatVariant } from "./stat-card.types";

/**
 * Componente de progresso circular
 */
function CircularProgress({
  value,
  max,
  color,
  size = 70,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1,
            ease: designTokens.easing.easeOut
              .split("(")[1]
              ?.split(")")[0]
              ?.split(",")
              .map(Number) || [0, 0, 0.2, 1],
          }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-2xl font-bold"
          style={{
            color,
            fontFamily: semanticTokens.typography.fontFamily.display,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/**
 * Obtém os estilos de variante
 */
function getVariantStyles(variant: StatVariant) {
  const variantMap = {
    primary: {
      bg: semanticTokens.color.action.primary,
      text: semanticTokens.color.action.primary,
      border: semanticTokens.color.action.primary,
    },
    success: {
      bg: semanticTokens.color.feedback.success,
      text: semanticTokens.color.feedback.success,
      border: semanticTokens.color.feedback.success,
    },
    warning: {
      bg: "#f59e0b",
      text: "#f59e0b",
      border: "#f59e0b",
    },
    danger: {
      bg: semanticTokens.color.feedback.error,
      text: semanticTokens.color.feedback.error,
      border: semanticTokens.color.feedback.error,
    },
    info: {
      bg: semanticTokens.color.feedback.info,
      text: semanticTokens.color.feedback.info,
      border: semanticTokens.color.feedback.info,
    },
    secondary: {
      bg: semanticTokens.color.action.secondary,
      text: semanticTokens.color.action.secondary,
      border: semanticTokens.color.action.secondary,
    },
  };

  return variantMap[variant];
}

/**
 * StatCardCircular - Card de estatística com progresso circular
 *
 * @example
 * ```tsx
 * <StatCardCircular
 *   icon={Building2}
 *   label="Ativos"
 *   value={80}
 *   maxValue={100}
 *   variant="success"
 *   showProgress
 * />
 * ```
 */
export function StatCardCircular({
  icon: Icon,
  label,
  value,
  variant,
  maxValue,
  subtitle,
  className,
  onClick,
}: StatCardCircularProps) {
  const styles = getVariantStyles(variant);
  const isClickable = !!onClick;
  const numericValue = typeof value === "number" ? value : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: parseFloat(designTokens.duration.base) / 1000,
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

        <CircularProgress value={numericValue} max={maxValue} color={styles.text} size={70} />
      </div>
    </motion.div>
  );
}
