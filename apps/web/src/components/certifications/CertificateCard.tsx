'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    Accessibility,
    Lock,
    FileCheck,
    Activity,
    CreditCard,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { Certification } from './types';

const IconMap = {
    ShieldCheck,
    Accessibility,
    Lock,
    FileCheck,
    Activity,
    CreditCard
};

interface CertificateCardProps {
    certification: Certification;
    index: number;
    onClick?: (cert: Certification) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certification, index, onClick }) => {
    const Icon = IconMap[certification.icon as keyof typeof IconMap] || ShieldCheck;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => onClick?.(certification)}
            className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden cursor-pointer"
        >
            {/* Animated Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${certification.status === 'complete'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                        {certification.status === 'complete' ? 'Concluído' : 'Preparado'}
                    </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {certification.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-6">
                    {certification.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 font-medium">
                        <span>Progresso de Conformidade</span>
                        <span className="text-blue-400">{certification.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${certification.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full rounded-full ${certification.status === 'complete' ? 'bg-emerald-500' : 'bg-blue-500'
                                }`}
                        />
                    </div>
                </div>

                {/* Footer Metrics */}
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>Nível Estável</span>
                    </div>
                    <div className="flex items-center text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Detalhes <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </div>
            </div>

            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
};
