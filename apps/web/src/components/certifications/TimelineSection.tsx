'use client';

import React from 'react';
import { motion } from 'framer-motion';

const milestones = [
    { year: '2023', title: 'LGPD & WCAG', description: 'Conclusão da conformidade total com privacidade e acessibilidade.' },
    { year: '2024', title: 'OWASP Top 10', description: 'Certificação de segurança das aplicações Morina Light.' },
    { year: '2025 Q1', title: 'ISO 27001', description: 'Início da jornada para certificação global SGSI.' },
    { year: '2025 Q3', title: 'SOC 2 & PCI', description: 'Expansão para auditorias Tipo II e conformidade bancária.' }
];

export const TimelineSection = () => {
    return (
        <section className="py-24 max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Jornada de Inovação</h2>
                <p className="text-gray-400">Nossa evolução constante rumo à segurança absoluta.</p>
            </div>

            <div className="relative">
                {/* Horizontal Line (Desktop) */}
                <div className="hidden lg:block absolute top-[4.5rem] left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
                    {milestones.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Marker */}
                            <div className="hidden lg:flex items-center justify-center mb-8 relative z-10">
                                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
                                <div className="text-blue-500 font-extrabold text-2xl mb-2">{item.year}</div>
                                <h4 className="text-white font-bold text-lg mb-3 group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
