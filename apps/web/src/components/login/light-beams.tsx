"use client";

import { motion } from "framer-motion";

export function LightBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Feixe de luz 1 */}
      <motion.div
        className="absolute left-0 top-0 h-full w-[2px] origin-top"
        style={{
          background: "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.5), transparent)",
          boxShadow: "0 0 30px hsl(var(--primary) / 0.7)",
        }}
        animate={{
          x: [0, 100, 0],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Feixe de luz 2 */}
      <motion.div
        className="absolute right-0 top-0 h-full w-[2px] origin-top"
        style={{
          background: "linear-gradient(to bottom, transparent, hsl(var(--secondary) / 0.5), transparent)",
          boxShadow: "0 0 30px hsl(var(--secondary) / 0.7)",
        }}
        animate={{
          x: [0, -100, 0],
          opacity: [0, 0.7, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Feixe diagonal */}
      <motion.div
        className="absolute left-1/4 top-0 h-[2px] w-[500px] origin-left rotate-45"
        style={{
          background: "linear-gradient(to right, transparent, hsl(var(--accent) / 0.4), transparent)",
          boxShadow: "0 0 25px hsl(var(--accent) / 0.6)",
        }}
        animate={{
          y: [0, 100, 0],
          opacity: [0, 0.6, 0],
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

