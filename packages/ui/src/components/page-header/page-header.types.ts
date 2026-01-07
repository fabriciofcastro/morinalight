import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  /** Ícone da página */
  icon?: LucideIcon;
  /** Título da página */
  title: string;
  /** Descrição da página */
  description?: string;
  /** Breadcrumbs */
  breadcrumbs?: BreadcrumbItem[];
  /** Ações (botões) no header */
  actions?: ReactNode;
  /** Stats cards no header */
  stats?: ReactNode;
  /** Classe CSS adicional */
  className?: string;
}
