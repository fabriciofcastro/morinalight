"use client";

import { GlassCard, Label } from "@morina/ui";
import { useEffect, useState } from "react";

type CinematicPreference = "auto" | "on" | "clean" | "off";

const OPTIONS: Array<{ label: string; value: CinematicPreference; description: string }> = [
  {
    label: "Automático",
    value: "auto",
    description: "Segue o padrão do sistema (clean em /settings e /admin; cinematic no restante).",
  },
  {
    label: "Cinematic",
    value: "on",
    description: "Efeitos completos (noise, glow, scanlines e vignette).",
  },
  { label: "Clean", value: "clean", description: "Menos distração, mantendo identidade Morina." },
  { label: "Desligado", value: "off", description: "Remove os overlays cinematográficos." },
];

export function CinematicPresetPanel() {
  const [value, setValue] = useState<CinematicPreference>("auto");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("cinematic_preset") as CinematicPreference | null;
      if (saved === "auto" || saved === "on" || saved === "clean" || saved === "off") {
        setValue(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  function update(next: CinematicPreference) {
    setValue(next);
    try {
      window.localStorage.setItem("cinematic_preset", next);
      window.dispatchEvent(new Event("cinematic_preset_changed"));
    } catch {
      // ignore
    }
  }

  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <GlassCard glow className="bg-[color-mix(in oklab,var(--surface-color) 94%,transparent)]/70">
      <header className="flex flex-col gap-(--space-2)">
        <span className="text-(--fs-xs) uppercase tracking-(--tracking-wide) text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          Aparência
        </span>
        <h2 className="text-(--fs-xl) font-semibold leading-(--lh-tight)">
          Modo Cinematic do Cockpit
        </h2>
        <p className="text-(--fs-sm) leading-(--lh-base) text-[color-mix(in oklab,var(--muted-soft) 72%,var(--fg) 28%)]">
          Controle os overlays do fundo (noise, scanlines, glow e vignette) sem perder performance.
        </p>
      </header>

      <div className="mt-(--space-5) grid gap-(--space-3)">
        <Label htmlFor="cinematic_preset">Preset</Label>
        <select
          id="cinematic_preset"
          className="rounded-(--r-md) border border-[color-mix(in oklab,var(--border-color) 82%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)] p-(--space-3) text-(--fs-sm) outline-none transition focus:border-[color-mix(in oklab,var(--primary-color) 50%,transparent)] focus:shadow-[0_0_0_2px_rgba(40,85,255,0.25)]"
          value={value}
          onChange={(e) => update(e.target.value as CinematicPreference)}
        >
          {OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-(--fs-xs) text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
          {current.description}
        </p>
      </div>
    </GlassCard>
  );
}
