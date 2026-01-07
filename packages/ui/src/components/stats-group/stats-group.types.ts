import type { ReactNode } from "react";

export type StatsLayout = "horizontal" | "grid-2" | "grid-3" | "grid-4";

export interface StatsGroupProps {
  /** Conteúdo (StatCards) */
  children: ReactNode;
  /** Layout do grupo */
  layout?: StatsLayout;
  /** Mostrar separadores verticais (apenas para horizontal) */
  showSeparators?: boolean;
  /** Classe CSS adicional */
  className?: string;
}
