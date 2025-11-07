export type ThemeMode = "light" | "dark" | "auto";

export type ThemeName = Exclude<ThemeMode, "auto">;

type ThemeConfig = typeof themeConfig;

export const themeConfig = {
  meta: {
    brand: "Morina",
    project: "AlphaSysCore",
    version: "1.0.0",
    allowERPKeyword: false,
    description: "Design System translúcido e dinâmico da Morina para o AlphaSysCore.",
  },
  tokens: {
    colors: {
      primary: "#2855FF",
      primaryContrast: "#FFFFFF",
      accent: "#FF80B0",
      secondary: "#9C27B0",
      backgroundLight: "#FAFAFA",
      backgroundDark: "rgba(20,30,60,0.9)",
      glassLight: "rgba(255,255,255,0.15)",
      glassDark: "rgba(255,255,255,0.08)",
      border: "rgba(255,255,255,0.18)",
      borderStrong: "rgba(255,255,255,0.32)",
      shadowSoft: "0 2px 8px rgba(0,0,0,0.06)",
      shadowMedium: "0 4px 12px rgba(0,0,0,0.1)",
      text: "#1C1C1C",
    },
    typography: {
      fontPrimary: '"DM Sans", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSecondary: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
      sizeBase: "16px",
      lineHeightBase: "1.6",
      headingWeight: 600,
      bodyWeight: 400,
    },
    radii: {
      sm: "6px",
      md: "10px",
      lg: "16px",
      xl: "24px",
    },
    transitions: {
      fast: "0.2s ease-in-out",
      base: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      slow: "0.8s ease-in-out",
    },
    effects: {
      blur: "blur(12px)",
      glassLight: "backdrop-filter: blur(12px) saturate(180%); background: rgba(255,255,255,0.15);",
      glassDark: "backdrop-filter: blur(16px) saturate(160%); background: rgba(255,255,255,0.08);",
    },
  },
  themes: {
    light: {
      background: "#FAFAFA",
      text: "#1C1C1C",
      glass: "rgba(255,255,255,0.15)",
      motionColor: "rgba(255,255,255,0.12)",
      accentGlow: "rgba(255,255,255,0.25)",
    },
    dark: {
      background: "rgba(20,30,60,0.9)",
      text: "#FFFFFF",
      glass: "rgba(255,255,255,0.08)",
      motionColor: "rgba(40,85,255,0.2)",
      accentGlow: "rgba(40,85,255,0.35)",
    },
  },
  animations: {
    translucentSweep: {
      keyframes: `
        @keyframes translucentSweep {
          0% { opacity: 0; transform: translateX(-10%); }
          50% { opacity: 0.6; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(10%); }
        }
      `,
      css: `
        animation: translucentSweep 12s ease-in-out infinite alternate;
        background: linear-gradient(
          90deg,
          rgba(255,255,255,0.08),
          rgba(255,255,255,0.15),
          rgba(255,255,255,0.08)
        );
      `,
    },
  },
  personalization: {
    allowLogoUpload: true,
    allowColorOverride: true,
    allowVideoLink: true,
    fields: {
      logoUrl: {
        type: "upload",
        label: "Logo da Empresa",
      },
      primaryColor: {
        type: "color",
        label: "Cor Primária",
      },
      secondaryColor: {
        type: "color",
        label: "Cor Secundária",
      },
      themeMode: {
        type: "select",
        options: ["light", "dark", "auto"],
        label: "Modo de Tema",
      },
      videoLink: {
        type: "text",
        label: "Vídeo Institucional (Vimeo/YouTube)",
      },
    },
  },
  implementation: {
    persistence: {
      storage: "localStorage",
      key: "morina-theme",
    },
    cssInjection: {
      method: "customProperties",
      apply: `
        document.documentElement.style.setProperty('--primary', config.primaryColor);
        document.documentElement.style.setProperty('--secondary', config.secondaryColor);
      `,
    },
    motion: {
      engine: "framer-motion",
      basePresets: {
        fadeInUp: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      },
    },
  },
} as const;

export type CompanyThemeSettings = {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  themeMode?: ThemeMode;
  videoLink?: string;
};

export type ThemeConfigTokens = ThemeConfig["tokens"];
