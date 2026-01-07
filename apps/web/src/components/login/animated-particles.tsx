"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
};

// Função determinística baseada no índice
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function AnimatedParticles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const particles = useMemo<Particle[]>(() => {
    const count = 80;
    const colors = [
      "hsl(var(--primary) / 0.6)",
      "hsl(var(--secondary) / 0.5)",
      "hsl(var(--accent) / 0.45)",
      "hsl(var(--primary) / 0.4)",
    ];

    return Array.from({ length: count }, (_, i) => {
      const seed = i * 0.1;
      return {
        id: i,
        x: seededRandom(seed) * 100,
        y: seededRandom(seed + 1) * 100,
        size: 3 + seededRandom(seed + 2) * 6,
        duration: 12 + seededRandom(seed + 3) * 18,
        delay: seededRandom(seed + 4) * 5,
        color: colors[Math.floor(seededRandom(seed + 5) * colors.length)]!,
      };
    });
  }, []);

  // Não renderizar no servidor para evitar problemas de hidratação
  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full blur-sm"
          style={{
            left: `${particle.x.toFixed(2)}%`,
            top: `${particle.y.toFixed(2)}%`,
            width: `${particle.size.toFixed(2)}px`,
            height: `${particle.size.toFixed(2)}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${(particle.size * 2).toFixed(2)}px ${particle.color}`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 30, 0],
            scale: [1, 1.4, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
