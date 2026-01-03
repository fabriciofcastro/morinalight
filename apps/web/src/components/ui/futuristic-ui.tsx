"use client";

import { useId } from "react";

export const FuturisticInput = ({
    label,
    required = false,
    id,
    error = false,
    errorMessage,
    startIcon,
    multiline = false,
    rows = 3,
    ...props
}: {
    label: string;
    required?: boolean;
    id?: string;
    error?: boolean;
    errorMessage?: string;
    startIcon?: React.ReactNode;
    multiline?: boolean;
    rows?: number;
} & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
        <div className="group relative">
            <label htmlFor={inputId} className="block text-sm font-semibold text-white/90 mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
                <div className="absolute -inset-px bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <div className="relative flex items-center">
                    {multiline ? (
                        <textarea
                            id={inputId}
                            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                            rows={rows}
                            className={`relative w-full ${startIcon ? "pl-10" : "pl-4"} pr-4 py-3 border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
                            aria-invalid={error}
                        />
                    ) : (
                        <input
                            id={inputId}
                            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                            className={`relative w-full ${startIcon ? "pl-10" : "pl-4"} pr-4 py-3 border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
                            aria-invalid={error}
                        />
                    )}
                    {startIcon && !multiline && (
                        <div className="absolute left-3 h-5 w-5 text-white/50 group-focus-within:text-blue-500 transition-colors flex items-center justify-center">
                            {startIcon}
                        </div>
                    )}
                </div>
                {error && errorMessage && <div className="text-xs text-red-400 mt-1">{errorMessage}</div>}
            </div>
        </div>
    );
};

export const FuturisticSelect = ({
    label,
    required = false,
    id,
    error = false,
    errorMessage,
    children,
    options,
    ...props
}: {
    label: string;
    required?: boolean;
    id?: string;
    error?: boolean;
    errorMessage?: string;
    children?: React.ReactNode;
    options?: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
        <div className="group relative">
            <label htmlFor={selectId} className="block text-sm font-semibold text-white/90 mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
                <div className="absolute -inset-px bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <select
                    id={selectId}
                    {...props}
                    className={`relative w-full px-4 py-3 border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer`}
                >
                    {options ? options.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                    )) : children}
                </select>
                {error && errorMessage && <div className="text-xs text-red-400 mt-1">{errorMessage}</div>}
            </div>
        </div>
    );
};
