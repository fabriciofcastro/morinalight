import { ReactNode } from "react";
import { cn } from "../../../lib/utils";

interface SectionCardProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    headerAction?: ReactNode;
}

export function SectionCard({ title, description, children, className, headerAction }: SectionCardProps) {
    return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl border border-white/10 bg-[#121212]/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50",
            className
        )}>
            {/* Gradient Glow Effect */}
            <div className="absolute -inset-px bg-gradient-to-r from-[hsl(var(--primary))]/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
                        {description && (
                            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                    {headerAction && (
                        <div className="flex-shrink-0">
                            {headerAction}
                        </div>
                    )}
                </div>

                <div className="relative">
                    {children}
                </div>
            </div>
        </div>
    );
}
