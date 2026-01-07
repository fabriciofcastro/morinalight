"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./button";

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalRows?: number;
  className?: string;
}

/**
 * Pagination component for DataTable with cyber/tech styling
 *
 * @example
 * ```tsx
 * <DataTablePagination
 *   table={table}
 *   totalRows={totalRows}
 * />
 * ```
 */
export function DataTablePagination<TData>({
  table,
  totalRows,
  className,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  const currentRows = table.getRowModel().rows.length;
  const start = pageIndex * pageSize + 1;
  const end = pageIndex * pageSize + currentRows;
  const total = totalRows ?? table.getRowCount();

  return (
    <div
      className={cn("flex items-center justify-between pt-6 border-t border-white/10", className)}
    >
      <div className="flex items-center gap-4">
        <div className="text-sm text-white/60">
          Mostrando {start} a {end} de {total}
        </div>
        <div className="relative group">
          <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-none group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="relative px-3 py-2 rounded-none border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer text-sm"
          >
            <option value="10" className="bg-[#1a1f3a]">
              10 por página
            </option>
            <option value="20" className="bg-[#1a1f3a]">
              20 por página
            </option>
            <option value="50" className="bg-[#1a1f3a]">
              50 por página
            </option>
            <option value="100" className="bg-[#1a1f3a]">
              100 por página
            </option>
          </select>
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer rounded-none"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-white/5 border border-white/10">
            <span className="text-sm font-medium text-white/80">
              Página {pageIndex + 1} de {pageCount}
            </span>
          </div>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer rounded-none"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
