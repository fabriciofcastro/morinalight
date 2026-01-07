"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Blob = {
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

export function MorphingBlobs() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const blobs = useMemo<Blob[]>(() => {
    const count = 6;
    const colors = [
      "hsl(var(--primary) / 0.15)",
      "hsl(var(--secondary) / 0.12)",
      "hsl(var(--accent) / 0.18)",
    ];

    return Array.from({ length: count }, (_, i) => {
      const seed = i * 0.2;
      return {
        id: i,
        x: seededRandom(seed) * 100,
        y: seededRandom(seed + 1) * 100,
        size: 200 + seededRandom(seed + 2) * 300,
        duration: 25 + seededRandom(seed + 3) * 20,
        delay: seededRandom(seed + 4) * 5,
        color: colors[Math.floor(seededRandom(seed + 5) * colors.length)]!,
      };
    });
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${blob.x.toFixed(2)}%`,
            top: `${blob.y.toFixed(2)}%`,
            width: `${blob.size.toFixed(2)}px`,
            height: `${blob.size.toFixed(2)}px`,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.4, 0.8, 1],
            opacity: [0.2, 0.5, 0.3, 0.2],
            borderRadius: [
              "30% 70% 70% 30% / 30% 30% 70% 70%",
              "70% 30% 30% 70% / 70% 70% 30% 30%",
              "30% 70% 70% 30% / 30% 30% 70% 70%",
            ],
          }}
          transition={{
            duration: blob.duration,
            delay: blob.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
