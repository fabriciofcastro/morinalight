'use client';

import { motion } from 'framer-motion';
import { Cpu, ExternalLink } from 'lucide-react';

// TODO: Substituir por fetch da API quando banco estiver pronto
const creatorsData = [
    {
        id: '1',
        displayName: 'Michel',
        role: 'Backend & Database',
        avatarUrl: null,
        portfolioUrl: null,
        iconColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgColor: 'bg-blue-500/10',
    },
    {
        id: '2',
        displayName: 'Adriana',
        role: 'Design & UX',
        avatarUrl: null,
        portfolioUrl: null,
        iconColor: 'text-purple-400',
        borderColor: 'border-purple-500/30',
        bgColor: 'bg-purple-500/10',
    },
    {
        id: '3',
        displayName: 'Fabrício',
        role: 'Engenheiro e Arquiteto de Software Fullstack',
        avatarUrl: null,
        portfolioUrl: 'https://www.fabriciofcastro.com.br/',
        iconColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        bgColor: 'bg-emerald-500/10',
    },
];

type Creator = typeof creatorsData[0];

export function CreatorsModule() {
    const creators = creatorsData;

    return (
        <div className="relative p-4 border border-white/10 bg-black/40 backdrop-blur-[2px] group overflow-hidden">
            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />

            {/* Scanline */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <Cpu className="h-3 w-3 text-[hsl(var(--primary))]" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/60">
                        IDEALIZADORES
                    </span>
                </div>
                <div className="flex gap-1">
                    <div className="h-1 w-1 bg-[hsl(var(--primary))] animate-pulse" />
                    <div className="h-1 w-1 bg-[hsl(var(--primary))] opacity-50" />
                    <div className="h-1 w-1 bg-[hsl(var(--primary))] opacity-25" />
                </div>
            </div>

            {/* Creators List */}
            <div className="space-y-2">
                {creators.map((creator, index) => (
                    <motion.a
                        key={creator.id}
                        href={creator.portfolioUrl || '#'}
                        target={creator.portfolioUrl ? '_blank' : undefined}
                        rel={creator.portfolioUrl ? 'noopener noreferrer' : undefined}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`flex items-center justify-between p-2 border ${creator.borderColor} ${creator.bgColor} hover:bg-white/10 transition-all cursor-pointer group/item`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Avatar Fallback */}
                            <div className={`relative w-8 h-8 border border-white/10 bg-black/50 overflow-hidden flex items-center justify-center ${creator.iconColor} text-xs font-bold`}>
                                {creator.displayName.charAt(0)}
                            </div>

                            {/* Info */}
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-white tracking-wider uppercase group-hover/item:text-[hsl(var(--primary))] transition-colors">
                                    {creator.displayName}
                                </span>
                                {creator.role && (
                                    <span className="text-[9px] text-white/40 font-mono">
                                        {creator.role}
                                    </span>
                                )}
                            </div>
                        </div>

                        {creator.portfolioUrl && (
                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <ExternalLink className={`h-3 w-3 ${creator.iconColor}`} />
                            </div>
                        )}
                    </motion.a>
                ))}
            </div>
        </div>
    );
}

export function CreatorsModuleSkeleton() {
    return (
        <div className="relative p-4 border border-white/10 bg-black/40 backdrop-blur-[2px] animate-pulse">
            <div className="h-6 bg-white/5 mb-4" />
            <div className="space-y-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-white/5" />
                ))}
            </div>
        </div>
    );
}
