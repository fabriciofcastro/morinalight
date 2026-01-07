"use client";

import { cn } from "../../lib/cn";
import type { DataListProps } from "./data-list.types";
import { DataListSkeleton } from "./data-list-skeleton";

/**
 * DataList - Lista vertical de dados
 *
 * @example
 * ```tsx
 * <DataList loading={isLoading} divided>
 *   {items.map(item => (
 *     <DataListItem key={item.id} title={item.name} />
 *   ))}
 * </DataList>
 * ```
 */
export function DataList({
  children,
  loading = false,
  skeletonCount = 5,
  emptyState,
  divided = true,
  className,
}: DataListProps) {
  if (loading) {
    return (
      <div className={cn("flex flex-col", className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <DataListSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!children && emptyState) {
    return <>{emptyState}</>;
  }

  // Verificar se children é vazio (React.Children.count) ou array vazio
  if (Array.isArray(children) && children.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return <div className={cn("flex flex-col", divided && "divide-y", className)}>{children}</div>;
}
