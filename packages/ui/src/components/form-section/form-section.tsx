"use client";

import React from "react";
import { cn } from "../../lib/cn";
import { semanticTokens } from "../../theme/semantic-tokens";
import { GlassCard } from "../glass-card";

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    children: React.ReactNode;
}

/**
 * FormSection - Group related form fields with a header
 *
 * @example
 * <FormSection title="Account Info" description="Basic details about the user">
 *   <FormInput label="Name" ... />
 * </FormSection>
 */
export function FormSection({
    title,
    description,
    children,
    className,
    ...props
}: FormSectionProps) {
    return (
        <GlassCard className={cn("p-6 space-y-6", className)} {...props}>
            <div className="space-y-1">
                <h3
                    className="text-lg font-semibold"
                    style={{ color: semanticTokens.color.text.primary }}
                >
                    {title}
                </h3>
                {description && (
                    <p
                        className="text-sm"
                        style={{ color: semanticTokens.color.text.secondary }}
                    >
                        {description}
                    </p>
                )}
            </div>

            <div className="space-y-4">
                {children}
            </div>
        </GlassCard>
    );
}
