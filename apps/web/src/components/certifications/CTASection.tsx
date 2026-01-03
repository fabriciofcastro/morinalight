"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, ShieldCheck } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Segurança Levada a Sério
                    </h2>
                    <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                        A transparência é fundamental. Baixe nossos relatórios de auditoria e verifique pessoalmente nossos controles de segurança.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <span className="flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                Baixar Relatórios Públicos
                            </span>
                        </button>

                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                            Portal de Confiança
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Auditoria de Q3 2024 Disponível
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
