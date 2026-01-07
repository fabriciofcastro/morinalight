"use client";

import { Search, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { semanticTokens } from "../../theme/semantic-tokens";
import { Button } from "../button";

export interface FilterInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    onValueChange: (value: string) => void;
    debounceMs?: number;
}

/**
 * FilterInput - Specialized input for filtering lists
 *
 * @example
 * <FilterInput placeholder="Buscar por nome..." onValueChange={setSearch} />
 */
export const FilterInput = React.forwardRef<HTMLInputElement, FilterInputProps>(
    ({ className, value, onValueChange, debounceMs = 300, ...props }, ref) => {
        const [localValue, setLocalValue] = useState(value || "");
        const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setLocalValue(newValue);

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                onValueChange(newValue);
            }, debounceMs);
        };

        const handleClear = () => {
            setLocalValue("");
            onValueChange("");
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };

        return (
            <div className={cn("relative group", className)}>
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                />
                <input
                    ref={ref}
                    type="text"
                    value={localValue}
                    onChange={handleChange}
                    className={cn(
                        "w-full h-9 pl-9 pr-8 rounded-md border text-sm transition-all outline-none",
                        "bg-transparent hover:bg-white/5 focus:bg-white/10",
                        "border-white/10 focus:border-blue-500/50"
                    )}
                    style={{
                        color: semanticTokens.color.text.primary,
                    }}
                    {...props}
                />
                {localValue && (
                    <button
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
        );
    }
);

FilterInput.displayName = "FilterInput";
