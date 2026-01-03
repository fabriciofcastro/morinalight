'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';

import { Certification } from '@/hooks/queries/use-certifications';

const StatItem = ({ label, value, description, index }: { label: string; value: string; description: string; index: number }) => {
    const numericValue = parseInt(value);
    const suffix = value.replace(/[0-9]/g, '');
    const animatedValue = useAnimatedCounter(numericValue);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="text-center"
        >
            <div className="text-4xl md:text-5xl font-extrabold text-blue-500 mb-2">
                {animatedValue}{suffix}
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-widest mb-1">
                {label}
            </div>
            <div className="text-xs text-gray-400">
                {description}
            </div>
        </motion.div>
    );
};

export const StatsSection = ({ certifications = [] }: { certifications?: any[] }) => {
    const total = certifications.length;
    const completed = certifications.filter(c => c.status === 'complete').length;
    const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inAudit = certifications.filter(c => c.status === 'in-progress' || c.status === 'prepared').length;

    const stats = [
        {
            label: 'Conformidade',
            value: `${complianceRate}%`,
            description: `${completed}/${total} Concluídas`
        },
        {
            label: 'Em Auditoria',
            value: `${inAudit}`,
            description: 'Processos em Verificação'
        },
        {
            label: 'Monitoramento',
            value: '24/7',
            description: 'Vigilância em Tempo Real'
        },
        {
            label: 'Score Médio',
            value: `${total > 0 ? Math.round(certifications.reduce((acc, c) => acc + (c.score || 0), 0) / total) : 0}`,
            description: 'Padrão de Excelência'
        }
    ];

    return (
        <section className="py-24 border-y border-white/5 bg-white/[0.02] relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 blur-[100px] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, index) => (
                        <StatItem key={index} {...stat} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

