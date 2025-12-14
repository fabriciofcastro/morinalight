"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AppBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const particles = Array.from({ length: 6 }).map((_, i) => {
    const t = (Math.sin((i + 1) * 999) + 1) / 2; // 0..1 (determinístico)
    return {
      id: i,
      left: `${(i * 17) % 100}%`,
      top: `${(i * 23) % 100}%`,
      xDrift: t * 20 - 10,
    };
  });

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg)] via-[color-mix(in_oklab,var(--bg)_95%,var(--surface)_5%)] to-[var(--bg)]" />

      {/* Animated gradients suaves */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,color-mix(in_oklab,var(--primary)_6%,transparent)_0%,transparent_60%)]"
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,color-mix(in_oklab,var(--secondary)_5%,transparent)_0%,transparent_60%)]"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,color-mix(in_oklab,var(--accent)_4%,transparent)_0%,transparent_70%)]"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Grid pattern sutil e animado */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in_oklab,var(--primary)_100%,transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in_oklab,var(--primary)_100%,transparent) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
        animate={{
          backgroundPosition: ["0 0", "40px 40px"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Partículas flutuantes leves */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute h-1 w-1 rounded-full bg-[var(--primary)] opacity-20"
          style={{
            left: p.left,
            top: p.top,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, p.xDrift, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8 + p.id * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.id * 0.5,
          }}
        />
      ))}

      {/* Linhas de conexão sutis */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.02]">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.line
            key={i}
            x1={`${20 + i * 30}%`}
            y1="0%"
            x2={`${30 + i * 20}%`}
            y2="100%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 10 + i * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </svg>

      {/* Overlay final para reduzir intensidade */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--bg)_100%)]" />
    </div>
  );
}
