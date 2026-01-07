"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Wizard, type WizardProps } from "./stepper";

export interface FormWizardProps extends WizardProps {
    /**
     * Title of the wizard
     */
    title: string;
    /**
     * Description of the wizard
     */
    description?: string;
    /**
     * Optional custom header content
     */
    headerAction?: React.ReactNode;
}

export function FormWizard({
    title,
    description,
    headerAction,
    ...props
}: FormWizardProps) {
    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <div className="space-y-1.5">
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                {headerAction && <div>{headerAction}</div>}
            </CardHeader>
            <CardContent>
                <Wizard {...props} />
            </CardContent>
        </Card>
    );
}
