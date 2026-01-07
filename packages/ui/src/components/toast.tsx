"use client";

import { AlertCircle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { cn } from "../lib/cn";

/**
 * Toast Component - Enterprise Grade
 * Wrapper for Sonner with custom styling
 *
 * Features:
 * - 5 types (success, error, warning, info, loading)
 * - Auto-dismiss
 * - Action buttons
 * - Progress bar
 * - Position control
 * - Stack management
 * - Rich content support
 */

export interface ToastOptions {
  /** Toast description */
  description?: string;
  /** Action button */
  action?: {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  /** Cancel button */
  cancel?: {
    label: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  /** Duration in ms (0 for infinite) */
  duration?: number;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Close button */
  closeButton?: boolean;
}

// Custom icons for each type
const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <XCircle className="h-5 w-5 text-danger" />,
  warning: <AlertCircle className="h-5 w-5 text-warning" />,
  info: <Info className="h-5 w-5 text-info" />,
  loading: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
};

/**
 * Toast API
 */
const processOptions = (options?: ToastOptions) => {
  if (!options) return options;
  const { cancel, ...rest } = options;
  return {
    ...rest,
    cancel: cancel
      ? {
          ...cancel,
          onClick: cancel.onClick || (() => sonnerToast.dismiss()),
        }
      : undefined,
  };
};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    const processed = processOptions(options);
    return sonnerToast.success(message, {
      ...processed,
      icon: options?.icon || icons.success,
      className: cn(
        "bg-success/10 border-success/20 text-text-primary",
        options?.closeButton && "pr-12",
      ),
    });
  },

  error: (message: string, options?: ToastOptions) => {
    const processed = processOptions(options);
    return sonnerToast.error(message, {
      ...processed,
      icon: options?.icon || icons.error,
      className: cn(
        "bg-danger/10 border-danger/20 text-text-primary",
        options?.closeButton && "pr-12",
      ),
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    const processed = processOptions(options);
    return sonnerToast.warning(message, {
      ...processed,
      icon: options?.icon || icons.warning,
      className: cn(
        "bg-warning/10 border-warning/20 text-text-primary",
        options?.closeButton && "pr-12",
      ),
    });
  },

  info: (message: string, options?: ToastOptions) => {
    const processed = processOptions(options);
    return sonnerToast.info(message, {
      ...processed,
      icon: options?.icon || icons.info,
      className: cn("bg-info/10 border-info/20 text-text-primary", options?.closeButton && "pr-12"),
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    const processed = processOptions(options);
    return sonnerToast.loading(message, {
      ...processed,
      icon: options?.icon || icons.loading,
      className: cn(
        "bg-primary/10 border-primary/20 text-text-primary",
        options?.closeButton && "pr-12",
      ),
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      className: "bg-surface border-border text-text-primary",
    });
  },

  custom: (component: React.ReactNode, options?: ToastOptions) => {
    // Custom toast doesn't accept standard options the same way, usually
    // But for consistency let's pass processed options if accepted
    // Sonner custom(component, data) - data is processed options
    return sonnerToast.custom(() => <>{component}</>, processOptions(options));
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

/**
 * Toaster Component
 * Place this in your app layout
 */
export interface ToasterProps {
  /** Position of toasts */
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  /** Theme */
  theme?: "light" | "dark" | "system";
  /** Rich colors */
  richColors?: boolean;
  /** Expand toasts */
  expand?: boolean;
  /** Max visible toasts */
  visibleToasts?: number;
  /** Close button on all toasts */
  closeButton?: boolean;
}

export function Toaster({
  position = "top-right",
  theme = "dark",
  richColors = true,
  expand = false,
  visibleToasts = 3,
  closeButton = false,
}: ToasterProps = {}) {
  return (
    <SonnerToaster
      position={position}
      theme={theme}
      richColors={richColors}
      expand={expand}
      visibleToasts={visibleToasts}
      closeButton={closeButton}
      toastOptions={{
        classNames: {
          toast: cn(
            "bg-surface border border-border rounded-none shadow-lg",
            "text-text-primary font-sans",
            "data-[type=success]:bg-success/10 data-[type=success]:border-success/20",
            "data-[type=error]:bg-danger/10 data-[type=error]:border-danger/20",
            "data-[type=warning]:bg-warning/10 data-[type=warning]:border-warning/20",
            "data-[type=info]:bg-info/10 data-[type=info]:border-info/20",
          ),
          description: "text-text-secondary text-sm",
          actionButton: cn(
            "bg-primary text-white hover:bg-primary-hover",
            "rounded-none px-3 py-1.5 text-sm font-semibold",
          ),
          cancelButton: cn(
            "bg-surface border border-border hover:bg-surface-elevated",
            "rounded-none px-3 py-1.5 text-sm font-semibold",
          ),
        },
      }}
    />
  );
}
