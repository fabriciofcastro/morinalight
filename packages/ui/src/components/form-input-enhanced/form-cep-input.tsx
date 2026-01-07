"use client";

import { Search } from "lucide-react";
import React, { useState } from "react";
import { FormInput } from "./form-input";
import type { FormCEPInputProps } from "./form-input.types";

/**
 * Formata CEP
 * 00000-000
 */
function _formatCEP(value: string): string {
  const number = value.replace(/\D/g, "");
  return number.replace(/(\d{5})(\d{3})/, "$1-$2");
}

/**
 * FormCEPInput - Input de CEP com máscara e busca
 */
export const FormCEPInput = React.forwardRef<HTMLInputElement, FormCEPInputProps>(
  ({ onCEPFetch, fetchingCEP = false, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      let formatted = rawValue;

      if (rawValue.length > 5) {
        formatted = `${rawValue.slice(0, 5)}-${rawValue.slice(5, 8)}`;
      }

      setInternalValue(formatted);

      e.target.value = formatted;
      onChange?.(e);
    };

    const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
      const rawValue = String(internalValue).replace(/\D/g, "");
      if (rawValue.length === 8 && onCEPFetch) {
        await onCEPFetch(rawValue);
      }
      props.onBlur?.(e);
    };

    const handleFetch = async () => {
      const rawValue = String(internalValue).replace(/\D/g, "");
      if (rawValue.length === 8 && onCEPFetch) {
        await onCEPFetch(rawValue);
      }
    };

    return (
      <FormInput
        ref={ref}
        {...props}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        rightIcon={
          onCEPFetch && String(internalValue).replace(/\D/g, "").length === 8 ? Search : undefined
        }
        onRightIconClick={handleFetch}
        loading={fetchingCEP}
        placeholder="00000-000"
        maxLength={9}
        inputMode="numeric"
      />
    );
  },
);

FormCEPInput.displayName = "FormCEPInput";
