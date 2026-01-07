"use client";

import { LayoutGrid, List, Menu, Download, Columns, FileSpreadsheet, FileText, Search } from "lucide-react";
import { cn } from "../lib/cn";
import { Input } from "./input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "./dropdown-menu";
import { Button } from "./button";
import type { DataTableDensity } from "./data-table";
import type { Table } from "@tanstack/react-table";

export interface DataTableToolbarProps<TData = any> {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  density?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;
  table?: Table<TData>;
  onExport?: (format: "csv" | "xlsx") => void;
  className?: string;
}

/**
 * Toolbar component for DataTable with search, filters, and actions
 *
 * @example
 * ```tsx
 * <DataTableToolbar
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   searchPlaceholder="Buscar fornecedores..."
 *   filters={<FilterDropdowns />}
 *   actions={<BulkActions />}
 * />
 * ```
 */
export function DataTableToolbar<TData>({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters,
  actions,
  density = "comfortable",
  onDensityChange,
  table,
  onExport,
  className,
}: DataTableToolbarProps<TData>) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex gap-4 items-center">
        {onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-black/40 border border-white/10 rounded-none text-white placeholder-white/40 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-none bg-white/5 border border-white/10 text-[10px] text-white/40 font-mono">
                CTRL+K
              </span>
            </div>
          </div>
        )}
        {filters}
        {onDensityChange && (
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-none p-1">
            <button
              onClick={() => onDensityChange("compact")}
              className={cn(
                "p-2 rounded-none transition-colors",
                density === "compact"
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              title="Compact"
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDensityChange("comfortable")}
              className={cn(
                "p-2 rounded-none transition-colors",
                density === "comfortable"
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              title="Comfortable"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDensityChange("spacious")}
              className={cn(
                "p-2 rounded-none transition-colors",
                density === "spacious"
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              title="Spacious"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        )}
        {table && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-black/40 border-white/10 text-white hover:bg-white/10"
              >
                <Columns className="h-4 w-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/95 border-white/10 text-white">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-white hover:bg-white/10"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {onExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-black/40 border-white/10 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/95 border-white/10 text-white">
              <DropdownMenuItem
                className="text-white hover:bg-white/10 cursor-pointer"
                onClick={() => onExport("csv")}
              >
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-white hover:bg-white/10 cursor-pointer"
                onClick={() => onExport("xlsx")}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {actions}
    </div>
  );
}
