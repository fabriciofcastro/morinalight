"use client";

import { useCinematicPreset } from "@/presentation/hooks/use-cinematic-preset";
import { GlassCard, Label, cn } from "@morina/ui";
import {
    descriptionStyles,
    fieldGroupStyles,
    headerStyles,
    helpTextStyles,
    labelStyles,
    panelStyles,
    selectStyles,
    titleStyles,
} from "./CinematicPresetPanel.styles";
import type { CinematicPresetPanelProps } from "./CinematicPresetPanel.types";

/**
 * CinematicPresetPanel Component
 * 
 * Responsável por permitir que o usuário escolha o preset visual do cockpit.
 * Utiliza o hook useCinematicPreset para gerenciar o estado e persistência.
 */
export function CinematicPresetPanel({ className }: CinematicPresetPanelProps) {
  const { value, updatePreset, currentOption, options } = useCinematicPreset();

  return (
    <GlassCard 
      glow 
      className={cn(panelStyles(), className)}
    >
      <header className={headerStyles()}>
        <span className={labelStyles()}>
          Aparência
        </span>
        <h2 className={titleStyles()}>
          Modo Cinematic do Cockpit
        </h2>
        <p className={descriptionStyles()}>
          Controle os overlays do fundo (noise, scanlines, glow e vignette) sem perder performance.
        </p>
      </header>

      <div className={fieldGroupStyles()}>
        <Label htmlFor="cinematic_preset">Preset</Label>
        <select
          id="cinematic_preset"
          className={selectStyles()}
          value={value}
          onChange={(e) => updatePreset(e.target.value as any)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className={helpTextStyles()}>
          {currentOption.description}
        </p>
      </div>
    </GlassCard>
  );
}
