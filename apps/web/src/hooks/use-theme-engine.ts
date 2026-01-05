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

const hexToHsl = (value: string | undefined | null): string | null => {
  if (!value) return null;
  let hex = value.trim();
  if (!hex) return null;

  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const match = hex.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;

  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
  }

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  const satPercent = Math.round(saturation * 100);
  const lightPercent = Math.round(lightness * 100);

  return `${hue} ${satPercent}% ${lightPercent}%`;
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
  const [loading, setLoading] = useState(false);
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
      root.setAttribute("data-theme", resolvedMode);

      const theme = themeConfig.themes[resolvedMode];
      const cleanTheme = theme.cleanVibrant;
      const { compatibility, typography, transitions } = themeConfig.tokens;

      const primaryHsl = hexToHsl(merged.primaryColor) ?? cleanTheme.primary;
      const secondaryHsl = hexToHsl(merged.secondaryColor) ?? cleanTheme.secondary;

      root.style.setProperty("--bg", cleanTheme.bg);
      root.style.setProperty("--surface", cleanTheme.surface);
      root.style.setProperty("--elevated", cleanTheme.elevated);
      root.style.setProperty("--overlay", cleanTheme.overlay);
      root.style.setProperty("--border", cleanTheme.border);
      root.style.setProperty("--text-1", cleanTheme.text1);
      root.style.setProperty("--text-2", cleanTheme.text2);
      root.style.setProperty("--text-3", cleanTheme.text3);
      root.style.setProperty("--primary", primaryHsl);
      root.style.setProperty("--secondary", secondaryHsl);
      root.style.setProperty("--accent", cleanTheme.accent);
      root.style.setProperty("--success", cleanTheme.success);
      root.style.setProperty("--warning", cleanTheme.warning);
      root.style.setProperty("--danger", cleanTheme.danger);
      root.style.setProperty("--chart-1", cleanTheme.chart1);
      root.style.setProperty("--chart-2", cleanTheme.chart2);
      root.style.setProperty("--chart-3", cleanTheme.chart3);
      root.style.setProperty("--chart-4", cleanTheme.chart4);
      root.style.setProperty("--chart-5", cleanTheme.chart5);
      root.style.setProperty("--bg-gradient", cleanTheme.bgGradient);

      root.style.setProperty("--primary-contrast", compatibility.primaryContrast);
      root.style.setProperty("--secondary-contrast", compatibility.secondaryContrast);

      root.style.setProperty("--bg-color", `hsl(${cleanTheme.bg})`);
      root.style.setProperty("--surface-color", `hsl(${cleanTheme.surface})`);
      root.style.setProperty("--elevated-color", `hsl(${cleanTheme.elevated})`);
      root.style.setProperty("--fg", `hsl(${cleanTheme.text1})`);
      root.style.setProperty("--muted-strong", `hsl(${cleanTheme.text2})`);
      root.style.setProperty("--muted-soft", `hsl(${cleanTheme.text3})`);
      root.style.setProperty("--primary-color", `hsl(${primaryHsl})`);
      root.style.setProperty("--secondary-color", `hsl(${secondaryHsl})`);
      root.style.setProperty("--accent-color", `hsl(${cleanTheme.accent})`);
      root.style.setProperty("--success-color", `hsl(${cleanTheme.success})`);
      root.style.setProperty("--warning-color", `hsl(${cleanTheme.warning})`);
      root.style.setProperty("--danger-color", `hsl(${cleanTheme.danger})`);
      root.style.setProperty("--border-color", `hsl(${cleanTheme.border})`);

      root.style.setProperty("--shadow-soft", compatibility.shadows.soft);
      root.style.setProperty("--shadow-strong", compatibility.shadows.strong);

      root.style.setProperty("--font-display", typography.fontPrimary);
      root.style.setProperty("--font-sans", typography.fontSecondary);
      root.style.setProperty("--fw-semibold", typography.headingWeight.toString());
      root.style.setProperty("--fw-regular", typography.bodyWeight.toString());
      root.style.setProperty("--motion-duration-short", parseTransitionDuration(transitions.fast));
      root.style.setProperty("--motion-duration-base", parseTransitionDuration(transitions.base));
      root.style.setProperty("--motion-duration-slow", parseTransitionDuration(transitions.slow));
      root.style.setProperty("--motion-ease", parseTransitionTiming(transitions.base));
      root.setAttribute("data-profile", "web");
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
      return null;
    }

    try {
      const response = await fetch("/api/company-settings", { cache: "no-store" });

      if (!response.ok) {
        // Don't throw - fail silently and use defaults
        console.warn(`[theme-engine] company-settings returned ${response.status}, using defaults`);
        return null;
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
      // Silent fallback - log but don't break the app
      console.info("[theme-engine] failed to sync with server, using local defaults", error);
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
          // Don't throw - just warn and use local state
          console.warn(`[theme-engine] persist failed with ${response.status}, using local state`);
          const next = mergeCompanyTheme(normalized);
          const modeToApply = next.themeMode ?? themeRef.current;
          applyThemeVariables(modeToApply, next);
          return next;
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
        // Silent fallback - log but still apply local changes
        console.info("[theme-engine] persist error, applying locally", error);
        const next = mergeCompanyTheme(normalized);
        const modeToApply = next.themeMode ?? themeRef.current;
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
    setLoading(true);
    void syncFromServer().finally(() => {
      setLoading(false);
    });
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
