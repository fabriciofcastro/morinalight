"use client";

import { useState, useCallback, useMemo } from "react";
import { Palette, Eye, Sparkles, Layers, Type, Zap, Monitor, Moon, Sun, Droplet } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";
import { AdvancedLogoUpload } from "./AdvancedLogoUpload";
import { ThemePreview } from "./ThemePreview";

interface ThemeColors {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  cardColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
}

interface ThemeGradient {
  from: string;
  to: string;
  direction: "to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl";
}

interface AdvancedThemeData {
  colors: ThemeColors;
  gradient?: ThemeGradient;
  fontFamily?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  shadowIntensity: "none" | "sm" | "md" | "lg" | "xl";
  glassMorphism: boolean;
  blurIntensity: number;
  darkMode: boolean;
  autoDarkMode: boolean;
  animationsEnabled: boolean;
  animationSpeed: "slow" | "normal" | "fast";
  layoutStyle: "modern" | "classic" | "minimal" | "corporate";
  sidebarStyle: "default" | "compact" | "floating";
  logos?: {
    main?: string | null;
    light?: string | null;
    dark?: string | null;
    favicon?: string | null;
    icon?: string | null;
    watermark?: string | null;
    banner?: string | null;
    thumbnail?: string | null;
  };
}

interface AdvancedThemeEditorProps {
  value?: Partial<AdvancedThemeData>;
  onChange?: (value: AdvancedThemeData) => void;
  className?: string;
}

const PRESET_THEMES = {
  modern: {
    primaryColor: "#5b8aff",
    secondaryColor: "#9c27b0",
    accentColor: "#00d4ff",
    successColor: "#10b981",
    warningColor: "#f59e0b",
    errorColor: "#ef4444",
    infoColor: "#3b82f6",
  },
  corporate: {
    primaryColor: "#1e40af",
    secondaryColor: "#7c3aed",
    accentColor: "#06b6d4",
    successColor: "#059669",
    warningColor: "#d97706",
    errorColor: "#dc2626",
    infoColor: "#2563eb",
  },
  minimal: {
    primaryColor: "#000000",
    secondaryColor: "#6b7280",
    accentColor: "#9ca3af",
    successColor: "#10b981",
    warningColor: "#f59e0b",
    errorColor: "#ef4444",
    infoColor: "#3b82f6",
  },
  vibrant: {
    primaryColor: "#ff006e",
    secondaryColor: "#8338ec",
    accentColor: "#3a86ff",
    successColor: "#06ffa5",
    warningColor: "#ffbe0b",
    errorColor: "#fb5607",
    infoColor: "#00d4ff",
  },
};

export function AdvancedThemeEditor({
  value,
  onChange,
  className,
}: AdvancedThemeEditorProps) {
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "effects" | "layout" | "logos">("colors");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const themeData: AdvancedThemeData = useMemo(
    () => ({
      colors: {
        primaryColor: value?.colors?.primaryColor || PRESET_THEMES.modern.primaryColor,
        secondaryColor: value?.colors?.secondaryColor || PRESET_THEMES.modern.secondaryColor,
        accentColor: value?.colors?.accentColor || PRESET_THEMES.modern.accentColor,
        successColor: value?.colors?.successColor || PRESET_THEMES.modern.successColor,
        warningColor: value?.colors?.warningColor || PRESET_THEMES.modern.warningColor,
        errorColor: value?.colors?.errorColor || PRESET_THEMES.modern.errorColor,
        infoColor: value?.colors?.infoColor || PRESET_THEMES.modern.infoColor,
        backgroundColor: value?.colors?.backgroundColor || "#09090b",
        surfaceColor: value?.colors?.surfaceColor || "#121212",
        cardColor: value?.colors?.cardColor || "#1a1a1a",
        textPrimaryColor: value?.colors?.textPrimaryColor || "#ffffff",
        textSecondaryColor: value?.colors?.textSecondaryColor || "#a1a1aa",
      },
      gradient: value?.gradient,
      fontFamily: value?.fontFamily || "Inter",
      headingFont: value?.headingFont || "DM Sans",
      bodyFont: value?.bodyFont || "Inter",
      borderRadius: value?.borderRadius || "lg",
      shadowIntensity: value?.shadowIntensity || "md",
      glassMorphism: value?.glassMorphism ?? true,
      blurIntensity: value?.blurIntensity || 20,
      darkMode: value?.darkMode ?? false,
      autoDarkMode: value?.autoDarkMode ?? false,
      animationsEnabled: value?.animationsEnabled ?? true,
      animationSpeed: value?.animationSpeed || "normal",
      layoutStyle: value?.layoutStyle || "modern",
      sidebarStyle: value?.sidebarStyle || "default",
      logos: value?.logos || {},
    }),
    [value],
  );

  const updateColor = useCallback(
    (key: keyof ThemeColors, color: string) => {
      const newColors = { ...themeData.colors, [key]: color };
      onChange?.({ ...themeData, colors: newColors });
    },
    [themeData, onChange],
  );

  const applyPreset = useCallback(
    (presetName: keyof typeof PRESET_THEMES) => {
      setSelectedPreset(presetName);
      const preset = PRESET_THEMES[presetName];
      const newColors = { ...themeData.colors, ...preset };
      onChange?.({ ...themeData, colors: newColors });
    },
    [themeData, onChange],
  );

  const tabs = [
    { id: "colors", label: "Cores", icon: Palette },
    { id: "typography", label: "Tipografia", icon: Type },
    { id: "effects", label: "Efeitos", icon: Sparkles },
    { id: "layout", label: "Layout", icon: Layers },
    { id: "logos", label: "Logos", icon: Eye },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Palette className="h-5 w-5 text-[hsl(var(--primary))]" />
          Editor de Tema Avançado
        </h3>
        <p className="text-sm text-zinc-400">
          Personalize completamente a identidade visual do sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "text-[hsl(var(--primary))] border-[hsl(var(--primary))]"
                  : "text-zinc-400 border-transparent hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 inline mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo das Tabs */}
      <div className="min-h-[400px]">
        {activeTab === "colors" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Presets */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Temas Pré-definidos
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.keys(PRESET_THEMES).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset as keyof typeof PRESET_THEMES)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left",
                      selectedPreset === preset
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                        : "border-white/10 bg-white/5 hover:border-white/20",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: PRESET_THEMES[preset as keyof typeof PRESET_THEMES].primaryColor }}
                      />
                      <span className="font-semibold text-white capitalize">{preset}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cores Principais */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white">Cores Principais</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(themeData.colors).map(([key, color]) => {
                  if (key.includes("Color") && color) {
                    return (
                      <div key={key} className="space-y-2">
                        <label className="block text-xs text-zinc-400 capitalize">
                          {key.replace("Color", "").replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => updateColor(key as keyof ThemeColors, e.target.value)}
                            className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => updateColor(key as keyof ThemeColors, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                          />
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Gradiente */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Gradiente Primário
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs text-zinc-400">Cor Inicial</label>
                  <input
                    type="color"
                    value={themeData.gradient?.from || "#5b8aff"}
                    onChange={(e) =>
                      onChange?.({
                        ...themeData,
                        gradient: { ...themeData.gradient, from: e.target.value } as ThemeGradient,
                      })
                    }
                    className="w-full h-12 rounded-lg border border-white/10 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs text-zinc-400">Cor Final</label>
                  <input
                    type="color"
                    value={themeData.gradient?.to || "#9c27b0"}
                    onChange={(e) =>
                      onChange?.({
                        ...themeData,
                        gradient: { ...themeData.gradient, to: e.target.value } as ThemeGradient,
                      })
                    }
                    className="w-full h-12 rounded-lg border border-white/10 cursor-pointer"
                  />
                </div>
              </div>
              <div className="h-24 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center"
                style={{
                  background: `linear-gradient(${themeData.gradient?.direction || "to-r"}, ${themeData.gradient?.from || "#5b8aff"}, ${themeData.gradient?.to || "#9c27b0"})`,
                }}
              >
                <span className="text-white/60 text-sm">Preview do Gradiente</span>
              </div>

              {/* Preview do Tema */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <ThemePreview theme={themeData} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "typography" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Fonte Principal</label>
                <select
                  value={themeData.fontFamily}
                  onChange={(e) => onChange?.({ ...themeData, fontFamily: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                >
                  <option value="Inter">Inter</option>
                  <option value="DM Sans">DM Sans</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Fonte de Títulos</label>
                <select
                  value={themeData.headingFont}
                  onChange={(e) => onChange?.({ ...themeData, headingFont: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                >
                  <option value="DM Sans">DM Sans</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Fonte do Corpo</label>
                <select
                  value={themeData.bodyFont}
                  onChange={(e) => onChange?.({ ...themeData, bodyFont: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                >
                  <option value="Inter">Inter</option>
                  <option value="DM Sans">DM Sans</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "effects" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white">Border Radius</label>
                <select
                  value={themeData.borderRadius}
                  onChange={(e) =>
                    onChange?.({ ...themeData, borderRadius: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                >
                  <option value="none">Nenhum</option>
                  <option value="sm">Pequeno</option>
                  <option value="md">Médio</option>
                  <option value="lg">Grande</option>
                  <option value="xl">Extra Grande</option>
                  <option value="2xl">2X Grande</option>
                  <option value="full">Completo</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white">Intensidade de Sombra</label>
                <select
                  value={themeData.shadowIntensity}
                  onChange={(e) =>
                    onChange?.({ ...themeData, shadowIntensity: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                >
                  <option value="none">Nenhuma</option>
                  <option value="sm">Pequena</option>
                  <option value="md">Média</option>
                  <option value="lg">Grande</option>
                  <option value="xl">Extra Grande</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Glass Morphism
                </label>
                <button
                  type="button"
                  onClick={() => onChange?.({ ...themeData, glassMorphism: !themeData.glassMorphism })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border transition-all",
                    themeData.glassMorphism
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-white"
                      : "border-white/10 bg-white/5 text-zinc-400",
                  )}
                >
                  {themeData.glassMorphism ? "Ativado" : "Desativado"}
                </button>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white">
                  Intensidade do Blur: {themeData.blurIntensity}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={themeData.blurIntensity}
                  onChange={(e) =>
                    onChange?.({ ...themeData, blurIntensity: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "layout" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white">Estilo de Layout</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["modern", "classic", "minimal", "corporate"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => onChange?.({ ...themeData, layoutStyle: style })}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-left capitalize",
                        themeData.layoutStyle === style
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                          : "border-white/10 bg-white/5 hover:border-white/20",
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white">Estilo da Sidebar</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["default", "compact", "floating"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => onChange?.({ ...themeData, sidebarStyle: style })}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-left capitalize",
                        themeData.sidebarStyle === style
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                          : "border-white/10 bg-white/5 hover:border-white/20",
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Modo Escuro
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onChange?.({ ...themeData, darkMode: false, autoDarkMode: false })}
                    className={cn(
                      "flex-1 p-4 rounded-lg border-2 transition-all",
                      !themeData.darkMode && !themeData.autoDarkMode
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                        : "border-white/10 bg-white/5",
                    )}
                  >
                    <Sun className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs">Claro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange?.({ ...themeData, darkMode: true, autoDarkMode: false })}
                    className={cn(
                      "flex-1 p-4 rounded-lg border-2 transition-all",
                      themeData.darkMode && !themeData.autoDarkMode
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                        : "border-white/10 bg-white/5",
                    )}
                  >
                    <Moon className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs">Escuro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange?.({ ...themeData, autoDarkMode: true })}
                    className={cn(
                      "flex-1 p-4 rounded-lg border-2 transition-all",
                      themeData.autoDarkMode
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                        : "border-white/10 bg-white/5",
                    )}
                  >
                    <Monitor className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs">Auto</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "logos" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdvancedLogoUpload
                label="Logo Principal"
                description="Logo principal da empresa"
                value={themeData.logos?.main || null}
                onChange={(value) =>
                  onChange?.({
                    ...themeData,
                    logos: { ...themeData.logos, main: value || null },
                  })
                }
              />
              <AdvancedLogoUpload
                label="Logo Claro"
                description="Logo para tema claro"
                value={themeData.logos?.light || null}
                onChange={(value) =>
                  onChange?.({
                    ...themeData,
                    logos: { ...themeData.logos, light: value || null },
                  })
                }
              />
              <AdvancedLogoUpload
                label="Logo Escuro"
                description="Logo para tema escuro"
                value={themeData.logos?.dark || null}
                onChange={(value) =>
                  onChange?.({
                    ...themeData,
                    logos: { ...themeData.logos, dark: value || null },
                  })
                }
              />
              <AdvancedLogoUpload
                label="Favicon"
                description="Ícone do navegador (16x16 ou 32x32px)"
                value={themeData.logos?.favicon || null}
                onChange={(value) =>
                  onChange?.({
                    ...themeData,
                    logos: { ...themeData.logos, favicon: value || null },
                  })
                }
                maxSize={100 * 1024} // 100KB para favicon
                aspectRatio={{ min: 0.9, max: 1.1 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

