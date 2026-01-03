'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const HeroSection = () => {
    return (
        <section className="relative min-height-[80vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl mx-auto z-10"
            >
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/30 rounded-full bg-blue-500/10"
                >
                    Segurança e Conformidade
                </motion.span>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">
                    Certificações de <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Classe Mundial
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12">
                    A Morina Light mantém os mais rigorosos padrões globais de segurança,
                    privacidade e acessibilidade para garantir a excelência técnica
                    em cada pixel entregue.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                        Ver Documentação
                    </button>
                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all hover:scale-105 active:scale-95">
                        Relatórios de Auditoria
                    </button>
                </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Deslize para explorar</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown className="w-6 h-6 text-blue-400/50" />
                </motion.div>
            </motion.div>
        </section>
    );
};
