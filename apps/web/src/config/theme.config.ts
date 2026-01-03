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
    typography: {
      fontPrimary:
        '"DM Sans", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSecondary: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
    },
    transitions: {
      fast: "0.2s ease-in-out",
      base: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      slow: "0.8s ease-in-out",
    },
    compatibility: {
      primaryContrast: "#ffffff",
      secondaryContrast: "#0b1220",
      shadows: {
        soft: "0 2px 8px rgba(12, 18, 34, 0.18)",
        medium: "0 10px 34px rgba(12, 18, 34, 0.28)",
        strong: "0 18px 42px rgba(12, 18, 34, 0.4)",
      },
    },
  },
  themes: {
    light: {
      cleanVibrant: {
        bg: "0 0% 98%",
        surface: "0 0% 100%",
        elevated: "0 0% 95%",
        overlay: "0 0% 0% / 0.02",
        border: "0 0% 0% / 0.08",
        text1: "0 0% 10%",
        text2: "0 0% 30%",
        text3: "0 0% 45%",
        primary: "210 90% 55%",
        secondary: "270 85% 55%",
        accent: "160 85% 40%",
        success: "158 75% 35%",
        warning: "45 100% 45%",
        danger: "0 82% 45%",
        chart1: "210 90% 55%",
        chart2: "200 85% 45%",
        chart3: "280 80% 50%",
        chart4: "160 70% 38%",
        chart5: "45 90% 48%",
        bgGradient:
          "linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(0 0% 97%) 45%, hsl(0 0% 95%) 100%)",
      },
    },
    dark: {
      cleanVibrant: {
        bg: "222 28% 10%",
        surface: "222 22% 14%",
        elevated: "222 20% 18%",
        overlay: "0 0% 100% / 0.04",
        border: "0 0% 100% / 0.06",
        text1: "0 0% 95%",
        text2: "0 0% 75%",
        text3: "0 0% 55%",
        primary: "210 100% 60%",
        secondary: "270 95% 65%",
        accent: "160 90% 55%",
        success: "158 72% 55%",
        warning: "45 100% 60%",
        danger: "0 82% 60%",
        chart1: "210 100% 60%",
        chart2: "200 95% 60%",
        chart3: "280 90% 65%",
        chart4: "160 80% 50%",
        chart5: "45 95% 55%",
        bgGradient:
          "linear-gradient(135deg, hsl(222 28% 10%) 0%, hsl(230 25% 12%) 45%, hsl(240 30% 8%) 100%)",
      },
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
