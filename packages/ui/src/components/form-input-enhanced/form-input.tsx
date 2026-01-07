"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import React, { useId, useState } from "react";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { semanticTokens } from "../../theme/semantic-tokens";
import type { FormInputBaseProps, ValidationState } from "./form-input.types";

/**
 * Obtém os estilos de validação baseados nos tokens
 */
function getValidationStyles(state: ValidationState) {
  const validation = designTokens.validation[state];
  // Usar tema dark por padrão (pode ser obtido de um ThemeContext no futuro)
  return validation.dark;
}

/**
 * FormInput - Input de formulário com validação e tema integrado
 *
 * @example
 * ```tsx
 * <FormInput
 *   label="Nome"
 *   required
 *   value={nome}
 *   onChange={(e) => setNome(e.target.value)}
 *   error={errors.nome}
 *   validationState={errors.nome ? "invalid" : "default"}
 * />
 * ```
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputBaseProps>(
  (
    {
      label,
      required = false,
      error,
      helpText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
      loading = false,
      size = "md",
      validationState = "default",
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [isFocused, setIsFocused] = useState(false);

    const sizeStyles = {
      sm: {
        padding: semanticTokens.spacing.component.padding.sm,
        fontSize: semanticTokens.typography.fontSize.sm,
      },
      md: {
        padding: semanticTokens.spacing.component.padding.md,
        fontSize: semanticTokens.typography.fontSize.base,
      },
      lg: {
        padding: semanticTokens.spacing.component.padding.lg,
        fontSize: semanticTokens.typography.fontSize.lg,
      },
    };

    const validation = getValidationStyles(error ? "invalid" : validationState);

    return (
      <div className={cn("group relative", className)}>
        {/* Label */}
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold mb-2"
          style={{
            color: semanticTokens.color.text.primary,
            fontFamily: semanticTokens.typography.fontFamily.sans,
            fontSize: semanticTokens.typography.fontSize.sm,
          }}
        >
          {label}
          {required && <span style={{ color: semanticTokens.color.feedback.error }}> *</span>}
        </label>

        <div className="relative">
          {/* Glow effect on focus */}
          <div
            className={cn(
              "absolute -inset-px rounded-lg blur-sm transition-opacity duration-300 pointer-events-none",
              isFocused ? "opacity-100" : "opacity-0",
            )}
            style={{
              background: `color-mix(in srgb, ${validation.focusRing} ${validation.focusRingOpacity * 100}%, transparent)`,
            }}
          />

          <div className="relative flex items-center">
            {/* Left Icon */}
            {LeftIcon && (
              <LeftIcon
                className="absolute left-4 h-4 w-4 pointer-events-none"
                style={{ color: validation.icon }}
              />
            )}

            {/* Input */}
            <input
              ref={ref}
              id={inputId}
              {...props}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              className={cn(
                "relative w-full rounded-lg backdrop-blur-sm",
                "focus:outline-none transition-all",
                "placeholder:opacity-30",
                LeftIcon && "pl-12",
                (RightIcon || loading) && "pr-12",
              )}
              style={{
                padding: sizeStyles[size].padding,
                fontSize: sizeStyles[size].fontSize,
                backgroundColor: validation.background,
                borderWidth: designTokens.borderWidth.thin,
                borderColor: isFocused ? validation.focusRing : validation.border,
                color: validation.text,
                fontFamily: semanticTokens.typography.fontFamily.sans,
                transition: semanticTokens.transition.base,
              }}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
              }
            />

            {/* Loading Spinner */}
            {loading && (
              <div className="absolute right-4 pointer-events-none">
                <div
                  className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: validation.icon }}
                />
              </div>
            )}

            {/* Right Icon */}
            {!loading && RightIcon && (
              <button
                type="button"
                onClick={onRightIconClick}
                className="absolute right-4 hover:opacity-70 transition-opacity"
                style={{ color: validation.icon }}
                tabIndex={-1}
              >
                <RightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm flex items-center gap-1"
            style={{
              color: validation.text,
              fontFamily: semanticTokens.typography.fontFamily.sans,
              fontSize: semanticTokens.typography.fontSize.sm,
            }}
            role="alert"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}

        {/* Help Text */}
        {!error && helpText && (
          <p
            id={`${inputId}-help`}
            className="mt-1 text-sm"
            style={{
              color: semanticTokens.color.text.tertiary,
              fontFamily: semanticTokens.typography.fontFamily.sans,
              fontSize: semanticTokens.typography.fontSize.sm,
            }}
          >
            {helpText}
          </p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
