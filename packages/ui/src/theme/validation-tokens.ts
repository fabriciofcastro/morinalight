/**
 * Tokens de Validação - Estados visuais para campos de formulário
 * Suporta: valid, invalid, pending, default
 */

export type ValidationState = "valid" | "invalid" | "pending" | "default";

export interface ValidationTokens {
  border: string;
  background: string;
  text: string;
  icon: string;
  focusRing: string;
  focusRingOpacity: number;
}

/**
 * Obtém tokens de validação baseado no tema atual e estado
 */
export function getValidationTokens(
  state: ValidationState,
  theme: "light" | "dark" = "light",
): ValidationTokens {
  const tokens = {
    valid: {
      light: {
        border: "hsl(158, 72%, 35%)",
        background: "hsl(158, 40%, 98%)",
        text: "hsl(158, 72%, 25%)",
        icon: "hsl(158, 72%, 35%)",
        focusRing: "hsl(158, 72%, 35%)",
        focusRingOpacity: 0.22,
      },
      dark: {
        border: "hsl(158, 72%, 55%)",
        background: "hsl(158, 40%, 12%)",
        text: "hsl(158, 72%, 55%)",
        icon: "hsl(158, 72%, 55%)",
        focusRing: "hsl(158, 72%, 55%)",
        focusRingOpacity: 0.32,
      },
    },
    invalid: {
      light: {
        border: "hsl(0, 82%, 45%)",
        background: "hsl(0, 50%, 98%)",
        text: "hsl(0, 82%, 35%)",
        icon: "hsl(0, 82%, 45%)",
        focusRing: "hsl(0, 82%, 45%)",
        focusRingOpacity: 0.22,
      },
      dark: {
        border: "hsl(0, 82%, 60%)",
        background: "hsl(0, 50%, 12%)",
        text: "hsl(0, 82%, 60%)",
        icon: "hsl(0, 82%, 60%)",
        focusRing: "hsl(0, 82%, 60%)",
        focusRingOpacity: 0.32,
      },
    },
    pending: {
      light: {
        border: "hsl(45, 100%, 45%)",
        background: "hsl(45, 60%, 98%)",
        text: "hsl(45, 100%, 35%)",
        icon: "hsl(45, 100%, 45%)",
        focusRing: "hsl(45, 100%, 45%)",
        focusRingOpacity: 0.22,
      },
      dark: {
        border: "hsl(45, 100%, 60%)",
        background: "hsl(45, 60%, 12%)",
        text: "hsl(45, 100%, 60%)",
        icon: "hsl(45, 100%, 60%)",
        focusRing: "hsl(45, 100%, 60%)",
        focusRingOpacity: 0.32,
      },
    },
    default: {
      light: {
        border: "rgba(0, 0, 0, 0.1)",
        background: "transparent",
        text: "inherit",
        icon: "rgba(0, 0, 0, 0.4)",
        focusRing: "hsl(210, 90%, 55%)",
        focusRingOpacity: 0.22,
      },
      dark: {
        border: "rgba(255, 255, 255, 0.1)",
        background: "transparent",
        text: "inherit",
        icon: "rgba(255, 255, 255, 0.4)",
        focusRing: "hsl(210, 100%, 60%)",
        focusRingOpacity: 0.32,
      },
    },
  };

  return tokens[state][theme];
}

/**
 * Gera classes CSS para estados de validação (Tailwind)
 */
export function getValidationClasses(
  state: ValidationState,
  theme: "light" | "dark" = "light",
): {
  border: string;
  background: string;
  text: string;
  focusRing: string;
} {
  const tokens = getValidationTokens(state, theme);

  return {
    border: `border-[${tokens.border}]`,
    background: tokens.background !== "transparent" ? `bg-[${tokens.background}]` : "",
    text: `text-[${tokens.text}]`,
    focusRing: `focus:ring-[${tokens.focusRing}] focus:ring-opacity-[${tokens.focusRingOpacity}]`,
  };
}
