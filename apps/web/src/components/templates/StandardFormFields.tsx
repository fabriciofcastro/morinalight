"use client";

import { useState, useId } from "react";

/**
 * Input Futurista Padronizado
 * 
 * Componente de input seguindo o padrão visual MORINA
 * com glass morphism e efeitos hover.
 */
export interface FuturisticInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export function FuturisticInput({
  label,
  required = false,
  id,
  error = false,
  errorMessage,
  ...props
}: FuturisticInputProps) {
  const inputId = id || useId();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="group relative">
      <label htmlFor={inputId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <input
          id={inputId}
          {...props}
          onFocus={() => {
            setShowTooltip(error && !!errorMessage);
          }}
          onBlur={() => setShowTooltip(false)}
          className={`relative w-full px-4 py-3 rounded-lg border ${
            error ? "border-red-500 border-2" : "border-white/20"
          } bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${inputId}-error` : undefined}
        />
        {error && errorMessage && (
          <div
            id={`${inputId}-error`}
            role="tooltip"
            className={`absolute z-50 mt-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-lg ${
              showTooltip ? "opacity-100 visible" : "opacity-0 invisible"
            } transition-opacity duration-200`}
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

/**
 * Select Futurista Padronizado
 */
export interface FuturisticSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  children: React.ReactNode;
}

export function FuturisticSelect({
  label,
  required = false,
  id,
  error = false,
  errorMessage,
  children,
  ...props
}: FuturisticSelectProps) {
  const selectId = id || useId();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="group relative">
      <label htmlFor={selectId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <select
          id={selectId}
          {...props}
          onFocus={() => setShowTooltip(error && !!errorMessage)}
          onBlur={() => setShowTooltip(false)}
          className={`relative w-full px-4 py-3 rounded-lg border ${
            error ? "border-red-500 border-2" : "border-white/20"
          } bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer`}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${selectId}-error` : undefined}
        >
          {children}
        </select>
        {error && errorMessage && (
          <div
            id={`${selectId}-error`}
            role="tooltip"
            className={`absolute z-50 mt-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-lg ${
              showTooltip ? "opacity-100 visible" : "opacity-0 invisible"
            } transition-opacity duration-200`}
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

/**
 * Textarea Futurista Padronizado
 */
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
  const textareaId = id || useId();

  return (
    <div className="group">
      <label htmlFor={textareaId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <textarea
          id={textareaId}
          {...props}
          className={`relative w-full px-4 py-3 rounded-lg border ${
            error ? "border-red-500 border-2" : "border-white/20"
          } bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/50 transition-all duration-300 resize-none`}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${textareaId}-error` : undefined}
        />
        {error && errorMessage && (
          <div
            id={`${textareaId}-error`}
            role="alert"
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




