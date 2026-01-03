"use client";

import { useMemo } from "react";
import { Building2, ChevronRight, GitBranch } from "lucide-react";
import type { Branch } from "@/lib/api/organizational-structure";
import { BranchType, BRANCH_TYPE_LABELS } from "@/types/branch-hierarchy";

interface BranchSelectorProps {
    branches: Branch[];
    value?: string;
    onChange: (branchId: string | undefined) => void;
    currentBranchId?: string;
    label?: string;
    placeholder?: string;
    helperText?: string;
}

export function BranchSelector({
    branches,
    value,
    onChange,
    currentBranchId,
    label = "Filial Pai",
    placeholder = "Selecione uma filial pai (opcional)",
    helperText,
}: BranchSelectorProps) {
    // Filtrar para não permitir selecionar a própria filial ou suas descendentes
    const availableBranches = useMemo(() => {
        return branches.filter((branch) => {
            // Não pode selecionar a si mesmo
            if (branch.id === currentBranchId) return false;

            // TODO: Implementar lógica para evitar descendentes (ciclos)
            // Por enquanto, permite todas as outras

            return true;
        });
    }, [branches, currentBranchId]);

    // Agrupar por tipo
    const branchesByType = useMemo(() => {
        const grouped = new Map<string, Branch[]>();

        availableBranches.forEach((branch) => {
            const type = branch.type || "FILIAL";
            if (!grouped.has(type)) {
                grouped.set(type, []);
            }
            grouped.get(type)!.push(branch);
        });

        return grouped;
    }, [availableBranches]);

    return (
        <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
                {label}
            </label>

            <div className="relative">
                <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value || undefined)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none pr-10"
                >
                    <option value="" className="bg-gray-900">
                        {placeholder}
                    </option>

                    {Array.from(branchesByType.entries()).map(([type, branchesOfType]) => (
                        <optgroup key={type} label={BRANCH_TYPE_LABELS[type as BranchType] || type} className="bg-gray-900">
                            {branchesOfType.map((branch) => (
                                <option key={branch.id} value={branch.id} className="bg-gray-900">
                                    {branch.name} ({branch.code})
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>

                <GitBranch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
            </div>

            {helperText && (
                <p className="text-xs text-white/50 mt-1">{helperText}</p>
            )}

            {value && (
                <div className="mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <ChevronRight className="w-3 h-3 text-white/50" />
                    <span className="text-sm text-blue-400">
                        {availableBranches.find((b) => b.id === value)?.name}
                    </span>
                </div>
            )}
        </div>
    );
}
