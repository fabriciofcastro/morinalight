"use client";

import { useState, useId } from "react";
import { Info } from "lucide-react";

export interface FuturisticInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  tooltip?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
}

export function FuturisticInput({
  label,
  required = false,
  id,
  error = false,
  errorMessage,
  tooltip,
  helperText,
  className,
  startIcon,
  ...props
}: FuturisticInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  return (
    <div className="group relative">
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor={inputId} className="block text-sm font-semibold text-white/90 cursor-pointer">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {tooltip && (
          <div
            className="relative"
            onMouseEnter={() => setShowInfoTooltip(true)}
            onMouseLeave={() => setShowInfoTooltip(false)}
          >
            <Info className="w-4 h-4 text-white/50 hover:text-white/90 cursor-help transition-colors" />
            {showInfoTooltip && (
              <div
                role="tooltip"
                className="absolute z-50 w-64 px-3 py-2 text-xs text-white bg-slate-800 border border-white/10 rounded-lg shadow-xl backdrop-blur-md left-full ml-2 bottom-0 animate-in fade-in slide-in-from-left-2"
              >
                {tooltip}
                <div className="absolute top-1/2 -left-1 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45 -translate-y-1/2" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />

        {startIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none z-10 flex items-center justify-center">
            {startIcon}
          </div>
        )}

        <input
          id={inputId}
          {...props}
          onFocus={(e) => {
            setShowTooltip(error && !!errorMessage);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setShowTooltip(false);
            props.onBlur?.(e);
          }}
          className={`relative w-full py-3 rounded-lg border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 cursor-text ${startIcon ? "pl-10 pr-4" : "px-4"} ${className || ""}`}
          aria-invalid={error}
          aria-describedby={
            error && errorMessage
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
        />
        {error && errorMessage && (
          <div
            id={`${inputId}-error`}
            role="tooltip"
            className={`absolute z-50 mt-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-lg ${showTooltip ? "opacity-100 visible" : "opacity-0 invisible"} transition-opacity duration-200`}
            style={{ bottom: "100%", left: 0 }}
          >
            {errorMessage}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600" />
          </div>
        )}
      </div>
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-white/50">
          {helperText}
        </p>
      )}
    </div>
  );
}








