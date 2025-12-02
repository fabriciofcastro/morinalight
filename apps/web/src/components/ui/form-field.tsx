"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { forwardRef, ReactNode } from "react";
import { Tooltip } from "./tooltip";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
    label: string;
    name: string;
    type?: "text" | "email" | "number" | "select" | "textarea" | "password" | "url" | "date";
    required?: boolean;
    tooltip?: string;
    helpText?: string;
    error?: string;
    loading?: boolean;
    options?: Array<{ label: string; value: string }>;
    rows?: number;
    leftIcon?: ReactNode;
    mask?: string;
}

export const FormField = forwardRef<any, FormFieldProps>(
    (
        {
            label,
            name,
            type = "text",
            required,
            tooltip,
            helpText,
            error,
            loading,
            options,
            rows = 4,
            className = "",
            leftIcon,
            mask,
            ...props
        },
        ref
    ) => {
        const inputId = `field-${name}`;
        const tooltipId = `${inputId}-tooltip`;
        const errorId = `${inputId}-error`;
        const helpId = `${inputId}-help`;

        const baseInputClasses =
            "w-full rounded-lg border bg-white/5 backdrop-blur-sm px-4 py-2.5 text-white placeholder:text-white/30 transition-all duration-200 focus:outline-none focus:bg-white/10 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)] disabled:cursor-not-allowed disabled:opacity-50";
        const normalBorderClasses = "border-white/10 hover:border-white/20 focus:border-[hsl(var(--primary))]";
        const errorBorderClasses = "border-red-500 focus:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
        const iconPadding = leftIcon ? "pl-10" : "";

        const inputClasses = `${baseInputClasses} ${normalBorderClasses} ${error ? errorBorderClasses : ""} ${iconPadding} ${className}`;

        return (
            <div className="space-y-1.5 group">
                <label
                    htmlFor={inputId}
                    className={`flex items-center text-sm font-medium text-zinc-400 transition-colors group-hover:text-zinc-300 ${required ? "after:ml-0.5 after:text-red-400 after:content-['*']" : ""
                        }`}
                >
                    {label}
                    {tooltip && <Tooltip content={tooltip} id={tooltipId} />}
                </label>

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[hsl(var(--primary))] transition-colors">
                            {leftIcon}
                        </div>
                    )}

                    {type === "select" ? (
                        <select
                            id={inputId}
                            name={name}
                            ref={ref as any}
                            required={required}
                            aria-required={required}
                            aria-invalid={error ? "true" : "false"}
                            aria-describedby={[tooltip && tooltipId, helpText && helpId, error && errorId]
                                .filter(Boolean)
                                .join(" ")}
                            className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'rgba(255,255,255,0.5)\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'%3e%3cpolyline points=\\'6 9 12 15 18 9\\'%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10`}
                            {...(props as any)}
                        >
                            <option value="" className="bg-[#0A0A0A] text-zinc-400">
                                Selecione...
                            </option>
                            {options?.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-[#0A0A0A] text-white">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : type === "textarea" ? (
                        <textarea
                            id={inputId}
                            name={name}
                            ref={ref as any}
                            required={required}
                            rows={rows}
                            aria-required={required}
                            aria-invalid={error ? "true" : "false"}
                            aria-describedby={[tooltip && tooltipId, helpText && helpId, error && errorId]
                                .filter(Boolean)
                                .join(" ")}
                            className={inputClasses}
                            {...(props as any)}
                        />
                    ) : (
                        <input
                            id={inputId}
                            name={name}
                            type={type}
                            ref={ref as any}
                            required={required}
                            aria-required={required}
                            aria-invalid={error ? "true" : "false"}
                            aria-describedby={[tooltip && tooltipId, helpText && helpId, error && errorId]
                                .filter(Boolean)
                                .join(" ")}
                            className={inputClasses}
                            {...(props as any)}
                        />
                    )}

                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" aria-hidden="true" />
                            <span className="sr-only">Carregando...</span>
                        </div>
                    )}
                </div>

                {helpText && !error && (
                    <p id={helpId} className="text-xs text-zinc-500">
                        {helpText}
                    </p>
                )}

                {error && (
                    <div id={errorId} role="alert" aria-live="polite" className="flex items-center gap-2 text-sm text-red-400 animate-in slide-in-from-top-1 fade-in duration-200">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        );
    }
);

FormField.displayName = "FormField";
