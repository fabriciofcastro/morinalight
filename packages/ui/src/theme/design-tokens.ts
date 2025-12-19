/**
 * Design System Tokens - Morina AlphaSysCore
 * Sistema de design avançado, moderno e completo
 */

export const designTokens = {
  // Bordas: Tudo quadrado (0px ou valores mínimos)
  radius: {
    none: "0px",
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
  },

  // Cores por utilidade - Todas com variantes para dark/light
  colors: {
    // Cores semânticas de ação
    primary: {
      light: {
        base: "hsl(210, 90%, 55%)",
        hover: "hsl(210, 90%, 50%)",
        active: "hsl(210, 90%, 45%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(210, 50%, 95%)",
      },
      dark: {
        base: "hsl(210, 100%, 60%)",
        hover: "hsl(210, 100%, 65%)",
        active: "hsl(210, 100%, 55%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(210, 50%, 15%)",
      },
    },
    success: {
      light: {
        base: "hsl(158, 72%, 35%)",
        hover: "hsl(158, 72%, 30%)",
        active: "hsl(158, 72%, 25%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(158, 40%, 95%)",
      },
      dark: {
        base: "hsl(158, 72%, 55%)",
        hover: "hsl(158, 72%, 60%)",
        active: "hsl(158, 72%, 50%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(158, 40%, 15%)",
      },
    },
    warning: {
      light: {
        base: "hsl(45, 100%, 45%)",
        hover: "hsl(45, 100%, 40%)",
        active: "hsl(45, 100%, 35%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(45, 60%, 95%)",
      },
      dark: {
        base: "hsl(45, 100%, 60%)",
        hover: "hsl(45, 100%, 65%)",
        active: "hsl(45, 100%, 55%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(45, 60%, 15%)",
      },
    },
    danger: {
      light: {
        base: "hsl(0, 82%, 45%)",
        hover: "hsl(0, 82%, 40%)",
        active: "hsl(0, 82%, 35%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(0, 50%, 95%)",
      },
      dark: {
        base: "hsl(0, 82%, 60%)",
        hover: "hsl(0, 82%, 65%)",
        active: "hsl(0, 82%, 55%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(0, 50%, 15%)",
      },
    },
    info: {
      light: {
        base: "hsl(200, 95%, 45%)",
        hover: "hsl(200, 95%, 40%)",
        active: "hsl(200, 95%, 35%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(200, 50%, 95%)",
      },
      dark: {
        base: "hsl(200, 95%, 60%)",
        hover: "hsl(200, 95%, 65%)",
        active: "hsl(200, 95%, 55%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(200, 50%, 15%)",
      },
    },
    secondary: {
      light: {
        base: "hsl(270, 85%, 55%)",
        hover: "hsl(270, 85%, 50%)",
        active: "hsl(270, 85%, 45%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(270, 40%, 95%)",
      },
      dark: {
        base: "hsl(270, 95%, 65%)",
        hover: "hsl(270, 95%, 70%)",
        active: "hsl(270, 95%, 60%)",
        contrast: "hsl(0, 0%, 100%)",
        subtle: "hsl(270, 40%, 15%)",
      },
    },
  },

  // Estados de Validação para Formulários
  validation: {
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
  },

  // Glass effects - Blur e transparência
  glass: {
    light: {
      base: "rgba(255, 255, 255, 0.85)",
      elevated: "rgba(255, 255, 255, 0.90)",
      subtle: "rgba(255, 255, 255, 0.70)",
      blur: "blur(20px)",
      blurStrong: "blur(40px)",
    },
    dark: {
      base: "rgba(20, 25, 35, 0.75)",
      elevated: "rgba(25, 30, 40, 0.85)",
      subtle: "rgba(15, 20, 30, 0.65)",
      blur: "blur(20px)",
      blurStrong: "blur(40px)",
    },
  },

  // Shadows avançadas
  shadows: {
    soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
    medium: "0 4px 16px rgba(0, 0, 0, 0.12)",
    strong: "0 8px 32px rgba(0, 0, 0, 0.16)",
    glow: {
      primary: "0 0 20px rgba(91, 138, 255, 0.4)",
      success: "0 0 20px rgba(34, 197, 94, 0.4)",
      warning: "0 0 20px rgba(245, 158, 11, 0.4)",
      danger: "0 0 20px rgba(239, 68, 68, 0.4)",
      info: "0 0 20px rgba(59, 130, 246, 0.4)",
    },
  },

  // Espaçamentos consistentes
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "48px",
    "4xl": "64px",
  },

  // Transições suaves
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

export type DesignTokens = typeof designTokens;
