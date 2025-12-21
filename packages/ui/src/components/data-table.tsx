"use client";

import { useState, useMemo, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown, Download, Filter } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "../lib/cn";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
};

export type DataTableProps<T extends Record<string, unknown>> = {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  pageSize?: number;
  exportable?: boolean;
  onExport?: (data: T[]) => void;
  className?: string;
  emptyMessage?: string;
};

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  onRowSelect,
  pageSize = 10,
  exportable = false,
  onExport,
  className,
  emptyMessage = "Nenhum dado disponível",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn as keyof T];
      const bVal = b[sortColumn as keyof T];
      if (aVal === bVal) return 0;
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: keyof T | string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    } else {
      const newSelected = new Set(Array.from({ length: paginatedData.length }, (_, i) => i));
      setSelectedRows(newSelected);
      onRowSelect?.(paginatedData);
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    const selected = paginatedData.filter((_, i) => newSelected.has(i));
    onRowSelect?.(selected);
  };

  const handleExport = () => {
    if (onExport) {
      onExport(sortedData);
    } else {
      const csv = [
        columns.map((c) => c.header).join(","),
        ...sortedData.map((row) =>
          columns.map((c) => {
            const val = row[c.key as keyof T];
            return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
          }).join(","),
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
        {exportable && (
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
      </div>

      <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[hsl(var(--surface-muted))] border-b border-[hsl(var(--border))]">
                {onRowSelect && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[hsl(var(--border))]"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-semibold text-[hsl(var(--text-2))]",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.sortable && "cursor-pointer hover:bg-[hsl(var(--surface))]",
                      col.width && `w-[${col.width}]`,
                    )}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable && (
                        <span className="text-[hsl(var(--text-3))]">
                          {sortColumn === col.key ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onRowSelect ? 1 : 0)}
                    className="px-4 py-12 text-center text-[hsl(var(--text-2))]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b border-[hsl(var(--border))] transition-colors",
                      onRowClick && "cursor-pointer hover:bg-[hsl(var(--surface-muted))]",
                      selectedRows.has(idx) && "bg-[hsl(var(--primary)/0.1)]",
                    )}
                  >
                    {onRowSelect && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(idx)}
                          onChange={() => handleSelectRow(idx)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-[hsl(var(--border))]"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={cn(
                          "px-4 py-3 text-sm text-[hsl(var(--text-1))]",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                        )}
                      >
                        {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[hsl(var(--text-2))]">
            Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-[hsl(var(--text-2))]">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


