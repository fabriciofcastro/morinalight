"use client";

import React from "react";
import { cn } from "../../lib/cn";
import { Stepper, type Step } from "../stepper";

export interface FormWizardProps {
    steps: Step[];
    currentStep: number;
    onStepChange?: (step: number) => void;
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "vertical";
}

/**
 * FormWizard - Manages multi-step form flows
 *
 * @example
 * <FormWizard steps={steps} currentStep={currentStep}>
 *   {renderStepContent(currentStep)}
 * </FormWizard>
 */
export function FormWizard({
    steps,
    currentStep,
    onStepChange,
    children,
    className,
    variant = "default",
}: FormWizardProps) {
    return (
        <div className={cn("space-y-8", className)}>
            <div className="px-1">
                <Stepper
                    steps={steps}
                    currentStep={currentStep}
                    onStepChange={onStepChange}
                />
            </div>

            <div className="min-h-[300px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </div>
    );
}
