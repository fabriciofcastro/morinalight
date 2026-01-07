"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import type { DataGridItemProps } from "./data-grid.types";

/**
 * DataGridItem - Wrapper animado para itens do grid
 */
export function DataGridItem({ children, animationDelay = 0, className }: DataGridItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: parseFloat(designTokens.duration.fast) / 1000,
        delay: animationDelay,
        ease: designTokens.easing.easeOut.split("(")[1]?.split(")")[0]?.split(",").map(Number) || [
          0, 0, 0.2, 1,
        ],
      }}
      className={cn("h-full", className)}
    >
      {children}
    </motion.div>
  );
}
