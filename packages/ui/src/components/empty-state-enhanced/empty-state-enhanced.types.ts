import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  /** Ícone principal */
  icon: LucideIcon;
  /** Título */
  title: string;
  /** Descrição */
  description?: string;
  /** Ações (botões) */
  actions?: ReactNode;
  /** Animação do ícone */
  animateIcon?: boolean;
  /** Classe CSS adicional */
  className?: string;
}
