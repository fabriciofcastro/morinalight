import { Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface CompanyHeaderProps {
    completeness: number;
}

export function CompanyHeader({ completeness }: CompanyHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />

            <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl">
                {/* Tech corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)]">
                            <Building2 className="h-8 w-8 text-[hsl(var(--primary))]" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                                Dados da Empresa
                            </h1>
                            <p className="text-sm text-white/60 font-medium mt-1">
                                Configure a identidade e dados fiscais da sua organização
                            </p>
                        </div>
                    </div>
                </div>

                {/* Completeness Indicator */}
                <div className="hidden md:flex flex-col items-end gap-2">
                    <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Completude do Perfil
                    </span>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-bold text-white">{completeness}%</span>
                        </div>
                        <div className="relative h-12 w-12 flex items-center justify-center">
                            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-white/10"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    className="text-[hsl(var(--primary))]"
                                    strokeDasharray={`${completeness}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
