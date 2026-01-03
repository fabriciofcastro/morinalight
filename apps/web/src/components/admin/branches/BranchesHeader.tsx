import { GitBranch, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface BranchesHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

export function BranchesHeader({ title, subtitle, breadcrumbs }: BranchesHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-8"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.1)] via-transparent to-[hsl(var(--accent)/0.1)] blur-3xl -z-10" />

            <div className="relative flex flex-col gap-4 p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl">
                {/* Tech corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

                {/* Breadcrumbs */}
                {breadcrumbs && (
                    <nav className="flex items-center gap-2 text-sm text-white/40">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && <ChevronRight className="h-4 w-4" />}
                                {crumb.href ? (
                                    <Link href={crumb.href} className="hover:text-white transition-colors">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-white/80 font-medium">{crumb.label}</span>
                                )}
                            </div>
                        ))}
                    </nav>
                )}

                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)]">
                        <GitBranch className="h-8 w-8 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-white/60 font-medium mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
