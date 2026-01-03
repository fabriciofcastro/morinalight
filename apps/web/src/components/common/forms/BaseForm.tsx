import { Button, cn } from "@morina/ui";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type BaseFormProps = {
    title: string;
    subtitle?: string;
    backLink?: string;
    onBack?: () => void;
    onSubmit: (e?: React.FormEvent) => void;
    submitting?: boolean;
    loading?: boolean;
    children: ReactNode;
    actions?: ReactNode;
    className?: string;
};

export function BaseForm({
    title,
    subtitle,
    backLink,
    onBack,
    onSubmit,
    submitting,
    loading,
    children,
    actions,
    className,
}: BaseFormProps) {
    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {(backLink || onBack) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mr-2 h-8 w-8"
                                onClick={onBack}
                                asChild={!!backLink}
                            >
                                {backLink ? (
                                    <Link href={backLink}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <ArrowLeft className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                        <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
                    </div>
                    {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {actions}
                    <Button onClick={onSubmit} disabled={submitting} className="min-w-[120px]">
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Salvar
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {children}
            </div>
        </div>
    );
}
