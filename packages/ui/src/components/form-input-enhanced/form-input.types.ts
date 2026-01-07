import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export type ValidationState = "default" | "valid" | "invalid" | "pending";

export interface FormInputBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label do campo */
  label: string;
  /** Campo obrigatório */
  required?: boolean;
  /** Mensagem de erro */
  error?: string;
  /** Mensagem de ajuda */
  helpText?: string;
  /** Ícone à esquerda */
  leftIcon?: LucideIcon;
  /** Ícone à direita */
  rightIcon?: LucideIcon;
  /** Callback do ícone direito */
  onRightIconClick?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Tamanho do campo */
  size?: "sm" | "md" | "lg";
  /** Estado de validação */
  validationState?: ValidationState;
}

export interface FormDocumentInputProps extends Omit<FormInputBaseProps, "type"> {
  /** Callback ao buscar CNPJ */
  onCNPJFetch?: (cnpj: string) => Promise<void>;
  /** Loading state da busca */
  fetchingCNPJ?: boolean;
}

export interface FormPhoneInputProps extends Omit<FormInputBaseProps, "type"> {
  /** Formato: celular (11 dígitos) ou fixo (10 dígitos) */
  format?: "mobile" | "landline" | "auto";
}

export interface FormCEPInputProps extends Omit<FormInputBaseProps, "type"> {
  /** Callback ao buscar CEP */
  onCEPFetch?: (cep: string) => Promise<void>;
  /** Loading state da busca */
  fetchingCEP?: boolean;
}

export interface FormCurrencyInputProps extends Omit<FormInputBaseProps, "type"> {
  /** Moeda */
  currency?: "BRL" | "USD" | "EUR";
  /** Permitir valores negativos */
  allowNegative?: boolean;
}
