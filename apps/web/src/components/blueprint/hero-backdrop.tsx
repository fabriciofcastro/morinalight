"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

type HeroBackdropProps = {
  className?: string;
};

export function HeroBackdrop({ className }: HeroBackdropProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={className}>
      {/* Background animado principal */}
      <div className="absolute inset-0 bg-animated" aria-hidden="true" />

      {/* Overlay de profundidade com gradientes radiais */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.12) 0%, transparent 50%)",
        }}
        animate={
          reduceMotion
            ? false
            : {
                scale: [0.95, 1.05, 1],
                opacity: [0.6, 0.85, 0.7],
              }
        }
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 80% 70%, hsl(var(--secondary) / 0.08) 0%, transparent 50%)",
        }}
        animate={
          reduceMotion
            ? false
            : {
                scale: [1, 0.9, 1.05],
                opacity: [0.4, 0.7, 0.5],
              }
        }
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--accent) / 0.06) 0%, transparent 60%)",
        }}
        animate={
          reduceMotion
            ? false
            : {
                scale: [1.05, 0.95, 1],
                opacity: [0.3, 0.6, 0.4],
              }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid pattern sutil */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40"
        aria-hidden="true"
      />

      {/* Gradiente base */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--bg)) 0%, hsl(230 25% 12%) 45%, hsl(240 30% 8%) 100%)",
        }}
      />

      <AnimatedRibbons reduceMotion={reduceMotion} />
      <AnimatedGrid reduceMotion={reduceMotion} />
      <FloatingParticles reduceMotion={reduceMotion} />
    </div>
  );
}

type AnimatedRibbonsProps = {
  reduceMotion: boolean;
};

function AnimatedRibbons({ reduceMotion }: AnimatedRibbonsProps) {
  return (
    <>
      <motion.span
        aria-hidden
        className="absolute left-1/3 top-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, hsla(var(--primary) / 0.45) 0%, transparent 65%)",
        }}
        animate={
          reduceMotion
            ? false
            : {
                scale: [0.9, 1.1, 1],
                opacity: [0.4, 0.75, 0.5],
              }
        }
        transition={{ duration: 20, repeat: Infinity }}
      />

      <motion.span
        aria-hidden
        className="absolute right-[22%] top-[18%] h-[520px] w-[360px] rounded-[46%] blur-[120px]"
        style={{
          background:
            "linear-gradient(160deg, hsla(var(--secondary) / 0.4) 0%, transparent 70%)",
        }}
        animate={
          reduceMotion
            ? false
            : {
                rotate: [-6, 4, -3],
                scale: [1.05, 0.95, 1.08],
                opacity: [0.25, 0.4, 0.3],
              }
        }
        transition={{ duration: 18, repeat: Infinity }}
      />

      <motion.span
        aria-hidden
        className="absolute bottom-[-15%] right-[18%] h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, hsla(var(--accent) / 0.38) 0%, transparent 70%)",
        }}
        animate={
          reduceMotion
            ? false
            : {
                scale: [0.8, 1.05, 0.95],
                rotate: [-8, 6, -4],
              }
        }
        transition={{ duration: 24, repeat: Infinity }}
      />
    </>
  );
}

type AnimatedGridProps = {
  reduceMotion: boolean;
};

function AnimatedGrid({ reduceMotion }: AnimatedGridProps) {
  const columns = Array.from({ length: 12 }, (_, column) => `grid-column-${column}`);

  return (
    <div className="absolute inset-0 opacity-[0.08]">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-hsla(var(--primary) / 0.14)" />
      <motion.div
        className="absolute inset-0 grid h-full w-full grid-cols-12 gap-[var(--space-4)]"
        animate={reduceMotion ? false : { opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        {columns.map((column) => (
          <div
            key={column}
            className="border-l border-dashed border-[color-mix(in oklab,var(--border-color) 45%,transparent)]"
          />
        ))}
      </motion.div>
    </div>
  );
}

type FloatingParticlesProps = {
  reduceMotion: boolean;
};

// Gerador determinístico baseado em seed
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function FloatingParticles({ reduceMotion }: FloatingParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const seed = i * 0.618; // Golden ratio para distribuição
      return {
        id: i,
        size: seededRandom(seed) * 4 + 2,
        duration: seededRandom(seed + 1) * 20 + 15,
        delay: seededRandom(seed + 2) * 5,
        x: seededRandom(seed + 3) * 100,
        y: seededRandom(seed + 4) * 100,
        xOffset: seededRandom(seed + 5) * 20 - 10,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-[hsl(var(--primary))] opacity-20 blur-[1px]"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={
            reduceMotion
              ? false
              : {
                  y: [0, -30, 0],
                  x: [0, particle.xOffset, 0],
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                }
          }
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


