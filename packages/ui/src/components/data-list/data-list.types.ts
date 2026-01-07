import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface DataListProps {
  /** Itens a serem renderizados */
  children: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Número de skeletons */
  skeletonCount?: number;
  /** Estado vazio */
  emptyState?: ReactNode;
  /** Dividir itens com borda */
  divided?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

export interface DataListItemProps {
  /** Conteúdo principal */
  children?: ReactNode;
  /** Ícone ou Avatar à esquerda */
  icon?: LucideIcon | ReactNode;
  /** Título do item */
  title?: ReactNode;
  /** Descrição/Subtítulo */
  description?: ReactNode;
  /** Ações à direita */
  actions?: ReactNode;
  /** Badges ou meta info */
  meta?: ReactNode;
  /** Callback de clique */
  onClick?: () => void;
  /** Se o item está selecionado */
  selected?: boolean;
  /** Classe CSS adicional */
  className?: string;
}
