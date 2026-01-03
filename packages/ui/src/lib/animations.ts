/**
 * Utilitários de animação para componentes
 * Facilita a aplicação de animações consistentes
 */

import { cn } from "./cn";
import type { AnimationPreset } from "../theme/animation-tokens";
import { getAnimationClasses } from "../theme/animation-tokens";
import { designTokens } from "../theme/design-tokens";

/**
 * Props para componentes que suportam animações
 */
export interface AnimationProps {
  /** Preset de animação a aplicar */
  animation?: AnimationPreset;
  /** Duração customizada da animação */
  animationDuration?: string;
  /** Delay antes da animação iniciar */
  animationDelay?: string;
  /** Repetir animação infinitamente */
  animationInfinite?: boolean;
  /** Direção da animação */
  animationDirection?: "normal" | "reverse" | "alternate";
}

/**
 * Combina classes de animação com outras classes
 */
export function getAnimationClassName(
  animation?: AnimationPreset,
  options?: {
    duration?: string;
    delay?: string;
    iteration?: "once" | "infinite";
    direction?: "normal" | "reverse" | "alternate";
  },
  className?: string,
): string {
  if (!animation || animation === "none") {
    return className || "";
  }

  const animClasses = getAnimationClasses(animation, options);
  return cn(animClasses, className);
}

/**
 * Gera propriedade CSS transition padrão
 */
export function getTransition(
  properties: string[] = ["all"],
  duration: keyof typeof designTokens.duration = "base",
  easing: keyof typeof designTokens.easing = "standard",
): string {
  const durationValue = designTokens.duration[duration];
  const easingValue = designTokens.easing[easing];
  return `${properties.join(", ")} ${durationValue} ${easingValue}`;
}

/**
 * Animações comuns pré-configuradas
 */
export const animations = {
  // Entrada
  enter: {
    fade: getAnimationClasses("fade"),
    slide: getAnimationClasses("slide"),
    scale: getAnimationClasses("scale"),
    slideFade: getAnimationClasses("slideFade"),
  },
  // Saída
  exit: {
    fade: getAnimationClasses("fade", { direction: "reverse" }),
    slide: getAnimationClasses("slide", { direction: "reverse" }),
    scale: getAnimationClasses("scale", { direction: "reverse" }),
  },
  // Loading
  loading: {
    spin: getAnimationClasses("spin", { iteration: "infinite" }),
    pulse: getAnimationClasses("pulse", { iteration: "infinite" }),
    shimmer: getAnimationClasses("shimmer", { iteration: "infinite" }),
  },
  // Hover
  hover: {
    lift: "transition-transform duration-200 ease-out hover:scale-105",
    glow: "transition-shadow duration-200 ease-out hover:shadow-lg",
    fade: "transition-opacity duration-200 ease-out hover:opacity-80",
  },
} as const;

