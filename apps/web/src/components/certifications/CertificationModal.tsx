'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, FileText, Target, Calendar } from 'lucide-react';
import { Certification } from './types';

interface CertificationModalProps {
    certification: Certification | null;
    onClose: () => void;
}

export const CertificationModal: React.FC<CertificationModalProps> = ({ certification, onClose }) => {
    if (!certification) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Image/Background */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 -mt-12 relative">
                        <div className="flex items-end justify-between mb-8">
                            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 shadow-xl">
                                <div className="text-4xl text-blue-400">
                                    {certification.title.split(' ')[0]}
                                </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${certification.status === 'complete'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                {certification.status === 'complete' ? 'Certificado' : 'Em Preparação'}
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">{certification.title}</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            {certification.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Benefits */}
                            <div>
                                <h3 className="flex items-center gap-2 text-white font-bold mb-4">
                                    <Target className="w-5 h-5 text-blue-400" />
                                    Benefícios Principais
                                </h3>
                                <ul className="space-y-3">
                                    {certification.details.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Evidence */}
                            <div>
                                <h3 className="flex items-center gap-2 text-white font-bold mb-4">
                                    <FileText className="w-5 h-5 text-purple-400" />
                                    Evidências de Conformidade
                                </h3>
                                <div className="space-y-2">
                                    {certification.details.evidence.map((item, i) => (
                                        <div key={i} className="px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs text-gray-300">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Progress Footer */}
                        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{certification.progress}%</div>
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500">Prontidão</div>
                                </div>
                                <div className="h-12 w-px bg-white/10" />
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <Calendar className="w-4 h-4" />
                                    <span>Target: {certification.status === 'complete' ? 'Q4 2024' : '2025'}</span>
                                </div>
                            </div>

                            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all">
                                Baixar Certificado
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
