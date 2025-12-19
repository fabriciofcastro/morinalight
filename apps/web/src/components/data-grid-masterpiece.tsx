"use client";

import { cn } from "@morina/ui";
import type { ReactNode } from "react";

export type Column<T = unknown> = {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => ReactNode;
};

type DataGridMasterpieceProps<T = unknown> = {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  className?: string;
};

export function DataGridMasterpiece<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  className,
}: DataGridMasterpieceProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[hsl(var(--border))]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-sm font-semibold text-[hsl(var(--text-2))]",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.width && `w-[${col.width}]`,
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-b border-[hsl(var(--border))] transition-colors",
                onRowClick && "cursor-pointer hover:bg-[hsl(var(--surface-muted))]",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-sm text-[hsl(var(--text-1))]",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                  )}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}














