/**
 * MFA Verification Input Component
 * 
 * Input de 6 dígitos para código TOTP
 */

"use client";

import { cn } from "@/lib/utils";
import { ClipboardEvent, KeyboardEvent, useRef, useState } from "react";

interface MFAVerificationInputProps {
    length?: number;
    onComplete: (code: string) => void;
    disabled?: boolean;
    error?: boolean;
}

export function MFAVerificationInput({
    length = 6,
    onComplete,
    disabled = false,
    error = false,
}: MFAVerificationInputProps) {
    const [values, setValues] = useState<string[]>(Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        // Apenas números
        if (value && !/^\d$/.test(value)) return;

        const newValues = [...values];
        newValues[index] = value;
        setValues(newValues);

        // Auto-focus próximo input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Verificar se completou
        if (newValues.every((v) => v !== "")) {
            onComplete(newValues.join(""));
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        // Backspace: voltar para input anterior
        if (e.key === "Backspace" && !values[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Arrow keys
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

        if (pastedData.length === length) {
            const newValues = pastedData.split("");
            setValues(newValues);
            inputRefs.current[length - 1]?.focus();
            onComplete(pastedData);
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={values[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className={cn(
                        "w-12 h-14 text-center text-2xl font-bold",
                        "border-2 rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2",
                        "transition-all duration-200",
                        error
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-primary focus:border-primary",
                        disabled && "opacity-50 cursor-not-allowed bg-gray-100"
                    )}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    );
}
