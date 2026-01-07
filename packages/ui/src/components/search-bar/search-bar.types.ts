import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface SearchBarProps {
  /** Valor da busca */
  value: string;
  /** Callback ao mudar valor */
  onChange: (value: string) => void;
  /** Placeholder */
  placeholder?: string;
  /** Ícone customizado (padrão: Search) */
  icon?: LucideIcon;
  /** Mostrar botão limpar */
  showClear?: boolean;
  /** Callback ao limpar */
  onClear?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Classe CSS adicional */
  className?: string;
  /** Conteúdo adicional à direita */
  rightContent?: ReactNode;
  /** Desabilitado */
  disabled?: boolean;
}
