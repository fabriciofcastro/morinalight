/**
 * Animation Tokens - Sistema de Animações do Design System
 * Presets padronizados para animações comuns
 */

export type AnimationPreset =
  | "fade"
  | "slide"
  | "scale"
  | "slideFade"
  | "bounce"
  | "spin"
  | "pulse"
  | "shimmer"
  | "none";

export interface AnimationConfig {
  name: string;
  duration: string;
  timingFunction: string;
  keyframes: string;
}

/**
 * Presets de animação predefinidos
 */
export const animationPresets: Record<AnimationPreset, AnimationConfig> = {
  fade: {
    name: "fade",
    duration: "250ms",
    timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    keyframes: `
      @keyframes fade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
  },
  slide: {
    name: "slide",
    duration: "300ms",
    timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    keyframes: `
      @keyframes slide {
        from { transform: translateY(-10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `,
  },
  scale: {
    name: "scale",
    duration: "200ms",
    timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    keyframes: `
      @keyframes scale {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `,
  },
  slideFade: {
    name: "slideFade",
    duration: "300ms",
    timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    keyframes: `
      @keyframes slideFade {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `,
  },
  bounce: {
    name: "bounce",
    duration: "600ms",
    timingFunction: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    keyframes: `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `,
  },
  spin: {
    name: "spin",
    duration: "1000ms",
    timingFunction: "linear",
    keyframes: `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
  },
  pulse: {
    name: "pulse",
    duration: "2000ms",
    timingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
    keyframes: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
  },
  shimmer: {
    name: "shimmer",
    duration: "2000ms",
    timingFunction: "linear",
    keyframes: `
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
    `,
  },
  none: {
    name: "none",
    duration: "0ms",
    timingFunction: "linear",
    keyframes: "",
  },
};

/**
 * Gera classes CSS para animações usando Tailwind
 */
export function getAnimationClasses(
  preset: AnimationPreset,
  options?: {
    duration?: string;
    delay?: string;
    iteration?: "once" | "infinite";
    direction?: "normal" | "reverse" | "alternate";
  },
): string {
  const config = animationPresets[preset];

  if (preset === "none") {
    return "";
  }

  const classes: string[] = [];

  // Duração
  const duration = options?.duration || config.duration;
  classes.push(`duration-[${duration}]`);

  // Timing function
  classes.push(`ease-[${config.timingFunction}]`);

  // Delay (se especificado)
  if (options?.delay) {
    classes.push(`delay-[${options.delay}]`);
  }

  // Iteração
  const iteration = options?.iteration || "once";
  if (iteration === "infinite") {
    classes.push("animate-infinite");
  }

  // Direção
  const direction = options?.direction || "normal";
  if (direction !== "normal") {
    classes.push(`animate-${direction}`);
  }

  // Nome da animação (usando Tailwind animate-* ou classes customizadas)
  switch (preset) {
    case "fade":
      classes.push("animate-[fade_250ms_ease-in-out]");
      break;
    case "slide":
      classes.push("animate-[slide_300ms_ease-out]");
      break;
    case "scale":
      classes.push("animate-[scale_200ms_ease-out]");
      break;
    case "slideFade":
      classes.push("animate-[slideFade_300ms_ease-out]");
      break;
    case "bounce":
      classes.push("animate-[bounce_600ms_ease-in-out]");
      break;
    case "spin":
      classes.push("animate-spin");
      break;
    case "pulse":
      classes.push("animate-pulse");
      break;
    case "shimmer":
      classes.push("animate-[shimmer_2s_linear_infinite]");
      break;
  }

  return classes.join(" ");
}

/**
 * Gera propriedades CSS inline para animações
 */
export function getAnimationStyles(
  preset: AnimationPreset,
  options?: {
    duration?: string;
    delay?: string;
    iteration?: "once" | "infinite";
    direction?: "normal" | "reverse" | "alternate";
  },
): React.CSSProperties {
  const config = animationPresets[preset];

  if (preset === "none") {
    return {};
  }

  return {
    animationName: config.name,
    animationDuration: options?.duration || config.duration,
    animationTimingFunction: config.timingFunction,
    animationDelay: options?.delay || "0ms",
    animationIterationCount: options?.iteration === "infinite" ? "infinite" : 1,
    animationDirection: options?.direction || "normal",
  };
}

/**
 * Utilitários para animações de entrada/saída
 */
export const enterAnimations = {
  fadeIn: getAnimationClasses("fade"),
  slideIn: getAnimationClasses("slide"),
  scaleIn: getAnimationClasses("scale"),
  slideFadeIn: getAnimationClasses("slideFade"),
  bounceIn: getAnimationClasses("bounce"),
};

export const exitAnimations = {
  fadeOut: getAnimationClasses("fade", { direction: "reverse" }),
  slideOut: getAnimationClasses("slide", { direction: "reverse" }),
  scaleOut: getAnimationClasses("scale", { direction: "reverse" }),
  slideFadeOut: getAnimationClasses("slideFade", { direction: "reverse" }),
};

/**
 * Animação de loading/spinner
 */
export const loadingAnimations = {
  spin: getAnimationClasses("spin", { iteration: "infinite" }),
  pulse: getAnimationClasses("pulse", { iteration: "infinite" }),
  shimmer: getAnimationClasses("shimmer", { iteration: "infinite" }),
};

