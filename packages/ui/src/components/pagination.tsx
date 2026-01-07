"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import * as React from "react";
import { cn } from "../lib/cn";
import { Button } from "./button";

/**
 * Pagination Component - Enterprise Grade
 *
 * Features:
 * - Page navigation
 * - Page size selector
 * - Jump to page
 * - Responsive
 * - Theme-aware
 */

export interface PaginationProps {
  /** Total number of items */
  total: number;
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Show page size selector */
  showPageSize?: boolean;
  /** Show first/last buttons */
  showFirstLast?: boolean;
  /** Max page buttons to show */
  siblingCount?: number;
  /** Custom className */
  className?: string;
}

export function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  showFirstLast = true,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const canPrevious = page > 1;
  const canNext = page < totalPages;

  // Generate page numbers to display
  const pages = React.useMemo(() => {
    const range = (start: number, end: number) =>
      Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const totalNumbers = siblingCount * 2 + 3; // siblings + current + first + last
    const totalBlocks = totalNumbers + 2; // + 2 ellipsis

    if (totalPages <= totalBlocks) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftRange = range(1, 3 + 2 * siblingCount);
      return [...leftRange, "ellipsis", totalPages];
    }

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightRange = range(totalPages - (3 + 2 * siblingCount) + 1, totalPages);
      return [1, "ellipsis", ...rightRange];
    }

    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [1, "ellipsis", ...middleRange, "ellipsis", totalPages];
  }, [page, totalPages, siblingCount]);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* Page size selector */}
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(
              "h-9 px-3 rounded-none",
              "bg-surface border border-border",
              "text-sm text-text-primary",
              "focus:outline-none focus:ring-2 focus:ring-primary",
            )}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-text-secondary">per page</span>
        </div>
      )}

      {/* Page info */}
      <div className="text-sm text-text-secondary">
        Showing {Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)}{" "}
        of {total} results
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        {showFirstLast && (
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => onPageChange(1)}
            disabled={!canPrevious}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="iconSm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((pageNum, index) =>
          pageNum === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2">
              <MoreHorizontal className="h-4 w-4 text-text-tertiary" />
            </span>
          ) : (
            <Button
              key={pageNum}
              variant={page === pageNum ? "default" : "outline"}
              size="iconSm"
              onClick={() => onPageChange(pageNum as number)}
            >
              {pageNum}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="iconSm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {showFirstLast && (
          <Button
            variant="outline"
            size="iconSm"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNext}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

Pagination.displayName = "Pagination";
