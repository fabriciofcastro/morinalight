export type CinematicPreference = "auto" | "on" | "clean" | "off";

export interface CinematicOption {
  label: string;
  value: CinematicPreference;
  description: string;
}

export interface CinematicPresetPanelProps {
  className?: string;
}
