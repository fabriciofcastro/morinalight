"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type CompanyThemeSettings,
  type ThemeMode,
  type ThemeName,
  themeConfig,
} from "@/config/theme.config";
import { type NormalizedCompanySettings, normalizeCompanySettings } from "@/lib/company-settings";

type StoredSettings = CompanyThemeSettings & { themeMode?: ThemeMode };

const STORAGE_KEY = themeConfig.implementation.persistence.key;
const isBrowser = typeof window !== "undefined";

const ANIMATION_STYLE_ID = "alpha-syscore-translucent-sweep";

const getSystemTheme = (): ThemeName => {
  if (!isBrowser || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const ensureAnimationInjected = () => {
  if (!isBrowser) return;
  if (document.getElementById(ANIMATION_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = ANIMATION_STYLE_ID;
  style.textContent = themeConfig.animations.translucentSweep.keyframes;
  document.head.appendChild(style);
};

const readStoredSettings = (): StoredSettings | null => {
  if (!isBrowser) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSettings;
  } catch (error) {
    console.warn("[theme-engine] unable to parse stored theme settings", error);
    return null;
  }
};

const saveSettings = (settings: StoredSettings & { themeMode: ThemeMode }) => {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("[theme-engine] unable to persist theme settings", error);
  }
};

const parseTransitionDuration = (value: string) => value.split(" ")[0] ?? value;
const parseTransitionTiming = (value: string) => {
  const [, ...rest] = value.split(" ");
  return rest.join(" ") || "ease";
};

const buildSurfaceColor = (mode: ThemeName) => {
  if (mode === "dark") {
    return "rgba(28,36,56,0.72)";
  }

  return "rgba(255,255,255,0.58)";
};

const buildMutedSurfaceColor = (mode: ThemeName) => {
  if (mode === "dark") {
    return "rgba(40,54,95,0.52)";
  }

  return "rgba(255,255,255,0.42)";
};

const buildBorderColor = (mode: ThemeName) => {
  if (mode === "dark") {
    return "rgba(255,255,255,0.24)";
  }

  return "rgba(40,54,95,0.18)";
};

const resolveVideoEmbed = (link?: string | null): string | null => {
  if (!link) return null;

  const trimmed = link.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes("youtube") || url.hostname.includes("youtu.be")) {
      const videoId = url.hostname.includes("youtu.be")
        ? url.pathname.replace("/", "")
        : url.searchParams.get("v");

      if (!videoId) return null;

      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}`;
    }

    if (url.hostname.includes("vimeo.com")) {
      const segments = url.pathname.split("/").filter(Boolean);
      const videoId = segments.pop();
      if (!videoId) return null;

      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;
    }
  } catch {
    return null;
  }

  return trimmed;
};

interface ApplyOptions {
  persist?: boolean;
}

export function useThemeEngine() {
  const [initialSettings] = useState<StoredSettings | null>(() =>
    isBrowser ? readStoredSettings() : null,
  );
  const initialCompanyTheme: NormalizedCompanySettings = normalizeCompanySettings(initialSettings);
  const initialThemeMode: ThemeMode = initialCompanyTheme.themeMode ?? "auto";

  const [themeState, setThemeState] = useState<ThemeMode>(() => initialThemeMode);
  const [companyThemeState, setCompanyThemeState] = useState<NormalizedCompanySettings>(
    () => initialCompanyTheme,
  );
  const [loading, setLoading] = useState<boolean>(isBrowser);
  const [saving, setSaving] = useState(false);

  const themeRef = useRef<ThemeMode>(initialThemeMode);
  const companyThemeRef = useRef<NormalizedCompanySettings>(initialCompanyTheme);
  const mounted = isBrowser;

  const setThemeMode = useCallback((mode: ThemeMode) => {
    themeRef.current = mode;
    setThemeState(mode);
  }, []);

  const mergeCompanyTheme = useCallback((partial: Partial<CompanyThemeSettings>) => {
    const next = normalizeCompanySettings({ ...companyThemeRef.current, ...partial });
    companyThemeRef.current = next;
    setCompanyThemeState(next);
    return next;
  }, []);

  const applyThemeVariables = useCallback(
    (
      mode: ThemeMode,
      overrides: Partial<CompanyThemeSettings> = {},
      options: ApplyOptions = {},
    ) => {
      if (!isBrowser) return;

      ensureAnimationInjected();

      const merged = { ...companyThemeRef.current, ...overrides };
      const resolvedMode: ThemeName = mode === "auto" ? getSystemTheme() : mode;

      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(resolvedMode);

      const colors = themeConfig.tokens.colors;
      const theme = themeConfig.themes[resolvedMode];

      const primaryColor = merged.primaryColor || colors.primary;
      const secondaryColor = merged.secondaryColor || colors.secondary;

      root.style.setProperty("--primary", primaryColor);
      root.style.setProperty("--primary-contrast", colors.primaryContrast);
      root.style.setProperty("--secondary", secondaryColor);
      root.style.setProperty("--accent", colors.accent);
      root.style.setProperty("--accent-glow", theme.accentGlow);
      root.style.setProperty("--bg", theme.background);
      root.style.setProperty("--background", theme.background);
      root.style.setProperty("--fg", theme.text);
      root.style.setProperty("--text", theme.text);
      root.style.setProperty("--surface", buildSurfaceColor(resolvedMode));
      root.style.setProperty("--surface-muted", buildMutedSurfaceColor(resolvedMode));
      root.style.setProperty("--surface-elevated", theme.glass);
      root.style.setProperty("--glass", theme.glass);
      root.style.setProperty("--border", buildBorderColor(resolvedMode));
      root.style.setProperty("--border-strong", colors.borderStrong);
      root.style.setProperty("--shadow-soft", colors.shadowSoft);
      root.style.setProperty("--shadow-strong", colors.shadowMedium);
      root.style.setProperty("--motion-color", theme.motionColor);
      root.style.setProperty("--accent-light", theme.accentGlow);

      const { typography, transitions } = themeConfig.tokens;
      root.style.setProperty("--font-display", typography.fontPrimary);
      root.style.setProperty("--font-sans", typography.fontSecondary);
      root.style.setProperty("--lh-base", typography.lineHeightBase);
      root.style.setProperty("--fw-medium", "500");
      root.style.setProperty("--fw-semibold", typography.headingWeight.toString());
      root.style.setProperty("--fw-bold", "700");
      root.style.setProperty("--fw-regular", typography.bodyWeight.toString());
      root.style.setProperty("--motion-duration-short", parseTransitionDuration(transitions.fast));
      root.style.setProperty("--motion-duration-base", parseTransitionDuration(transitions.base));
      root.style.setProperty("--motion-duration-slow", parseTransitionDuration(transitions.slow));
      root.style.setProperty("--motion-ease", parseTransitionTiming(transitions.base));

      const glassMotion = document.querySelector<HTMLElement>(".glass-motion");
      if (glassMotion) {
        const baseCss = themeConfig.animations.translucentSweep.css
          .replace(/rgba\(255,255,255,0\.15\)/g, theme.accentGlow)
          .replace(/rgba\(255,255,255,0\.08\)/g, theme.motionColor);

        glassMotion.style.cssText = `
          ${baseCss}
          mix-blend-mode: overlay;
          opacity: ${resolvedMode === "dark" ? "0.75" : "0.55"};
        `;
      }

      if (options.persist !== false) {
        saveSettings({ ...merged, themeMode: mode });
      }
    },
    [],
  );

  useEffect(() => {
    if (!isBrowser) return;

    applyThemeVariables(themeRef.current, companyThemeRef.current, { persist: false });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeRef.current === "auto") {
        applyThemeVariables("auto", {}, { persist: false });
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [applyThemeVariables]);

  const syncFromServer = useCallback(async () => {
    if (!isBrowser) {
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch("/api/company-settings", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`GET /api/company-settings failed: ${response.statusText}`);
      }

      const payload = (await response.json()) as CompanyThemeSettings;
      const next = mergeCompanyTheme(payload);
      const modeToApply = next.themeMode ?? themeRef.current;

      if (next.themeMode && next.themeMode !== themeRef.current) {
        setThemeMode(next.themeMode);
      }

      applyThemeVariables(modeToApply, next);
      return next;
    } catch (error) {
      console.error("[theme-engine] failed to sync with server", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [applyThemeVariables, mergeCompanyTheme, setThemeMode]);

  const toggleTheme = useCallback(() => {
    const current = themeRef.current === "auto" ? getSystemTheme() : themeRef.current;
    const next: ThemeMode = current === "light" ? "dark" : "light";

    const merged = mergeCompanyTheme({ themeMode: next });
    setThemeMode(next);
    applyThemeVariables(next, merged);
  }, [applyThemeVariables, mergeCompanyTheme, setThemeMode]);

  const updateCompanyTheme = useCallback(
    (settings: Partial<CompanyThemeSettings>) => {
      const nextTheme = mergeCompanyTheme(settings);
      const modeToApply = nextTheme.themeMode ?? themeRef.current;

      if (nextTheme.themeMode && nextTheme.themeMode !== themeRef.current) {
        setThemeMode(nextTheme.themeMode);
      }

      applyThemeVariables(modeToApply, nextTheme);
    },
    [applyThemeVariables, mergeCompanyTheme, setThemeMode],
  );

  const persistCompanyTheme = useCallback(
    async (settings: CompanyThemeSettings) => {
      const normalized = normalizeCompanySettings(settings);

      if (!isBrowser) {
        const next = mergeCompanyTheme(normalized);
        const modeToApply = next.themeMode ?? themeRef.current;
        applyThemeVariables(modeToApply, next);
        return next;
      }

      setSaving(true);
      try {
        const response = await fetch("/api/company-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalized),
        });

        if (!response.ok) {
          throw new Error(`PUT /api/company-settings failed: ${response.statusText}`);
        }

        const payload = (await response.json()) as CompanyThemeSettings;
        const next = mergeCompanyTheme(payload);
        const modeToApply = next.themeMode ?? themeRef.current;

        if (next.themeMode && next.themeMode !== themeRef.current) {
          setThemeMode(next.themeMode);
        }

        applyThemeVariables(modeToApply, next);
        return next;
      } finally {
        setSaving(false);
      }
    },
    [applyThemeVariables, mergeCompanyTheme, setThemeMode],
  );

  const getCompanyVideo = useCallback(() => {
    return resolveVideoEmbed(companyThemeRef.current.videoLink);
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    void syncFromServer();
  }, [syncFromServer]);

  const theme = useMemo(() => themeState, [themeState]);
  const companyTheme = useMemo(() => companyThemeState, [companyThemeState]);

  return {
    mounted,
    loading,
    saving,
    theme,
    companyTheme,
    toggleTheme,
    updateCompanyTheme,
    persistCompanyTheme,
    refreshCompanyTheme: syncFromServer,
    getCompanyVideo,
    setThemeMode,
    applyThemeVariables,
  };
}

export type UseThemeEngineReturn = ReturnType<typeof useThemeEngine>;

export { resolveVideoEmbed as resolveCompanyVideoUrl };
