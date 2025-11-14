"use client";

import { motion } from "framer-motion";

export function GlowingGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Linhas brilhantes animadas */}
      <motion.div
        className="absolute left-0 top-0 h-full w-[1px]"
        style={{
          background: "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.4), transparent)",
          boxShadow: "0 0 20px hsl(var(--primary) / 0.3)",
        }}
        animate={{
          x: [0, 100, 0],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-0 top-0 h-full w-[1px]"
        style={{
          background: "linear-gradient(to bottom, transparent, hsl(var(--secondary) / 0.4), transparent)",
          boxShadow: "0 0 20px hsl(var(--secondary) / 0.3)",
        }}
        animate={{
          x: [0, -100, 0],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute left-0 top-0 h-[1px] w-full"
        style={{
          background: "linear-gradient(to right, transparent, hsl(var(--accent) / 0.3), transparent)",
          boxShadow: "0 0 15px hsl(var(--accent) / 0.3)",
        }}
        animate={{
          y: [0, 100, 0],
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </div>
  );
}

