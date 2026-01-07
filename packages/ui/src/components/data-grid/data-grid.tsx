"use client";

import { Children, isValidElement } from "react";
import { cn } from "../../lib/cn";
import type { DataGridProps } from "./data-grid.types";
import { DataGridItem } from "./data-grid-item";
import { DataGridSkeleton } from "./data-grid-skeleton";

/**
 * DataGrid - Grid responsivo para visualização de dados (Cards)
 *
 * @example
 * ```tsx
 * <DataGrid loading={isLoading}>
 *   {items.map((item) => (
 *     <DataGridItem key={item.id}>
 *       <Card>{item.name}</Card>
 *     </DataGridItem>
 *   ))}
 * </DataGrid>
 * ```
 */
export function DataGrid({
  children,
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },
  gap = "md",
  loading = false,
  skeletonCount = 6,
  emptyState,
  className,
}: DataGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
  };

  const gapSizes = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  // Classes responsivas
  const responsiveClasses = cn(
    gridCols[columns.mobile || 1],
    columns.tablet && `md:${gridCols[columns.tablet]}`,
    columns.desktop && `lg:${gridCols[columns.desktop]}`,
    columns.wide && `xl:${gridCols[columns.wide]}`,
  );

  if (loading) {
    return (
      <div className={cn("grid", responsiveClasses, gapSizes[gap], className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <DataGridSkeleton key={i} />
        ))}
      </div>
    );
  }

  const childCount = Children.count(children);

  if (childCount === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn("grid", responsiveClasses, gapSizes[gap], className)}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        // Se já for DataGridItem, passar delay
        if (child.type === DataGridItem) {
          return React.cloneElement(child as React.ReactElement<any>, {
            animationDelay: index * 0.05,
          });
        }

        // Se não, envolver em DataGridItem
        return <DataGridItem animationDelay={index * 0.05}>{child}</DataGridItem>;
      })}
    </div>
  );
}

// Import necessário para o check de tipo (mas React já está no scopo global do Next.js/etc normalmente,
// importando explicitamente para segurança)
import React from "react";
