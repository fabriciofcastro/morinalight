import { useCallback, useEffect, useState } from "react";
import type { CinematicOption, CinematicPreference } from "../components/CinematicPresetPanel/CinematicPresetPanel.types";

export const CINEMATIC_OPTIONS: CinematicOption[] = [
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
  {
    label: "Clean",
    value: "clean",
    description: "Menos distração, mantendo identidade Morina.",
  },
  {
    label: "Desligado",
    value: "off",
    description: "Remove os overlays cinematográficos.",
  },
];

const STORAGE_KEY = "cinematic_preset";
const CHANGE_EVENT = "cinematic_preset_changed";

export function useCinematicPreset() {
  const [value, setValue] = useState<CinematicPreference>("auto");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as CinematicPreference | null;
      if (saved && ["auto", "on", "clean", "off"].includes(saved)) {
        queueMicrotask(() => setValue(saved));
      }
    } catch (e) {
      console.error("Failed to load cinematic preset", e);
    }
  }, []);

  const updatePreset = useCallback((next: CinematicPreference) => {
    setValue(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch (e) {
      console.error("Failed to save cinematic preset", e);
    }
  }, []);

  const currentOption = CINEMATIC_OPTIONS.find((o) => o.value === value) || CINEMATIC_OPTIONS[0]!;

  return {
    value,
    updatePreset,
    currentOption,
    options: CINEMATIC_OPTIONS,
  };
}
