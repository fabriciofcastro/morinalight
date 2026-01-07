/**
 * Morina Design System - Semantic Token System
 * 3-Tier Architecture: Primitive → Semantic → Component
 */

// ============================================
// TIER 1: Primitive Tokens (Raw Values)
// Never use these directly in components
// ============================================

const primitiveColors = {
  // Grays
  gray50: "#f8fafc",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
  gray300: "#cbd5e1",
  gray400: "#94a3b8",
  gray500: "#64748b",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1e293b",
  gray900: "#0f172a",
  gray950: "#020617",

  // Blues
  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue200: "#bfdbfe",
  blue300: "#93c5fd",
  blue400: "#60a5fa",
  blue500: "#3b82f6",
  blue600: "#2563eb",
  blue700: "#1d4ed8",
  blue800: "#1e40af",
  blue900: "#1e3a8a",

  // Cyans
  cyan50: "#ecfeff",
  cyan100: "#cffafe",
  cyan200: "#a5f3fc",
  cyan300: "#67e8f9",
  cyan400: "#22d3ee",
  cyan500: "#06b6d4",
  cyan600: "#0891b2",
  cyan700: "#0e7490",
  cyan800: "#155e75",
  cyan900: "#164e63",

  // Greens
  green50: "#f0fdf4",
  green100: "#dcfce7",
  green200: "#bbf7d0",
  green300: "#86efac",
  green400: "#4ade80",
  green500: "#22c55e",
  green600: "#16a34a",
  green700: "#15803d",
  green800: "#166534",
  green900: "#14532d",

  // Yellows
  yellow50: "#fefce8",
  yellow100: "#fef9c3",
  yellow200: "#fef08a",
  yellow300: "#fde047",
  yellow400: "#facc15",
  yellow500: "#eab308",
  yellow600: "#ca8a04",
  yellow700: "#a16207",
  yellow800: "#854d0e",
  yellow900: "#713f12",

  // Reds
  red50: "#fef2f2",
  red100: "#fee2e2",
  red200: "#fecaca",
  red300: "#fca5a5",
  red400: "#f87171",
  red500: "#ef4444",
  red600: "#dc2626",
  red700: "#b91c1c",
  red800: "#991b1b",
  red900: "#7f1d1d",

  // Purples
  purple50: "#faf5ff",
  purple100: "#f3e8ff",
  purple200: "#e9d5ff",
  purple300: "#d8b4fe",
  purple400: "#c084fc",
  purple500: "#a855f7",
  purple600: "#9333ea",
  purple700: "#7e22ce",
  purple800: "#6b21a8",
  purple900: "#581c87",
};

const primitiveSpacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
};

// ============================================
// TIER 2: Semantic Tokens (Contextual)
// Use these in components
// ============================================

export const semanticTokens = {
  // Colors organized by purpose
  color: {
    // Backgrounds
    background: {
      primary: primitiveColors.gray950,
      secondary: primitiveColors.gray900,
      tertiary: primitiveColors.gray800,
      elevated: primitiveColors.gray800,
      overlay: "rgba(0, 0, 0, 0.8)",
      glass: "rgba(15, 23, 42, 0.6)",
    },

    // Text
    text: {
      primary: primitiveColors.gray50,
      secondary: primitiveColors.gray400,
      tertiary: primitiveColors.gray500,
      disabled: primitiveColors.gray600,
      inverse: primitiveColors.gray950,
    },

    // Actions (interactive elements)
    action: {
      primary: primitiveColors.blue500,
      primaryHover: primitiveColors.blue600,
      primaryActive: primitiveColors.blue700,
      primaryDisabled: primitiveColors.blue300,

      secondary: primitiveColors.purple500,
      secondaryHover: primitiveColors.purple600,
      secondaryActive: primitiveColors.purple700,

      accent: primitiveColors.cyan400,
      accentHover: primitiveColors.cyan500,
      accentActive: primitiveColors.cyan600,
    },

    // Feedback
    feedback: {
      success: primitiveColors.green500,
      successSubtle: primitiveColors.green900,
      warning: primitiveColors.yellow500,
      warningSubtle: primitiveColors.yellow900,
      error: primitiveColors.red500,
      errorSubtle: primitiveColors.red900,
      info: primitiveColors.blue500,
      infoSubtle: primitiveColors.blue900,
    },

    // Borders
    border: {
      default: "rgba(255, 255, 255, 0.08)",
      strong: "rgba(255, 255, 255, 0.16)",
      subtle: "rgba(255, 255, 255, 0.04)",
      focus: primitiveColors.blue500,
    },
  },

  // Spacing organized by usage
  spacing: {
    component: {
      padding: {
        xs: primitiveSpacing[1],
        sm: primitiveSpacing[2],
        md: primitiveSpacing[4],
        lg: primitiveSpacing[6],
        xl: primitiveSpacing[8],
      },
      gap: {
        xs: primitiveSpacing[1],
        sm: primitiveSpacing[2],
        md: primitiveSpacing[4],
        lg: primitiveSpacing[6],
        xl: primitiveSpacing[8],
      },
    },
    layout: {
      section: primitiveSpacing[12],
      container: primitiveSpacing[6],
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-sans, "Inter", system-ui, sans-serif)',
      mono: 'var(--font-mono, "Geist Mono", monospace)',
      display: 'var(--font-display, "Space Grotesk", "Inter", sans-serif)',
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
    lineHeight: {
      tight: "1.2",
      snug: "1.35",
      normal: "1.5",
      relaxed: "1.65",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Shadows
  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    glow: {
      primary: `0 0 20px ${primitiveColors.blue500}40`,
      success: `0 0 20px ${primitiveColors.green500}40`,
      error: `0 0 20px ${primitiveColors.red500}40`,
    },
  },

  // Radius
  radius: {
    none: "0px",
    sm: "2px",
    md: "4px",
    lg: "8px",
    xl: "12px",
    full: "9999px",
  },

  // Transitions
  transition: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

// ============================================
// TIER 3: Component Tokens (Component-specific)
// Derived from semantic tokens
// ============================================

export const componentTokens = {
  button: {
    padding: {
      xs: `${semanticTokens.spacing.component.padding.xs} ${semanticTokens.spacing.component.padding.sm}`,
      sm: `${semanticTokens.spacing.component.padding.sm} ${semanticTokens.spacing.component.padding.md}`,
      md: `${semanticTokens.spacing.component.padding.sm} ${semanticTokens.spacing.component.padding.lg}`,
      lg: `${semanticTokens.spacing.component.padding.md} ${semanticTokens.spacing.component.padding.xl}`,
    },
    fontSize: {
      xs: semanticTokens.typography.fontSize.xs,
      sm: semanticTokens.typography.fontSize.sm,
      md: semanticTokens.typography.fontSize.base,
      lg: semanticTokens.typography.fontSize.lg,
    },
    background: {
      default: semanticTokens.color.action.primary,
      defaultHover: semanticTokens.color.action.primaryHover,
      defaultActive: semanticTokens.color.action.primaryActive,
      secondary: semanticTokens.color.action.secondary,
      secondaryHover: semanticTokens.color.action.secondaryHover,
    },
    border: {
      default: semanticTokens.color.border.default,
      focus: semanticTokens.color.border.focus,
    },
  },

  input: {
    padding: semanticTokens.spacing.component.padding.md,
    fontSize: semanticTokens.typography.fontSize.base,
    background: semanticTokens.color.background.secondary,
    border: semanticTokens.color.border.default,
    borderFocus: semanticTokens.color.border.focus,
    text: semanticTokens.color.text.primary,
    placeholder: semanticTokens.color.text.tertiary,
  },

  card: {
    padding: semanticTokens.spacing.component.padding.lg,
    background: semanticTokens.color.background.glass,
    border: semanticTokens.color.border.default,
    radius: semanticTokens.radius.none,
    shadow: semanticTokens.shadow.md,
  },
};

// Export everything
export { primitiveColors, primitiveSpacing };
