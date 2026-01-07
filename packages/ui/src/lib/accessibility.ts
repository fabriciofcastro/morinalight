/**
 * Utilitários de Acessibilidade - WCAG 2.1 AA Compliance
 */

/**
 * Calcula o contraste de cores entre duas cores (WCAG AA)
 * @param color1 - Cor de texto (hex, rgb, hsl)
 * @param color2 - Cor de fundo (hex, rgb, hsl)
 * @returns Razão de contraste
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Converte cores para RGB
  const rgb1 = hexToRgb(color1) || parseRgb(color1);
  const rgb2 = hexToRgb(color2) || parseRgb(color2);

  if (!rgb1 || !rgb2) {
    return 0;
  }

  // Calcula luminância relativa
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  // Contraste = (L1 + 0.05) / (L2 + 0.05) onde L1 > L2
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verifica se o contraste atende WCAG AA
 * @param color1 - Cor de texto
 * @param color2 - Cor de fundo
 * @param level - Nível WCAG (AA normal = 4.5:1, AA large = 3:1, AAA = 7:1)
 * @returns true se atende o nível
 */
export function meetsContrastRatio(
  color1: string,
  color2: string,
  level: "AA" | "AA-Large" | "AAA" = "AA",
): boolean {
  const ratio = getContrastRatio(color1, color2);
  const thresholds = {
    AA: 4.5,
    "AA-Large": 3.0,
    AAA: 7.0,
  };

  return ratio >= thresholds[level];
}

/**
 * Calcula luminância relativa de uma cor RGB (0-1)
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const values = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
  });
  const r = values[0]!;
  const g = values[1]!;
  const b = values[2]!;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Converte hex para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : null;
}

/**
 * Parse RGB string
 */
function parseRgb(rgb: string): { r: number; g: number; b: number } | null {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match
    ? {
        r: parseInt(match[1]!, 10),
        g: parseInt(match[2]!, 10),
        b: parseInt(match[3]!, 10),
      }
    : null;
}

/**
 * Gera ID único para elementos ARIA
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Props base para elementos acessíveis
 */
export interface AccessibleProps {
  /** ID do elemento (gerado automaticamente se não fornecido) */
  id?: string;
  /** Label acessível */
  "aria-label"?: string;
  /** ID do elemento que rotula este elemento */
  "aria-labelledby"?: string;
  /** ID do elemento que descreve este elemento */
  "aria-describedby"?: string;
  /** Role ARIA */
  role?: string;
  /** Estado do elemento (expanded, pressed, etc) */
  "aria-expanded"?: boolean;
  "aria-pressed"?: boolean;
  "aria-checked"?: boolean;
  "aria-selected"?: boolean;
  /** Estado inválido */
  "aria-invalid"?: boolean | "grammar" | "spelling";
  /** Nível de live region */
  "aria-live"?: "off" | "polite" | "assertive";
  /** Controle de atomicidade */
  "aria-atomic"?: boolean;
  /** Controle de relevância */
  "aria-relevant"?: "additions" | "removals" | "text" | "all";
}

/**
 * Combina props de acessibilidade
 */
export function mergeAccessibilityProps(
  defaultProps: Partial<AccessibleProps>,
  userProps: Partial<AccessibleProps>,
): AccessibleProps {
  return {
    ...defaultProps,
    ...userProps,
    // aria-describedby pode ser combinado
    "aria-describedby":
      [defaultProps["aria-describedby"], userProps["aria-describedby"]].filter(Boolean).join(" ") ||
      undefined,
  } as AccessibleProps;
}
