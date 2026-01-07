"use client";

import React, { useState } from "react";
import { FormInput } from "./form-input";
import type { FormCurrencyInputProps } from "./form-input.types";

/**
 * FormCurrencyInput - Input de moeda
 */
export const FormCurrencyInput = React.forwardRef<HTMLInputElement, FormCurrencyInputProps>(
  ({ currency = "BRL", allowNegative = false, value, onChange, ...props }, ref) => {
    // Assuming value passed in is a number or string representing a number
    // We need to format it for display

    const formatCurrency = (val: string | number) => {
      if (!val) return "";
      const numberVal = typeof val === "string" ? parseFloat(val.replace(/[^\d.-]/g, "")) : val;
      if (Number.isNaN(numberVal)) return "";

      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency,
      }).format(numberVal);
    };

    const [displayValue, setDisplayValue] = useState(formatCurrency(value as string | number));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      const numberValue = Number(rawValue) / 100;

      if (Number.isNaN(numberValue)) {
        setDisplayValue("");
        // Here we would need to determine how to bubble up the change.
        // Ideally passing the raw number value up.
        // For now, we will update with the raw value attached to the event.
        const syntheticEvent = { ...e, target: { ...e.target, value: "" } };
        onChange?.(syntheticEvent as any);
        return;
      }

      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency,
      }).format(numberValue);

      setDisplayValue(formatted);

      // We pass the raw number as the value to the parent
      // Note: This might conflict with standard HTML input behavior expecting string
      // But for controlled components in React it's often handled this way or by passing separate callbacks.
      // To adhere to strict HTMLInputElement interface we pass the formatted string
      // But usually libraries prefer the raw value.
      // Let's pass the formatted string to be standard, but maybe later we add an onValueChange prop.
      e.target.value = formatted;
      onChange?.(e);
    };

    // Initial format effect if needed, but useState init covers it.

    return (
      <FormInput
        ref={ref}
        {...props}
        value={displayValue}
        onChange={handleChange}
        placeholder="R$ 0,00"
        inputMode="numeric"
      />
    );
  },
);

FormCurrencyInput.displayName = "FormCurrencyInput";
