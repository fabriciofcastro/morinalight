"use client";

import { motion, useInView } from "framer-motion";
import type { PropsWithChildren } from "react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

type BlueprintRevealProps = PropsWithChildren<{
  delay?: number;
  className?: string;
  once?: boolean;
}>;

export function BlueprintReveal({
  children,
  delay = 0,
  className,
  once = true,
}: BlueprintRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    margin: "-15% 0px",
  });

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      initial={{ opacity: 0, y: 24 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } }
          : { opacity: 0, y: 24 }
      }
    >
      {children}
    </motion.div>
  );
}


