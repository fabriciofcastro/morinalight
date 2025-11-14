"use client";

import { motion } from "framer-motion";

export function AnimatedWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-60" aria-hidden="true">
      <motion.div
        className="absolute -left-1/4 top-1/4 h-[800px] w-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-1/4 h-[700px] w-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--secondary) / 0.22) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -30, 30, 0],
          scale: [1, 1.4, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}

