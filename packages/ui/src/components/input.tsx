"use client";

import type { VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../lib/cn";
import type { ValidationState } from "../theme/validation-tokens";
import { inputVariants } from "./input-variants";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  validationState?: ValidationState;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", validationState, size, ...props }, ref) => {
    // Classes baseadas no estado de validação
    const validationClasses = {
      valid:
        "border-[hsl(158,72%,35%)] focus:border-[hsl(158,72%,35%)] focus:shadow-[0_0_0_1px_hsl(158,72%,35%/0.60),0_0_26px_-14px_hsl(158,72%,35%/0.45)]",
      invalid:
        "border-[hsl(0,82%,45%)] focus:border-[hsl(0,82%,45%)] focus:shadow-[0_0_0_1px_hsl(0,82%,45%/0.60),0_0_26px_-14px_hsl(0,82%,45%/0.45)]",
      pending:
        "border-[hsl(45,100%,45%)] focus:border-[hsl(45,100%,45%)] focus:shadow-[0_0_0_1px_hsl(45,100%,45%/0.60),0_0_26px_-14px_hsl(45,100%,45%/0.45)]",
      default: "",
    };

    return (
      <input
        type={type}
        className={cn(
          inputVariants({ size }),
          // Validation styles are applied on top of base styles for borders/shadows
          validationState === "default" || !validationState
            ? "focus:border-[hsl(var(--primary))] focus:shadow-[0_0_0_1px_hsl(var(--primary)/0.60),0_0_26px_-14px_hsl(var(--primary)/0.45)]"
            : validationClasses[validationState],
          className,
        )}
        ref={ref}
        aria-invalid={validationState === "invalid" ? true : undefined}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
