"use client";

import React from "react";
import { cn } from "../../lib/cn";
import { PageHeader } from "../page-header";
import type { PageHeaderProps } from "../page-header/page-header.types";
import { ListControls } from "../list-controls";
import type { ListControlsProps } from "../list-controls/list-controls.types";
import { Pagination } from "../pagination";
import type { PaginationProps } from "../pagination";

export interface ListPageLayoutControlsProps {
    /** Search value */
    searchValue?: string;
    /** Search change handler */
    onSearchChange?: (value: string) => void;
    /** Search placeholder */
    searchPlaceholder?: string;
    /** Loading state */
    loading?: boolean;
    /** Filter button */
    filterButton?: React.ReactNode;
    /** View toggle */
    viewToggle?: React.ReactNode;
    /** Actions (e.g., "New Item" button) */
    actions?: React.ReactNode;
    /** Bulk actions bar (shown when hasSelection is true) */
    bulkActions?: React.ReactNode;
    /** Has items selected */
    hasSelection?: boolean;
}

export interface ListPageLayoutProps {
    header: PageHeaderProps;
    /** New controls API - individual props */
    controls?: ListPageLayoutControlsProps;
    /** Legacy controls API - for backward compatibility */
    legacyControls?: ListControlsProps;
    children: React.ReactNode;
    pagination?: PaginationProps;
    className?: string;
}

/**
 * ListPageLayout - Standard template for list pages
 *
 * Supports both new and legacy controls API for backward compatibility.
 *
 * @example New API
 * <ListPageLayout
 *   header={{ title: "Customers", stats: <StatsGroup>...</StatsGroup> }}
 *   controls={{
 *     searchValue: search,
 *     onSearchChange: setSearch,
 *     filterButton: <Button>Filters</Button>,
 *     viewToggle: <ViewToggle />,
 *     actions: <Button>New</Button>,
 *   }}
 *   pagination={{ total: 100, page: 1, pageSize: 20, ... }}
 * >
 *   <DataGrid ... />
 * </ListPageLayout>
 *
 * @example Legacy API
 * <ListPageLayout
 *   header={{ title: "Customers", ... }}
 *   legacyControls={{ searchValue: search, onSearchChange: setSearch, ... }}
 *   pagination={{ totalPages: 10, currentPage: 1, ... }}
 * >
 *   <DataGrid ... />
 * </ListPageLayout>
 */
export function ListPageLayout({
    header,
    controls,
    legacyControls,
    children,
    pagination,
    className,
}: ListPageLayoutProps) {
    // Use new controls API if provided, otherwise fall back to legacy
    const useNewAPI = controls !== undefined;

    return (
        <div className={cn("space-y-8 p-6 pb-20 fade-in-up", className)}>
            {/* Header */}
            <PageHeader {...header} />

            <div className="space-y-6">
                {/* Controls */}
                {useNewAPI && controls ? (
                    <ListControls
                        searchValue={controls.searchValue || ""}
                        onSearchChange={controls.onSearchChange || (() => { })}
                        searchPlaceholder={controls.searchPlaceholder}
                        loading={controls.loading}
                        filterButton={controls.filterButton}
                        viewToggle={controls.viewToggle}
                        actions={controls.actions}
                        bulkActions={controls.bulkActions}
                        hasSelection={controls.hasSelection}
                    />
                ) : legacyControls ? (
                    <ListControls {...legacyControls} />
                ) : null}

                {/* List Content */}
                <div className="min-h-[400px]">{children}</div>

                {/* Pagination */}
                {pagination && (
                    <div className="flex justify-center pt-8">
                        <Pagination {...pagination} />
                    </div>
                )}
            </div>
        </div>
    );
}
