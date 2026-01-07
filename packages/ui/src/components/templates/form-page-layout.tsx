"use client";

import React from "react";
import { cn } from "../../lib/cn";
import { PageHeader } from "../page-header";
import type { PageHeaderProps } from "../page-header/page-header.types";
import { FormActionsBar, type FormActionsBarProps } from "../form-actions-bar";

export interface FormPageLayoutProps {
    header: PageHeaderProps;
    children: React.ReactNode;
    actions?: Omit<FormActionsBarProps, "children"> & { content: React.ReactNode };
    className?: string;
}

/**
 * FormPageLayout - Standard template for form pages (create/edit)
 *
 * @example
 * <FormPageLayout
 *   header={{ title: "New Customer", ... }}
 *   actions={{ content: <Button>Save</Button> }}
 * >
 *   <form>...</form>
 * </FormPageLayout>
 */
export function FormPageLayout({
    header,
    children,
    actions,
    className,
}: FormPageLayoutProps) {
    return (
        <div className={cn("space-y-8 p-6 pb-32 fade-in-up", className)}>
            {/* Header */}
            <PageHeader {...header} />

            {/* Form Content */}
            <div className="max-w-5xl mx-auto">
                {children}
            </div>

            {/* Actions */}
            {actions && (
                <FormActionsBar {...actions}>
                    {actions.content}
                </FormActionsBar>
            )}
        </div>
    );
}
