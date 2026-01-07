"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "high-contrast";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Theme configurations
const themeConfigs = {
  dark: {
    background: {
      primary: "#020617",
      secondary: "#0f172a",
      tertiary: "#1e293b",
      elevated: "#1e293b",
      overlay: "rgba(0, 0, 0, 0.8)",
      glass: "rgba(15, 23, 42, 0.6)",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
      tertiary: "#64748b",
      disabled: "#475569",
      inverse: "#020617",
    },
    action: {
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      primaryActive: "#1d4ed8",
    },
    border: {
      default: "rgba(255, 255, 255, 0.08)",
      strong: "rgba(255, 255, 255, 0.16)",
      subtle: "rgba(255, 255, 255, 0.04)",
    },
  },
  light: {
    background: {
      primary: "#ffffff",
      secondary: "#f8fafc",
      tertiary: "#f1f5f9",
      elevated: "#ffffff",
      overlay: "rgba(0, 0, 0, 0.5)",
      glass: "rgba(255, 255, 255, 0.8)",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      tertiary: "#64748b",
      disabled: "#94a3b8",
      inverse: "#ffffff",
    },
    action: {
      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      primaryActive: "#1e40af",
    },
    border: {
      default: "rgba(0, 0, 0, 0.08)",
      strong: "rgba(0, 0, 0, 0.16)",
      subtle: "rgba(0, 0, 0, 0.04)",
    },
  },
  "high-contrast": {
    background: {
      primary: "#000000",
      secondary: "#000000",
      tertiary: "#1a1a1a",
      elevated: "#1a1a1a",
      overlay: "rgba(0, 0, 0, 0.95)",
      glass: "rgba(0, 0, 0, 0.9)",
    },
    text: {
      primary: "#ffffff",
      secondary: "#ffffff",
      tertiary: "#e5e5e5",
      disabled: "#999999",
      inverse: "#000000",
    },
    action: {
      primary: "#00b4ff",
      primaryHover: "#0099dd",
      primaryActive: "#007dbb",
    },
    border: {
      default: "rgba(255, 255, 255, 0.3)",
      strong: "rgba(255, 255, 255, 0.5)",
      subtle: "rgba(255, 255, 255, 0.1)",
    },
  },
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

/**
 * Enhanced ThemeProvider with dark/light/high-contrast support
 * @example
 * <ThemeProvider defaultTheme="dark">
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "morina-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored && (stored === "dark" || stored === "light" || stored === "high-contrast")) {
      setThemeState(stored);
    }
  }, [storageKey]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const config = themeConfigs[theme];

    // Set data-theme attribute
    root.setAttribute("data-theme", theme);

    // Set color-scheme for browser UI
    root.style.colorScheme = theme === "light" ? "light" : "dark";

    // Apply CSS variables
    Object.entries(config.background).forEach(([key, value]) => {
      root.style.setProperty(`--bg-${key}`, value);
    });

    Object.entries(config.text).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });

    Object.entries(config.action).forEach(([key, value]) => {
      root.style.setProperty(`--action-${key}`, value);
    });

    Object.entries(config.border).forEach(([key, value]) => {
      root.style.setProperty(`--border-${key}`, value);
    });

    // Save to localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((current) => {
      if (current === "dark") return "light";
      if (current === "light") return "high-contrast";
      return "dark";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access and control theme
 * @example
 * const { theme, setTheme, toggleTheme } = useTheme();
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
