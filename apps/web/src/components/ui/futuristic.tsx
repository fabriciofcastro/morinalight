"use client";

import React from "react";
import { GlassCard } from "@morina/ui";
import { Button } from "./button";
import { FuturisticInput, FuturisticInputProps } from "./futuristic-input";
import { FuturisticSelect, FuturisticSelectProps } from "./futuristic-select";

// Re-export GlassCard
export { GlassCard };

// Re-export Button
export { Button };

// Alias FuturisticInput as GlassInput
export const GlassInput = FuturisticInput;

// GlassSelect Wrapper
interface Option {
    value: string | number;
    label: string;
}

interface GlassSelectProps extends Omit<FuturisticSelectProps, 'onChange' | 'children'> {
    onChange?: (value: string) => void;
    options?: Option[];
    placeholder?: string;
    children?: React.ReactNode;
}

export const GlassSelect = ({
    value,
    onChange,
    options = [],
    placeholder,
    children,
    ...props
}: GlassSelectProps) => {

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <FuturisticSelect
            value={value}
            onChange={handleChange}
            {...props}
        >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
            {children}
        </FuturisticSelect>
    );
};
