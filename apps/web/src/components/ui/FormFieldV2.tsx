"use client";

import { forwardRef, type ReactNode, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { validationAnimations } from "./validation";

export type FormFieldV2State = "idle" | "valid" | "invalid" | "pending" | "disabled";

interface FormFieldV2Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  // Label e descrição
  label?: string;
  hint?: string;
  helperText?: string;
  name?: string;

  // Estado de validação
  state?: FormFieldV2State;
  error?: string;
  successMessage?: string;
  pendingMessage?: string;

  // Ícones
  icon?: ReactNode;
  showValidationIcon?: boolean;

  // Loading
  isLoading?: boolean;

  // Tamanho
  size?: "sm" | "md" | "lg";

  // Container className
  containerClassName?: string;
}

export const FormFieldV2 = forwardRef<HTMLInputElement, FormFieldV2Props>(
  (
    {
      label,
      hint,
      helperText,
      state = "idle",
      error,
      successMessage,
      pendingMessage,
      icon,
      showValidationIcon = true,
      isLoading = false,
      size = "md",
      containerClassName,
      className,
      disabled,
      ...inputProps
    },
    ref,
  ) => {
    const inputId = useId();

    // Determinar estado visual
    const visualState = disabled ? "disabled" : state;
    const isInvalid = visualState === "invalid";
    const isValid = visualState === "valid";
    const isPending = visualState === "pending" || isLoading;

    // Mapa de tamanhos
    const sizeClasses = {
      sm: "h-8 px-2 text-xs",
      md: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base",
    };

    // Cores por estado
    const borderColorClass = {
      idle: "border-gray-300 dark:border-gray-700",
      valid: "border-green-500",
      invalid: "border-red-500",
      pending: "border-yellow-500",
      disabled: "border-gray-200 dark:border-gray-800",
    }[visualState];

    const bgColorClass = {
      idle: "bg-white dark:bg-gray-900",
      valid: "bg-white dark:bg-gray-900",
      invalid: "bg-red-50 dark:bg-red-950",
      pending: "bg-yellow-50 dark:bg-yellow-950",
      disabled: "bg-gray-50 dark:bg-gray-950",
    }[visualState];

    return (
      <div className={containerClassName || "w-full flex flex-col gap-1"}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
            {inputProps.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Wrapper */}
        <motion.div
          className={`relative inline-flex items-center border rounded-md transition-colors duration-150 ${borderColorClass} ${bgColorClass}`}
          animate={isInvalid ? "shake" : isPending ? "pending" : isValid ? "valid" : "idle"}
          variants={{
            idle: {},
            valid: {},
            pending: {
              opacity: [1, 0.8, 1],
            },
            shake: {
              x: [-4, 4, -4, 4, 0],
            },
          }}
          transition={{ duration: 0.4 }}
        >
          {/* Left Icon */}
          {icon && !showValidationIcon && (
            <div className="pl-3 text-gray-400 dark:text-gray-600 shrink-0">{icon}</div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`flex-1 bg-transparent border-0 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} px-3 ${className || ""}`}
            {...inputProps}
          />

          {/* Right Icon - Validation Status */}
          {showValidationIcon && (
            <AnimatePresence mode="wait">
              {isValid && (
                <motion.div
                  key="valid"
                  {...validationAnimations.validateSuccess}
                  className="pr-3 text-green-500 shrink-0"
                >
                  <Check size={18} />
                </motion.div>
              )}
              {isInvalid && !isLoading && (
                <motion.div
                  key="invalid"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="pr-3 text-red-500 shrink-0"
                >
                  <AlertCircle size={18} />
                </motion.div>
              )}
              {isPending && (
                <motion.div
                  key="loading"
                  {...validationAnimations.loadingSpinner}
                  className="pr-3 text-yellow-500 shrink-0"
                >
                  <Loader2 size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Helper Text or Hint */}
        <AnimatePresence>
          {hint && !error && !successMessage && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              {...validationAnimations.showError}
              className="text-xs text-red-500 font-medium"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.p
              {...validationAnimations.showSuccess}
              className="text-xs text-green-500 font-medium"
            >
              {successMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Pending Message */}
        <AnimatePresence>
          {pendingMessage && isPending && (
            <motion.p
              {...validationAnimations.showSuccess}
              className="text-xs text-yellow-500 font-medium"
            >
              {pendingMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Helper Text */}
        {helperText && !error && !isInvalid && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  },
);

FormFieldV2.displayName = "FormFieldV2";
