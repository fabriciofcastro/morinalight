"use client";

import { Search, X } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/cn";
import { Input, type InputProps } from "./input";

export interface FilterInputProps extends Omit<InputProps, "onChange"> {
    /**
     * Value of the input
     */
    value: string;
    /**
     * Callback fired when value changes
     */
    onChange: (value: string) => void;
    /**
     * Callback fired when clear button is clicked
     */
    onClear?: () => void;
    /**
     * Debounce time in milliseconds. If 0 or undefined, onChange is called immediately.
     */
    debounceTime?: number;
    /**
     * Whether to show the search icon prefix
     */
    showIcon?: boolean;
}

export const FilterInput = React.forwardRef<HTMLInputElement, FilterInputProps>(
    ({ className, value, onChange, onClear, debounceTime = 300, showIcon = true, placeholder = "Filtrar...", ...props }, ref) => {
        const [localValue, setLocalValue] = React.useState(value);

        React.useEffect(() => {
            setLocalValue(value);
        }, [value]);

        React.useEffect(() => {
            if (debounceTime === 0) {
                return;
            }

            const timeoutId = setTimeout(() => {
                if (localValue !== value) {
                    onChange(localValue);
                }
            }, debounceTime);

            return () => clearTimeout(timeoutId);
        }, [localValue, debounceTime, onChange, value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setLocalValue(newValue);
            if (debounceTime === 0) {
                onChange(newValue);
            }
        };

        const handleClear = () => {
            setLocalValue("");
            onChange("");
            onClear?.();
        };

        return (
            <div className={cn("relative", className)}>
                {showIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
                        <Search className="h-4 w-4" />
                    </div>
                )}
                <Input
                    ref={ref}
                    value={localValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={cn(
                        showIcon && "pl-9",
                        localValue && "pr-9",
                        "transition-all"
                    )}
                    {...props}
                />
                {localValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[var(--color-background-tertiary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                        aria-label="Limpar filtro"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        );
    },
);

FilterInput.displayName = "FilterInput";
