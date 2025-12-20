/**
 * Focus Ring Utilities
 * Utilitários para aplicar focus rings consistentes e acessíveis
 */

import { cn } from "./cn";
import { focusRingSpecs, type FocusRingConfig } from "../theme/token-scales";

/**
 * Gera classes Tailwind para focus ring
 */
export function getFocusRingClasses(
  config: FocusRingConfig = {},
  className?: string,
): string {
  const {
    width = "base",
    offset = "base",
    color = focusRingSpecs.colors.default,
    opacity = focusRingSpecs.opacity.light,
  } = config;

  // Construir classes Tailwind dinamicamente
  const widthValue = focusRingSpecs.width[width];
  const offsetValue = focusRingSpecs.offset[offset];
  const opacityValue = Math.round(opacity * 100);

  // Usar outline para focus rings (melhor acessibilidade)
  const focusRingClasses = [
    "focus:outline-none",
    "focus-visible:outline-none",
    `focus-visible:ring-[${widthValue}]`,
    `focus-visible:ring-offset-[${offsetValue}]`,
    `focus-visible:ring-[${color}]`,
    `focus-visible:ring-opacity-[${opacityValue}]`,
    "focus-visible:ring-offset-2", // Fallback
  ];

  return cn(focusRingClasses, className);
}

/**
 * Gera estilos inline para focus ring (quando classes não são suficientes)
 */
export function getFocusRingStyles(config: FocusRingConfig = {}): React.CSSProperties {
  const {
    width = "base",
    offset = "base",
    style = "solid",
    color = focusRingSpecs.colors.default,
    opacity = focusRingSpecs.opacity.light,
  } = config;

  const widthValue = focusRingSpecs.width[width];
  const offsetValue = focusRingSpecs.offset[offset];
  const colorWithOpacity = `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`;

  return {
    outline: "none",
    outlineOffset: offsetValue,
    boxShadow: `0 0 0 ${widthValue} ${colorWithOpacity}`,
  } as React.CSSProperties;
}

/**
 * Hook para aplicar focus ring em componentes React
 */
export function useFocusRing(config: FocusRingConfig = {}) {
  return {
    className: getFocusRingClasses(config),
    style: getFocusRingStyles(config),
  };
}

