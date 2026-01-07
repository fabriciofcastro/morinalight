"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { cn } from "../lib/cn";

/**
 * VirtualList Component - TanStack Virtual Integration
 *
 * Features:
 * - Virtualized rendering for large lists
 * - Smooth scrolling
 * - Dynamic item heights
 * - Design System styling
 * - Performance optimized
 */

export interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Estimated item height (for performance) */
  estimateSize?: number;
  /** Container height */
  height?: string | number;
  /** Gap between items */
  gap?: number;
  /** Custom className */
  className?: string;
  /** Overscan count (items to render outside viewport) */
  overscan?: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 50,
  height = "600px",
  gap = 8,
  className,
  overscan = 5,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    gap,
  });

  return (
    <div
      ref={parentRef}
      className={cn(
        "overflow-auto",
        "bg-surface border border-border rounded-none",
        "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
        className,
      )}
      style={{ height }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            className={cn("absolute top-0 left-0 w-full", "transition-all duration-200")}
            style={{
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index]!, virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * VirtualGrid Component - TanStack Virtual Grid
 *
 * Features:
 * - Virtualized 2D grid
 * - Responsive columns
 * - Design System styling
 */

export interface VirtualGridProps<T> {
  /** Array of items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Number of columns */
  columns?: number;
  /** Estimated item height */
  estimateSize?: number;
  /** Container height */
  height?: string | number;
  /** Gap between items */
  gap?: number;
  /** Custom className */
  className?: string;
}

export function VirtualGrid<T>({
  items,
  renderItem,
  columns = 3,
  estimateSize = 200,
  height = "600px",
  gap = 16,
  className,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows
  const rows = Math.ceil(items.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 2,
  });

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", "bg-surface border border-border rounded-none", className)}
      style={{ height }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
              }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => {
                const itemIndex = virtualRow.index * columns + colIndex;
                if (itemIndex >= items.length) return null;
                return <div key={colIndex}>{renderItem(items[itemIndex]!, itemIndex)}</div>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * VirtualTable Component - TanStack Virtual + Table
 * Optimized for large datasets
 */

export interface VirtualTableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  width?: string;
}

export interface VirtualTableProps<T> {
  /** Array of items */
  items: T[];
  /** Column definitions */
  columns: VirtualTableColumn<T>[];
  /** Row height */
  rowHeight?: number;
  /** Container height */
  height?: string | number;
  /** Custom className */
  className?: string;
}

export function VirtualTable<T>({
  items,
  columns,
  rowHeight = 48,
  height = "600px",
  className,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  return (
    <div className={cn("border border-border rounded-none overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border">
        <div
          className="grid"
          style={{ gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" ") }}
        >
          {columns.map((column) => (
            <div key={column.key} className="px-4 py-3 text-sm font-semibold text-text-primary">
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div ref={parentRef} className="overflow-auto bg-surface" style={{ height }}>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index]!;
            return (
              <div
                key={virtualRow.key}
                className={cn(
                  "absolute top-0 left-0 w-full",
                  "border-b border-border",
                  "hover:bg-surface-elevated transition-colors",
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className="grid h-full items-center"
                  style={{ gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" ") }}
                >
                  {columns.map((column) => (
                    <div key={column.key} className="px-4 text-sm text-text-secondary">
                      {column.render(item)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
