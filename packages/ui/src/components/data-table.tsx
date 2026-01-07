"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../lib/cn";

export type DataTableDensity = "compact" | "comfortable" | "spacious";

export type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];

  // Pagination
  pageCount?: number;
  rowCount?: number;
  manualPagination?: boolean;

  // Sorting
  manualSorting?: boolean;

  // Filtering
  manualFiltering?: boolean;

  // Row Selection
  enableRowSelection?: boolean | ((row: any) => boolean);

  // State
  state?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    rowSelection?: RowSelectionState;
  };

  // State Handlers
  onPaginationChange?: OnChangeFn<PaginationState>;
  onSortingChange?: OnChangeFn<SortingState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  // UI
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  density?: DataTableDensity;

  // Row Actions
  onRowClick?: (row: TData) => void;
};

/**
 * DataTable component powered by TanStack Table
 * Supports server-side and client-side pagination, sorting, filtering, and row selection
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   pageCount={totalPages}
 *   rowCount={totalRows}
 *   state={{ pagination, sorting, rowSelection }}
 *   onPaginationChange={setPagination}
 *   onSortingChange={setSorting}
 *   onRowSelectionChange={setRowSelection}
 *   manualPagination
 *   manualSorting
 *   enableRowSelection
 * />
 * ```
 */
export function DataTable<TData>({
  columns,
  data,
  pageCount,
  rowCount,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  enableRowSelection = false,
  state,
  onPaginationChange,
  onSortingChange,
  onRowSelectionChange,
  loading = false,
  emptyMessage = "Nenhum dado disponível",
  className,
  density = "comfortable",
  onRowClick,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,

    // Core
    getCoreRowModel: getCoreRowModel(),

    // Pagination
    manualPagination,
    pageCount,
    rowCount,

    // Sorting
    manualSorting,

    // Filtering
    manualFiltering,

    // Row Selection
    enableRowSelection,

    // State
    state: {
      pagination: state?.pagination,
      sorting: state?.sorting,
      rowSelection: state?.rowSelection,
    },

    // State Handlers
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
  });

  const densityClasses = {
    compact: "py-1.5",
    comfortable: "py-3",
    spacious: "py-4",
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="border border-white/10 rounded-none overflow-hidden bg-black/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-white/10 bg-white/5">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 text-left text-sm font-semibold text-white/90",
                        densityClasses[density],
                        header.column.getCanSort() &&
                        "cursor-pointer hover:bg-white/10 transition-colors",
                      )}
                      style={{
                        width: header.column.columnDef.size,
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-white/40">
                              {{
                                asc: <ChevronUp className="h-4 w-4" />,
                                desc: <ChevronDown className="h-4 w-4" />,
                              }[header.column.getIsSorted() as string] ?? (
                                  <ArrowUpDown className="h-4 w-4 opacity-50" />
                                )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-8 h-8 border-4 border-white/10 border-t-[hsl(var(--primary))] rounded-full animate-spin" />
                      <p className="text-white/40 font-mono text-sm animate-pulse">
                        CARREGANDO DADOS...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-white/60">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "border-b border-white/5 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-white/5",
                      row.getIsSelected() && "bg-[hsl(var(--primary))]/10",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={cn("px-4 text-sm text-white/80", densityClasses[density])}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
