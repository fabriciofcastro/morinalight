"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Orb = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function FloatingOrbs() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const orbs = useMemo<Orb[]>(() => {
    const count = 12;
    const colors = [
      "hsl(var(--primary) / 0.3)",
      "hsl(var(--secondary) / 0.25)",
      "hsl(var(--accent) / 0.28)",
    ];

    return Array.from({ length: count }, (_, i) => {
      const seed = i * 0.15;
      return {
        id: i,
        x: seededRandom(seed) * 100,
        y: seededRandom(seed + 1) * 100,
        size: 100 + seededRandom(seed + 2) * 150,
        duration: 18 + seededRandom(seed + 3) * 12,
        delay: seededRandom(seed + 4) * 3,
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
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            left: `${orb.x.toFixed(2)}%`,
            top: `${orb.y.toFixed(2)}%`,
            width: `${orb.size.toFixed(2)}px`,
            height: `${orb.size.toFixed(2)}px`,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 40, 0],
            scale: [1, 1.5, 0.8, 1],
            opacity: [0.4, 0.8, 0.5, 0.4],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
