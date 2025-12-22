"use client";

import { useId } from "react";

export interface FuturisticTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export function FuturisticTextarea({
  label,
  required = false,
  id,
  error = false,
  errorMessage,
  ...props
}: FuturisticTextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;

  return (
    <div className="group relative">
      <label htmlFor={textareaId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <textarea
          id={textareaId}
          {...props}
          className={`relative w-full px-4 py-3 rounded-lg border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 resize-none`}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${textareaId}-error` : undefined}
        />
        {error && errorMessage && (
          <div
            id={`${textareaId}-error`}
            role="tooltip"
            className="absolute z-50 mt-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-lg"
            style={{ bottom: "100%", left: 0 }}
          >
            {errorMessage}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600" />
          </div>
        )}
      </div>
    </div>
  );
}







