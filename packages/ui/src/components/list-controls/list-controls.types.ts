import type { ReactNode } from "react";

export interface ListControlsProps {
  /** Valor da busca */
  searchValue: string;
  /** Callback da busca */
  onSearchChange: (value: string) => void;
  /** Placehoder da busca */
  searchPlaceholder?: string;
  /** Estado de loading */
  loading?: boolean;
  /** Botão de filtros */
  filterButton?: ReactNode;
  /** Toggle de visualização (grid/list) */
  viewToggle?: ReactNode;
  /** Ações principais (Botão Novo, etc) */
  actions?: ReactNode;
  /** Bulk actions quando houver seleção */
  bulkActions?: ReactNode;
  /** Tem itens selecionados? */
  hasSelection?: boolean;
  /** Classe CSS adicional */
  className?: string;
}
