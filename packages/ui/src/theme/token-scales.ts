/**
 * Token Scales - Escalas padronizadas para border, opacity, z-index, etc.
 * Complementa design-tokens.ts com escalas sistemáticas
 */

/**
 * Escala de largura de bordas
 */
export const borderWidthScale = {
  none: "0px",
  hairline: "0.5px",
  thin: "1px",
  base: "2px",
  medium: "3px",
  thick: "4px",
  "extra-thick": "6px",
} as const;

export type BorderWidth = keyof typeof borderWidthScale;

/**
 * Escala de opacidade
 */
export const opacityScale = {
  transparent: 0,
  "0": 0,
  "5": 0.05,
  "10": 0.1,
  "15": 0.15,
  "20": 0.2,
  "25": 0.25,
  "30": 0.3,
  "35": 0.35,
  "40": 0.4,
  "45": 0.45,
  "50": 0.5,
  "55": 0.55,
  "60": 0.6,
  "65": 0.65,
  "70": 0.7,
  "75": 0.75,
  "80": 0.8,
  "85": 0.85,
  "90": 0.9,
  "95": 0.95,
  opaque: 1,
  "100": 1,
} as const;

export type Opacity = keyof typeof opacityScale;

/**
 * Escala de z-index
 * Seguindo princípios de camadas (layers)
 */
export const zIndexScale = {
  // Base layers
  base: 0,
  // Content layers (1-100)
  content: 1,
  contentElevated: 10,
  // Interactive elements (100-200)
  interactive: 100,
  interactiveElevated: 110,
  dropdown: 200,
  overlay: 300,
  // Navigation layers (400-500)
  navigation: 400,
  navigationSticky: 410,
  navigationFixed: 420,
  // Modal layers (500-600)
  modal: 500,
  modalBackdrop: 490,
  modalContent: 510,
  // Notification layers (600-700)
  notification: 600,
  tooltip: 700,
  popover: 710,
  // System layers (800-900)
  loading: 800,
  system: 900,
  // Critical system layers (900+)
  critical: 1000,
  max: 9999,
} as const;

export type ZIndex = keyof typeof zIndexScale;

/**
 * Focus Ring Specifications
 * Especificações completas para anéis de foco (WCAG AA)
 */
export const focusRingSpecs = {
  // Tamanhos
  width: {
    thin: "1px",
    base: "2px",
    thick: "3px",
  },
  // Offset (distância do elemento)
  offset: {
    none: "0px",
    sm: "1px",
    base: "2px",
    md: "3px",
    lg: "4px",
  },
  // Estilos
  style: {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
  },
  // Opacidades padrão (para contraste WCAG AA)
  opacity: {
    light: 0.22, // Para temas light
    dark: 0.32, // Para temas dark (precisa ser mais visível)
    high: 0.5, // Para alto contraste
  },
  // Cores padrão por estado
  colors: {
    default: "hsl(210, 90%, 55%)", // Primary
    success: "hsl(158, 72%, 35%)",
    warning: "hsl(45, 100%, 45%)",
    danger: "hsl(0, 82%, 45%)",
    info: "hsl(200, 95%, 45%)",
  },
} as const;

export type FocusRingWidth = keyof typeof focusRingSpecs.width;
export type FocusRingOffset = keyof typeof focusRingSpecs.offset;
export type FocusRingStyle = keyof typeof focusRingSpecs.style;

/**
 * Helper para gerar CSS de focus ring
 */
export interface FocusRingConfig {
  width?: FocusRingWidth;
  offset?: FocusRingOffset;
  style?: FocusRingStyle;
  color?: string;
  opacity?: number;
}

export function getFocusRingCSS(config: FocusRingConfig = {}): string {
  const {
    width = "base",
    offset = "base",
    style = "solid",
    color = focusRingSpecs.colors.default,
    opacity = focusRingSpecs.opacity.light,
  } = config;

  const widthValue = focusRingSpecs.width[width];
  const _offsetValue = focusRingSpecs.offset[offset];
  const styleValue = focusRingSpecs.style[style];
  const colorWithOpacity = `${color}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0")}`;

  return `${widthValue} ${styleValue} ${colorWithOpacity}`;
}

/**
 * Shadow Levels - Níveis de sombras completos
 */
export const shadowLevels = {
  // Sombras sutis (elevação mínima)
  xs: {
    light: "0 1px 2px rgba(0, 0, 0, 0.05)",
    dark: "0 1px 2px rgba(0, 0, 0, 0.3)",
  },
  sm: {
    light: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
    dark: "0 1px 3px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.3)",
  },
  // Sombras médias (elevação padrão)
  md: {
    light: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)",
    dark: "0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.35)",
  },
  lg: {
    light: "0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.06)",
    dark: "0 10px 15px rgba(0, 0, 0, 0.45), 0 4px 6px rgba(0, 0, 0, 0.4)",
  },
  // Sombras grandes (elevação alta)
  xl: {
    light: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.06)",
    dark: "0 20px 25px rgba(0, 0, 0, 0.5), 0 10px 10px rgba(0, 0, 0, 0.45)",
  },
  "2xl": {
    light: "0 25px 50px rgba(0, 0, 0, 0.12), 0 10px 15px rgba(0, 0, 0, 0.08)",
    dark: "0 25px 50px rgba(0, 0, 0, 0.55), 0 10px 15px rgba(0, 0, 0, 0.5)",
  },
  // Sombras internas (inset)
  inner: {
    light: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
    dark: "inset 0 2px 4px rgba(0, 0, 0, 0.4)",
  },
  // Sem sombra
  none: {
    light: "none",
    dark: "none",
  },
} as const;

export type ShadowLevel = keyof typeof shadowLevels;

/**
 * Helper para obter sombra baseada no tema
 */
export function getShadow(level: ShadowLevel, theme: "light" | "dark" = "light"): string {
  return shadowLevels[level][theme];
}

/**
 * Exportar tudo como objeto unificado (opcional)
 */
export const tokenScales = {
  borderWidth: borderWidthScale,
  opacity: opacityScale,
  zIndex: zIndexScale,
  focusRing: focusRingSpecs,
  shadows: shadowLevels,
  getFocusRingCSS,
  getShadow,
} as const;

export type TokenScales = typeof tokenScales;
