"use client";

import { Search } from "lucide-react";
import React, { useState } from "react";
import { FormInput } from "./form-input";
import type { FormDocumentInputProps } from "./form-input.types";

/**
 * Valida CPF
 */
function validateCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, "");
  if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number(cpfLimpo.charAt(i)) * (10 - i);
  }
  let digito = 11 - (soma % 11);
  if (digito >= 10) digito = 0;
  if (digito !== Number(cpfLimpo.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(cpfLimpo.charAt(i)) * (11 - i);
  }
  digito = 11 - (soma % 11);
  if (digito >= 10) digito = 0;
  return digito === Number(cpfLimpo.charAt(10));
}

/**
 * Valida CNPJ
 */
function validateCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14 || /^(\d)\1+$/.test(cnpjLimpo)) return false;

  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === Number(digitos.charAt(1));
}

/**
 * Formata CPF
 */
function formatCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, "");
  if (cpfLimpo.length <= 11) {
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cpf;
}

/**
 * Formata CNPJ
 */
function formatCNPJ(cnpj: string): string {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length <= 14) {
    return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return cnpj;
}

/**
 * FormDocumentInput - Input de CPF/CNPJ com validação e busca
 *
 * @example
 * ```tsx
 * <FormDocumentInput
 *   label="CPF/CNPJ"
 *   value={documento}
 *   onChange={(e) => setDocumento(e.target.value)}
 *   onCNPJFetch={async (cnpj) => {
 *     const data = await buscarCNPJ(cnpj);
 *     setNome(data.nome);
 *   }}
 * />
 * ```
 */
export const FormDocumentInput = React.forwardRef<HTMLInputElement, FormDocumentInputProps>(
  ({ onCNPJFetch, fetchingCNPJ = false, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(value || "");
    const [validationState, setValidationState] = useState<"default" | "valid" | "invalid">(
      "default",
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      let formatted = "";

      if (rawValue.length <= 11) {
        formatted = formatCPF(rawValue);
      } else {
        formatted = formatCNPJ(rawValue);
      }

      setInternalValue(formatted);

      // Validar
      const isValid =
        rawValue.length === 11
          ? validateCPF(rawValue)
          : rawValue.length === 14
            ? validateCNPJ(rawValue)
            : false;

      setValidationState(isValid ? "valid" : rawValue.length > 0 ? "invalid" : "default");

      // Chamar onChange original
      onChange?.(e);
    };

    const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
      const rawValue = String(internalValue).replace(/\D/g, "");
      if (rawValue.length === 14 && validateCNPJ(rawValue) && onCNPJFetch) {
        await onCNPJFetch(rawValue);
      }
      props.onBlur?.(e);
    };

    const handleFetch = async () => {
      const rawValue = String(internalValue).replace(/\D/g, "");
      if (rawValue.length === 14 && onCNPJFetch) {
        await onCNPJFetch(rawValue);
      }
    };

    return (
      <FormInput
        ref={ref}
        {...props}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        validationState={validationState}
        rightIcon={
          onCNPJFetch && String(internalValue).replace(/\D/g, "").length === 14 ? Search : undefined
        }
        onRightIconClick={handleFetch}
        loading={fetchingCNPJ}
        placeholder="000.000.000-00 ou 00.000.000/0000-00"
        maxLength={18}
      />
    );
  },
);

FormDocumentInput.displayName = "FormDocumentInput";
