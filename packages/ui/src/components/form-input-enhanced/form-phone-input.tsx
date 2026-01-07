"use client";

import React, { useState } from "react";
import { FormInput } from "./form-input";
import type { FormPhoneInputProps } from "./form-input.types";

/**
 * Formata telefone
 * (11) 99999-9999 ou (11) 3333-3333
 */
function _formatPhone(value: string): string {
  const number = value.replace(/\D/g, "");

  if (number.length <= 10) {
    return number.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else {
    return number.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
}

/**
 * FormPhoneInput - Input de telefone com máscara
 */
export const FormPhoneInput = React.forwardRef<HTMLInputElement, FormPhoneInputProps>(
  ({ format = "auto", value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      let formatted = rawValue;

      if (rawValue.length > 0) {
        if (rawValue.length <= 2) {
          formatted = `(${rawValue}`;
        } else if (rawValue.length <= 6) {
          formatted = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2)}`;
        } else if (rawValue.length <= 10) {
          formatted = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 6)}-${rawValue.slice(6)}`;
        } else {
          // Mobile (11 digits)
          formatted = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 7)}-${rawValue.slice(7, 11)}`;
        }
      }

      // Limit length based on format
      const maxLength = 15; // (11) 99999-9999
      if (formatted.length > maxLength) {
        formatted = formatted.slice(0, maxLength);
      }

      setInternalValue(formatted);

      // Update event value and call original onChange
      e.target.value = formatted;
      onChange?.(e);
    };

    return (
      <FormInput
        ref={ref}
        {...props}
        value={internalValue}
        onChange={handleChange}
        placeholder="(00) 00000-0000"
        maxLength={15}
        inputMode="tel"
      />
    );
  },
);

FormPhoneInput.displayName = "FormPhoneInput";
