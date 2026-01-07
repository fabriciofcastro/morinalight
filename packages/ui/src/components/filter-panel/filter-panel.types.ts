import type { ReactNode } from "react";

export interface FilterPanelProps {
  /** Panel está aberto */
  isOpen: boolean;
  /** Callback ao alternar */
  onToggle: () => void;
  /** Callback ao limpar filtros */
  onClear?: () => void;
  /** Callback ao aplicar filtros */
  onApply?: () => void;
  /** Conteúdo do panel (inputs de filtro) */
  children: ReactNode;
  /** Título do panel */
  title?: string;
  /** Classe CSS adicional */
  className?: string;
}
