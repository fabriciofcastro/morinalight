"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "../lib/cn";

const buttonEnhancedVariants = cva(
  // Base: Estilo quadrado, sem border-radius
  "inline-flex items-center justify-center gap-2 border-0 font-semibold uppercase tracking-wider transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary - Azul
        primary:
          "bg-[hsl(var(--primary))] text-white shadow-[0_4px_12px_rgba(91,138,255,0.3)] hover:bg-[hsl(var(--primary)/0.9)] hover:shadow-[0_6px_20px_rgba(91,138,255,0.4)] active:bg-[hsl(var(--primary)/0.8)] focus-visible:outline-[hsl(var(--primary))]",

        // Success - Verde
        success:
          "bg-[hsl(var(--success))] text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:bg-[hsl(var(--success)/0.9)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.4)] active:bg-[hsl(var(--success)/0.8)] focus-visible:outline-[hsl(var(--success))]",

        // Warning - Amarelo/Laranja
        warning:
          "bg-[hsl(var(--warning))] text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:bg-[hsl(var(--warning)/0.9)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] active:bg-[hsl(var(--warning)/0.8)] focus-visible:outline-[hsl(var(--warning))]",

        // Danger - Vermelho
        danger:
          "bg-[hsl(var(--danger))] text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:bg-[hsl(var(--danger)/0.9)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] active:bg-[hsl(var(--danger)/0.8)] focus-visible:outline-[hsl(var(--danger))]",

        // Info - Azul claro
        info: "bg-[hsl(var(--chart-2))] text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:bg-[hsl(var(--chart-2)/0.9)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] active:bg-[hsl(var(--chart-2)/0.8)] focus-visible:outline-[hsl(var(--chart-2))]",

        // Secondary - Roxo
        secondary:
          "bg-[hsl(var(--secondary))] text-white shadow-[0_4px_12px_rgba(168,85,247,0.3)] hover:bg-[hsl(var(--secondary)/0.9)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] active:bg-[hsl(var(--secondary)/0.8)] focus-visible:outline-[hsl(var(--secondary))]",

        // Ghost - Transparente
        ghost:
          "bg-transparent text-[hsl(var(--text-1))] hover:bg-[hsl(var(--surface))] focus-visible:outline-[hsl(var(--primary))]",

        // Outline - Borda apenas
        outline:
          "bg-transparent border-2 border-[hsl(var(--border))] text-[hsl(var(--text-1))] hover:bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary))] focus-visible:outline-[hsl(var(--primary))]",
      },
      size: {
        sm: "h-10 px-4 text-xs",
        md: "h-12 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonEnhancedProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonEnhancedVariants> {
  isLoading?: boolean;
}

export const ButtonEnhanced = forwardRef<HTMLButtonElement, ButtonEnhancedProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonEnhancedVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Carregando"
          >
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
          <span className="sr-only">Carregando...</span>
        </>
      ) : (
        children
      )}
    </button>
  ),
);

ButtonEnhanced.displayName = "ButtonEnhanced";

export { buttonEnhancedVariants };
