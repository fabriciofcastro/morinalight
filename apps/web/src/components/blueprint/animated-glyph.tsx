"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type AnimatedGlyphVariant = "polaris" | "sentinel" | "flux";

export type AnimatedGlyphProps = {
  /**
   * Dados Lottie para animações importadas via JSON.
   * Quando fornecido e `prefers-reduced-motion` não estiver ativo,
   * a animação Lottie tem prioridade sobre os modos procedurais.
   */
  animationData?: object;
  /**
   * Variante procedural para quando não houver asset Lottie especificado.
   */
  variant?: AnimatedGlyphVariant;
  /**
   * Cor de destaque em HSL ou qualquer valor CSS válido.
   * Por padrão utiliza `--primary-color`.
   */
  accentColor?: string;
  /**
   * Cor do brilho/halo de fundo.
   */
  glowColor?: string;
  /**
   * Tamanho em pixels.
   */
  size?: number;
  /**
   * Quando verdadeiro, pausa todas as animações.
   */
  paused?: boolean;
  className?: string;
};

const DEFAULT_SIZE = 140;

export function AnimatedGlyph({
  animationData,
  variant = "polaris",
  accentColor = "hsl(var(--primary))",
  glowColor = "hsl(var(--accent))",
  size = DEFAULT_SIZE,
  paused = false,
  className,
}: AnimatedGlyphProps) {
  const shouldReduceMotion = useReducedMotion();
  const [LottiePlayer, setLottiePlayer] = useState<null | typeof import("lottie-react").default>(
    null,
  );

  useEffect(() => {
    if (!animationData || shouldReduceMotion || typeof window === "undefined") {
      return;
    }

    let active = true;

    import("lottie-react")
      .then((module) => {
        if (active) {
          setLottiePlayer(() => module.default);
        }
      })
      .catch(() => {
        if (active) {
          setLottiePlayer(null);
        }
      });

    return () => {
      active = false;
    };
  }, [animationData, shouldReduceMotion]);

  const resolvedSize = Math.max(96, size);

  if (animationData && !shouldReduceMotion && !paused && LottiePlayer) {
    const Player = LottiePlayer;

    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full bg-transparent",
          className,
        )}
        style={{ width: resolvedSize, height: resolvedSize }}
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${glowColor}40, transparent 65%)`,
            opacity: paused ? 0.45 : 0.8,
            transition: "opacity 0.4s ease",
          }}
        />
        <Player
          animationData={animationData}
          loop
          autoplay
          className="relative z-10"
          style={{ width: resolvedSize, height: resolvedSize }}
        />
      </div>
    );
  }

  return (
    <ProceduralGlyph
      variant={variant}
      accentColor={accentColor}
      glowColor={glowColor}
      size={resolvedSize}
      paused={paused || shouldReduceMotion}
      className={className}
    />
  );
}

type ProceduralGlyphProps = Required<
  Pick<AnimatedGlyphProps, "variant" | "accentColor" | "glowColor" | "size" | "paused">
> & {
  className?: string;
};

function ProceduralGlyph({
  variant,
  accentColor,
  glowColor,
  size,
  paused,
  className,
}: ProceduralGlyphProps) {
  const sharedProps = {
    accentColor,
    glowColor,
    paused,
  };

  return (
    <div
      className={cn(
        "group relative flex items-center justify-center overflow-visible rounded-full",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-full blur-[80px]"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${glowColor}33, transparent 70%)`,
          opacity: paused ? 0.55 : 0.9,
          transition: "opacity 0.6s ease",
        }}
      />

      {variant === "sentinel" ? (
        <SentinelGlyph {...sharedProps} size={size} />
      ) : variant === "flux" ? (
        <FluxGlyph {...sharedProps} size={size} />
      ) : (
        <PolarisGlyph {...sharedProps} size={size} />
      )}
    </div>
  );
}

type GlyphComponentProps = {
  accentColor: string;
  glowColor: string;
  size: number;
  paused: boolean;
};

function PolarisGlyph({ accentColor, glowColor, size, paused }: GlyphComponentProps) {
  return (
    <div className="relative flex items-center justify-center">
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full blur-2xl"
        animate={
          paused
            ? { scale: 1, opacity: 0.45 }
            : {
                scale: [0.92, 1.04, 0.98],
                opacity: [0.55, 0.8, 0.6],
              }
        }
        transition={{ duration: 4.2, repeat: paused ? 0 : Infinity, repeatType: "mirror" }}
        style={{
          background: `radial-gradient(circle, ${glowColor}4d 0%, transparent 70%)`,
        }}
      />

      <OrbitalRings accentColor={accentColor} paused={paused} size={size} />
      <PulseCore accentColor={accentColor} paused={paused} />
      <SparkParticles accentColor={accentColor} paused={paused} />
    </div>
  );
}

function SentinelGlyph({ accentColor, glowColor, size, paused }: GlyphComponentProps) {
  const rings = [
    { radius: size * 0.28, duration: 10 },
    { radius: size * 0.38, duration: 14 },
  ];

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full border border-transparent"
        animate={
          paused
            ? { rotate: 0, opacity: 0.7 }
            : {
                rotate: 360,
                opacity: [0.7, 0.95, 0.7],
              }
        }
        transition={{ duration: 24, repeat: paused ? 0 : Infinity, ease: "linear" }}
        style={{
          background: `conic-gradient(from 180deg, transparent 0%, ${accentColor}1a 35%, transparent 60%, ${accentColor}1a 100%)`,
        }}
      />

      {rings.map((ring, index) => (
        <motion.div
          key={index}
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: ring.radius * 2,
            height: ring.radius * 2,
            border: `1px solid color-mix(in oklab, ${accentColor} 45%, transparent)`,
          }}
          animate={
            paused
              ? { rotate: 0 }
              : {
                  rotate: index % 2 === 0 ? 360 : -360,
                }
          }
          transition={{ duration: ring.duration, repeat: paused ? 0 : Infinity, ease: "linear" }}
        />
      ))}

      <motion.span
        aria-hidden
        className="absolute rounded-full blur-xl"
        animate={
          paused
            ? { scale: 1, opacity: 0.6 }
            : { scale: [0.9, 1.05, 0.95], opacity: [0.5, 0.85, 0.6] }
        }
        transition={{ duration: 6, repeat: paused ? 0 : Infinity, repeatType: "mirror" }}
        style={{
          width: size * 0.42,
          height: size * 0.42,
          background: `radial-gradient(circle, ${glowColor}55 0%, transparent 75%)`,
        }}
      />

      <PulseCore accentColor={accentColor} paused={paused} />
      <SparkParticles accentColor={accentColor} paused={paused} density={7} />
    </div>
  );
}

function FluxGlyph({ accentColor, glowColor, size, paused }: GlyphComponentProps) {
  return (
    <div className="relative flex items-center justify-center">
      <motion.span
        aria-hidden
        className="absolute rounded-[32%]"
        animate={
          paused
            ? { scale: 1, rotate: 0, opacity: 0.6 }
            : {
                scale: [0.9, 1.08, 0.96],
                rotate: [0, 3, -3, 0],
                opacity: [0.5, 0.88, 0.64],
              }
        }
        transition={{ duration: 5.6, repeat: paused ? 0 : Infinity, repeatType: "mirror" }}
        style={{
          width: size * 0.68,
          height: size * 0.68,
          background: `linear-gradient(145deg, ${glowColor}3d, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute"
        style={{
          width: size * 0.55,
          height: size * 0.55,
          borderRadius: "38% 55% 52% 42%",
          border: `1px solid color-mix(in oklab, ${accentColor} 55%, transparent)`,
        }}
        animate={
          paused
            ? { rotate: 0 }
            : {
                rotate: [0, 8, -6, 0],
              }
        }
        transition={{ duration: 6.4, repeat: paused ? 0 : Infinity }}
      />

      <motion.div
        aria-hidden
        className="absolute"
        style={{
          width: size * 0.35,
          height: size * 0.35,
          borderRadius: "50% 42% 58% 50%",
          border: `1px solid color-mix(in oklab, ${accentColor} 80%, transparent)`,
        }}
        animate={
          paused
            ? { rotate: 0 }
            : {
                rotate: [-12, 12, -6],
              }
        }
        transition={{ duration: 5.2, repeat: paused ? 0 : Infinity }}
      />

      <PulseCore accentColor={accentColor} paused={paused} />
      <SparkParticles accentColor={accentColor} paused={paused} density={10} radius={size * 0.45} />
    </div>
  );
}

type PulseCoreProps = {
  accentColor: string;
  paused: boolean;
};

function PulseCore({ accentColor, paused }: PulseCoreProps) {
  return (
    <div className="relative flex items-center justify-center">
      <motion.span
        aria-hidden
        className="absolute rounded-full"
        animate={
          paused
            ? { scale: 1, opacity: 0.4 }
            : {
                scale: [0.9, 1.08, 0.94],
                opacity: [0.35, 0.72, 0.4],
              }
        }
        transition={{ duration: 3.6, repeat: paused ? 0 : Infinity, repeatType: "mirror" }}
        style={{
          width: 58,
          height: 58,
          background: `radial-gradient(circle, ${accentColor}55 0%, transparent 70%)`,
          filter: "blur(12px)",
        }}
      />

      <motion.span
        aria-hidden
        className="relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-full border"
        animate={
          paused ? { opacity: 1, rotate: 0 } : { opacity: [0.9, 1, 0.9], rotate: [0, 8, -6, 0] }
        }
        transition={{ duration: 4.4, repeat: paused ? 0 : Infinity }}
        style={{
          borderColor: `color-mix(in oklab, ${accentColor} 70%, transparent)`,
          boxShadow: `0 0 25px ${accentColor}26`,
          background: `radial-gradient(circle at 50% 45%, ${accentColor}1a 0%, transparent 70%)`,
        }}
      >
        <span
          className="h-8 w-8 rounded-[36%]"
          style={{
            background: `radial-gradient(circle, ${accentColor}80 0%, ${accentColor}33 60%, transparent 100%)`,
            boxShadow: `0 6px 20px ${accentColor}33`,
          }}
        />
      </motion.span>
    </div>
  );
}

type SparkParticlesProps = {
  accentColor: string;
  paused: boolean;
  density?: number;
  radius?: number;
};

function SparkParticles({ accentColor, paused, density = 5, radius = 78 }: SparkParticlesProps) {
  const sparks = useMemo(
    () =>
      Array.from({ length: density }, (_, index) => ({
        delay: index * 0.2,
        angle: (index / density) * 360,
      })),
    [density],
  );

  return (
    <>
      {sparks.map((spark, index) => (
        <motion.span
          key={index}
          className="absolute block h-[6px] w-[6px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
            boxShadow: `0 0 12px ${accentColor}55`,
          }}
          animate={
            paused
              ? {
                  opacity: 0.45,
                  x: radius * Math.cos((spark.angle * Math.PI) / 180),
                  y: radius * Math.sin((spark.angle * Math.PI) / 180),
                }
              : {
                  opacity: [0.1, 1, 0.1],
                  x: [
                    radius * Math.cos((spark.angle * Math.PI) / 180),
                    radius * Math.cos(((spark.angle + 20) * Math.PI) / 180),
                    radius * Math.cos((spark.angle * Math.PI) / 180),
                  ],
                  y: [
                    radius * Math.sin((spark.angle * Math.PI) / 180),
                    radius * Math.sin(((spark.angle - 25) * Math.PI) / 180),
                    radius * Math.sin((spark.angle * Math.PI) / 180),
                  ],
                  scale: [0.7, 1.1, 0.75],
                }
          }
          transition={{
            duration: 4.4 + index * 0.2,
            repeat: paused ? 0 : Infinity,
            ease: "easeInOut",
            delay: spark.delay,
          }}
        />
      ))}
    </>
  );
}

type OrbitalRingsProps = {
  accentColor: string;
  size: number;
  paused: boolean;
};

function OrbitalRings({ accentColor, size, paused }: OrbitalRingsProps) {
  const rings = [
    { radius: size * 0.44, duration: 16, direction: 1 },
    { radius: size * 0.34, duration: 11, direction: -1 },
  ];

  return (
    <>
      {rings.map((ring, index) => (
        <motion.div
          key={index}
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: ring.radius * 2,
            height: ring.radius * 2,
            border: `1px dashed color-mix(in oklab, ${accentColor} 55%, transparent)`,
          }}
          animate={
            paused
              ? { rotate: 0, opacity: 0.6 }
              : {
                  rotate: ring.direction === 1 ? 360 : -360,
                  opacity: [0.55, 0.9, 0.6],
                }
          }
          transition={{
            duration: ring.duration,
            repeat: paused ? 0 : Infinity,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}
