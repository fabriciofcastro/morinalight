import type { LucideIcon } from "lucide-react";

export type ViewMode = "grid" | "list";

export interface ViewToggleProps {
  /** Modo atual */
  value: ViewMode;
  /** Callback ao mudar modo */
  onChange: (mode: ViewMode) => void;
  /** Ícone para grid (padrão: Grid) */
  gridIcon?: LucideIcon;
  /** Ícone para list (padrão: List) */
  listIcon?: LucideIcon;
  /** Classe CSS adicional */
  className?: string;
  /** Desabilitado */
  disabled?: boolean;
}
