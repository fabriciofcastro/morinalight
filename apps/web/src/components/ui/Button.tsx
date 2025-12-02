"use client";

import { forwardRef, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Variant styles
    const variantClasses = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 active:bg-blue-800",
      secondary:
        "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 active:bg-gray-400",
      ghost:
        "bg-transparent hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
      danger:
        "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 active:bg-red-800",
    }[variant];

    // Size styles
    const sizeClasses = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    }[size];

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-md font-medium transition-colors duration-150
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses}
          ${sizeClasses}
          ${fullWidth ? "w-full" : ""}
          ${className || ""}
        `}
        {...props}
      >
        {leftIcon && !isLoading && <span className="flex items-center">{leftIcon}</span>}
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <title>Loading</title>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
        {rightIcon && !isLoading && <span className="flex items-center">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
