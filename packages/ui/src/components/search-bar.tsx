"use client";

import { Search } from "lucide-react";
import { cn } from "../lib/cn";
import { GlassCard } from "./glass-card";
import { Input } from "./input";

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  filters?: React.ReactNode;
}

/**
 * Compound component for search with optional filters
 * @example
 * <SearchBar
 *   placeholder="Buscar fornecedores..."
 *   onChange={handleSearch}
 *   filters={<FilterDropdown />}
 * />
 */
export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar...",
  className,
  filters,
}: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    onSearch?.(newValue);
  };

  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
        {filters && <div className="flex gap-2">{filters}</div>}
      </div>
    </GlassCard>
  );
}
