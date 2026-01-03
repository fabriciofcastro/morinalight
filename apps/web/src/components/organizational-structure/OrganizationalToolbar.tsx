"use client";

import { Button, Input, Label, Popover, PopoverContent, PopoverTrigger, cn } from "@morina/ui";
import {
  Download,
  FileDown,
  FileSpreadsheet,
  Filter,
  Network,
  Search,
} from "lucide-react";
import { useState } from "react";

interface OrganizationalToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: {
    type: "all" | "department" | "sector" | "position";
    status: "all" | "ativo" | "inativo" | "arquivado";
    responsavel?: string;
  };
  onFiltersChange: (filters: OrganizationalToolbarProps["filters"]) => void;
  onExport: (format: "pdf" | "excel" | "json") => void;
  onViewOrganogram: () => void;
  armedMode: boolean;
  onToggleArmedMode: () => void;
}

export function OrganizationalToolbar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onExport,
  onViewOrganogram,
  armedMode,
  onToggleArmedMode,
}: OrganizationalToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    filters.type !== "all" || filters.status !== "all" || filters.responsavel;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] bg-[color-mix(in_oklab,var(--surface-veil,#020617)_88%,transparent_12%)] backdrop-blur-2xl px-4 py-3">
      {/* Left: Search */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome, código, descrição…"
          className="pl-10"
        />
      </div>

      {/* Center: Filters & Actions */}
      <div className="flex items-center gap-2">
        {/* ARMED Mode Toggle */}
        <Button
          type="button"
          onClick={onToggleArmedMode}
          variant={armedMode ? "destructive" : "outline"}
          className={cn(
            "font-mono text-xs uppercase tracking-wider",
            armedMode &&
              "border-red-500/50 bg-red-500/20 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse",
          )}
        >
          {armedMode ? "⚡ ARMED" : "ARMED"}
        </Button>

        {/* Filters */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(hasActiveFilters && "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]")}
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center bg-[hsl(var(--primary))] text-[10px] font-bold text-white">
                  !
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Filtros Avançados</h4>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      onFiltersChange({
                        type: "all",
                        status: "all",
                        responsavel: undefined,
                      });
                    }}
                    className="text-xs text-white/60 hover:text-white/90 transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div>
                <Label htmlFor="filter-type" className="mb-2 block text-xs font-medium text-white/70">Tipo</Label>
                <select
                  id="filter-type"
                  value={filters.type}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      type: e.target.value as typeof filters.type,
                    })
                  }
                  className="flex h-9 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="department">Departamentos</option>
                  <option value="sector">Setores</option>
                  <option value="position">Cargos</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-status" className="mb-2 block text-xs font-medium text-white/70">Status</label>
                <select
                  id="filter-status"
                  value={filters.status}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      status: e.target.value as typeof filters.status,
                    })
                  }
                  className="flex h-9 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="arquivado">Arquivado</option>
                </select>
              </div>

              <div>
                <Label htmlFor="filter-responsavel" className="mb-2 block text-xs font-medium text-white/70">
                  Responsável (Email)
                </Label>
                <Input
                  id="filter-responsavel"
                  value={filters.responsavel || ""}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      responsavel: e.target.value || undefined,
                    })
                  }
                  placeholder="email@exemplo.com"
                  className="h-9"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* View Organogram */}
        <Button type="button" variant="outline" onClick={onViewOrganogram}>
          <Network className="h-4 w-4" />
          Organograma
        </Button>

        {/* Export */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onExport("pdf")}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
              >
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </button>
              <button
                type="button"
                onClick={() => onExport("excel")}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Excel
              </button>
              <button
                type="button"
                onClick={() => onExport("json")}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
              >
                <FileDown className="h-4 w-4" />
                Exportar JSON
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

