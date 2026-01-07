import type { LucideIcon } from "lucide-react";

export type StatVariant = "primary" | "success" | "warning" | "danger" | "info" | "secondary";

export interface StatCardProps {
  /** Ícone do card */
  icon: LucideIcon;
  /** Label da métrica */
  label: string;
  /** Valor da métrica */
  value: number | string;
  /** Variante de cor */
  variant: StatVariant;
  /** Informação adicional */
  subtitle?: string;
  /** Classe CSS adicional */
  className?: string;
  /** Callback ao clicar */
  onClick?: () => void;
}

export interface StatCardCircularProps extends StatCardProps {
  /** Mostrar progress circular */
  showProgress: true;
  /** Valor máximo para progress */
  maxValue: number;
}

export interface StatCardLinearProps extends StatCardProps {
  /** Mostrar progress linear */
  showProgress: true;
  /** Valor máximo para progress */
  maxValue: number;
  /** Tipo de progress */
  progressType: "linear";
}
