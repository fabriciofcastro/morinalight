"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Background fixo animado avançado com blur e glass effects
 * Estilo sofisticado e moderno para todo o sistema
 */
export function AppBackgroundAdvanced() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient com animação suave */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--bg))] via-[color-mix(in_oklab,hsl(var(--bg))_95%,hsl(var(--surface))_5%)] to-[hsl(var(--bg))]" />

      {/* Camadas animadas de gradientes radiais */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,color-mix(in_oklab,hsl(var(--primary))_8%,transparent)_0%,transparent_60%)]"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.15, 1],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,color-mix(in_oklab,hsl(var(--secondary))_6%,transparent)_0%,transparent_60%)]"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.2, 1],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,color-mix(in_oklab,hsl(var(--accent))_5%,transparent)_0%,transparent_70%)]"
        animate={{
          opacity: [0.15, 0.4, 0.15],
          scale: [1, 1.25, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Grid pattern sutil e animado */}
      <motion.div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in_oklab,hsl(var(--primary))_100%,transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in_oklab,hsl(var(--primary))_100%,transparent) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
        animate={{
          backgroundPosition: ["0 0", "64px 64px"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Partículas flutuantes avançadas */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] opacity-30"
          style={{
            left: `${(i * 13) % 100}%`,
            top: `${(i * 19) % 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(i) * 30, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 10 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Orbs flutuantes grandes com blur */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute h-32 w-32 rounded-full blur-[60px] opacity-20"
          style={{
            background: `radial-gradient(circle, hsl(var(--${i % 2 === 0 ? "primary" : "secondary"})) 0%, transparent 70%)`,
            left: `${20 + i * 25}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            x: [0, Math.sin(i) * 50, 0],
            y: [0, Math.cos(i) * 40, 0],
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 20 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}

      {/* Linhas de conexão sutis animadas */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.03]">
        <defs>
          <linearGradient id="lineGradientPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.line
            key={`line-${i}`}
            x1={`${15 + i * 20}%`}
            y1="0%"
            x2={`${25 + i * 15}%`}
            y2="100%"
            stroke="url(#lineGradientPrimary)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{
              duration: 12 + i * 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </svg>

      {/* Glass overlay com blur para profundidade */}
      <div className="absolute inset-0 backdrop-blur-[2px] opacity-50 pointer-events-none" />
      
      {/* Overlay final gradiente para reduzir intensidade nas bordas */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,hsl(var(--bg))/0.3_100%),linear-gradient(to_top,transparent_0%,hsl(var(--bg))/0.3_100%)]" />
    </div>
  );
}

