"use client";

import { ReactNode, useState } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";

interface TooltipProps {
  content: string | ReactNode;
  children?: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  iconOnly?: boolean;
}

export function Tooltip({ content, children, side = "top", className, iconOnly = false }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-white/20",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-white/20",
    left: "left-full top-1/2 -translate-y-1/2 border-l-white/20",
    right: "right-full top-1/2 -translate-y-1/2 border-r-white/20",
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      {iconOnly ? (
        <HelpCircle className="h-4 w-4 text-zinc-400 hover:text-zinc-300 transition-colors cursor-help" />
      ) : (
        children
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: side === "top" ? 5 : side === "bottom" ? -5 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 px-3 py-2 text-xs text-white bg-[#1a1a1a] border border-white/20 rounded-lg shadow-xl max-w-xs",
              sideClasses[side],
            )}
          >
            <div className={cn("absolute w-0 h-0 border-4", arrowClasses[side])} />
            {typeof content === "string" ? (
              <p className="leading-relaxed">{content}</p>
            ) : (
              content
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}










