'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CertificateCardProps {
    name: string;
    status: 'complete' | 'prepared';
    score: number;
    icon: React.ReactNode;
    color: string;
    description: string;
    benefits: string[];
    evidence: string[];
    link?: string;
}

export function CertificateCard({
    name,
    status,
    score,
    icon,
    color,
    description,
    benefits,
    evidence,
    link,
}: CertificateCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <motion.div
                className="group relative h-full cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsExpanded(true)}
            >
                {/* Tech Border Wrapper */}
                <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 via-transparent to-white/10 opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                {/* Main Card Chassis */}
                <div className="relative h-full overflow-hidden bg-black/60 backdrop-blur-xl border border-white/10 p-1 group-hover:border-white/20 transition-colors duration-300">
                    {/* Inner Container */}
                    <div className="relative h-full bg-gradient-to-b from-white/5 to-transparent p-6 overflow-hidden">

                        {/* Scanline Overlay (On Hover) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 z-0 pointer-events-none" />

                        {/* Header: Icon & Status */}
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-lg group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300">
                                <div className="text-white mix-blend-screen">{icon}</div>
                            </div>

                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono tracking-wider backdrop-blur-md uppercase",
                                status === 'complete'
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            )}>
                                <Activity className="w-3 h-3 animate-pulse" />
                                {status === 'complete' ? 'SISTEMA ATIVO' : 'INICIALIZANDO'}
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="mb-8 relative z-10">
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-cyan-200 transition-colors">
                                {name}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-white/10 pl-3">
                                {description}
                            </p>
                        </div>

                        {/* Tech Stats / HUD Elements */}
                        <div className="relative z-10 bg-black/40 p-4 border border-white/5">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Nível de Compliance</span>
                                <span className="text-xl font-bold font-mono" style={{ color }}>{score}%</span>
                            </div>

                            {/* Animated Progress Bar */}
                            <div className="h-1.5 bg-gray-800 overflow-hidden relative">
                                <motion.div
                                    className="h-full relative overflow-hidden"
                                    style={{ backgroundColor: color }}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${score}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-[shine_1s_infinite]" />
                                </motion.div>
                            </div>

                            <div className="mt-3 flex justify-between text-[10px] text-gray-500 font-mono">
                                <span>PROT_SEG_V4.2</span>
                                <span>VERIFICADO</span>
                            </div>
                        </div>

                        {/* Hover Action */}
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <ExternalLink className="w-5 h-5 text-cyan-400" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Expanded Modal */}
            <AnimatePresence>
                {isExpanded && (
                    <CertificateModal
                        {...{ name, status, score, icon, color, description, benefits, evidence, link }}
                        onClose={() => setIsExpanded(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

function CertificateModal({
    name,
    status,
    score,
    icon,
    color,
    description,
    benefits,
    evidence,
    link,
    onClose,
}: CertificateCardProps & { onClose: () => void }) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />

            <motion.div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-black/80 border border-white/10 shadow-2xl flex flex-col md:flex-row"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                layoutId={`card-${name}`}
            >
                {/* Left Panel: Visual & Stats */}
                <div className="w-full md:w-1/3 bg-white/5 p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-indigo-500/20 to-transparent blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    <div>
                        <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-transparent border border-white/20 flex items-center justify-center mb-6 shadow-lg">
                            {icon}
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 leading-tight">{name}</h2>
                        <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono tracking-wider uppercase",
                            status === 'complete'
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        )}>
                            <ShieldCheck className="w-3 h-3" />
                            Status: {status}
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="font-mono text-xs text-gray-500 mb-2 uppercase tracking-widest">Score de Compliance</div>
                        <div className="text-5xl font-bold text-white mb-4 tracking-tighter">{score}%</div>
                        <div className="h-2 bg-gray-800 overflow-hidden">
                            <motion.div
                                className="h-full"
                                style={{ backgroundColor: color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Data */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        ✕
                    </button>

                    <div className="prose prose-invert max-w-none">
                        <div className="mb-8">
                            <h3 className="flex items-center gap-2 text-sm font-mono text-indigo-400 mb-4 uppercase tracking-wider">
                                <Terminal className="w-4 h-4" /> Descrição
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-lg">{description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    Benefícios Chave
                                </h3>
                                <ul className="space-y-3">
                                    {benefits.map((benefit, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-3 text-gray-400 text-sm"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-green-500/80 mt-0.5 shrink-0" />
                                            {benefit}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    Evidências e Logs
                                </h3>
                                <div className="space-y-2">
                                    {evidence.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 + 0.2 }}
                                            className="px-3 py-2 bg-white/5 border border-white/5 text-xs font-mono text-cyan-300/80 flex items-center gap-2"
                                        >
                                            <span className="w-1 h-1 bg-cyan-500 rounded-full" />
                                            {item}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {link && (
                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                            >
                                Acessar Documentação Oficial
                                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

