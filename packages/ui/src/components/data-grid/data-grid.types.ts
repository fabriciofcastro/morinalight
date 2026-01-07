import type { ReactNode } from "react";

export interface DataGridProps {
  /** Itens a serem renderizados */
  children: ReactNode;
  /** Número de colunas (responsivo) */
  columns?: {
    mobile?: 1 | 2;
    tablet?: 2 | 3;
    desktop?: 3 | 4;
    wide?: 4 | 5;
  };
  /** Gap entre itens (token de espaçamento) */
  gap?: "sm" | "md" | "lg";
  /** Loading state */
  loading?: boolean;
  /** Número de skeletons para mostrar no loading */
  skeletonCount?: number;
  /** Estado vazio (quando sem children) */
  emptyState?: ReactNode;
  /** Classe CSS adicional */
  className?: string;
}

export interface DataGridItemProps {
  children: ReactNode;
  /** Animação de entrada customizada */
  animationDelay?: number;
  /** Classe CSS adicional */
  className?: string;
}
