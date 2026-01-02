
'use client';

import { motion } from 'framer-motion';
import { Shield, Globe, Lock, FileCheck, Award, Zap } from 'lucide-react';

interface TimelineEvent {
    year: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    status: 'completed' | 'current' | 'future';
    color: string;
}

const events: TimelineEvent[] = [
    {
        year: '2024 Q1',
        title: 'Fundação da Segurança',
        description: 'Implementação do Core Security, LGPD Compliance inicial e OWASP Top 10 mitigation.',
        icon: <Shield className="w-5 h-5 text-white" />,
        status: 'completed',
        color: '#10b981' // emerald
    },
    {
        year: '2024 Q3',
        title: 'Expansão Global (GDPR)',
        description: 'Adequação completa às normas europeias e implementação de Privacy by Design.',
        icon: <Globe className="w-5 h-5 text-white" />,
        status: 'completed',
        color: '#3b82f6' // blue
    },
    {
        year: '2025 Q1',
        title: 'NIST Framework',
        description: 'Adoção do framework de cibersegurança do governo americano (Tier 3).',
        icon: <Lock className="w-5 h-5 text-white" />,
        status: 'completed',
        color: '#6366f1' // indigo
    },
    {
        year: '2025 Q4',
        title: 'Pre-Audit ISO 27001',
        description: 'Finalização de 95% dos controles e auditoria interna de preparação.',
        icon: <FileCheck className="w-5 h-5 text-white" />,
        status: 'completed',
        color: '#f59e0b' // amber
    },
    {
        year: '2026 Q2',
        title: 'Auditoria Externa',
        description: 'Fase atual: Auditoria oficial para certificação ISO 27001 e SOC 2 Type II.',
        icon: <Award className="w-5 h-5 text-white" />,
        status: 'current',
        color: '#ec4899' // pink
    },
    {
        year: '2027',
        title: 'Zero Trust IA',
        description: 'Próximo passo: Implementação total de segurança autônoma gerida por IA.',
        icon: <Zap className="w-5 h-5 text-white" />,
        status: 'future',
        color: '#8b5cf6' // purple
    }
];

export function TimelineSection() {
    return (
        <section className="container mx-auto px-4 py-20 relative">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mb-16 text-center"
            >
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Nossa Jornada de Confiança</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    A segurança não é um destino, é um caminho contínuo de evolução e melhoria.
                </p>
            </motion.div>

            <div className="relative max-w-4xl mx-auto">
                {/* Central Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent -translate-x-1/2 hidden md:block" />

                <div className="space-y-12">
                    {events.map((event, index) => (
                        <div key={index} className="relative flex items-center justify-between md:justify-center group">

                            {/* Desktop: Alternating Sides */}
                            <div className={`hidden md:block w-1/2 px-8 ${index % 2 === 0 ? 'text-right' : 'order-last text-left'}`}>
                                <EventCard event={event} align={index % 2 === 0 ? 'right' : 'left'} />
                            </div>

                            {/* Center Point */}
                            <div className="absolute left-0 md:left-1/2 w-8 h-8 flex items-center justify-center -translate-x-1/2 z-10">
                                <motion.div
                                    className="relative w-4 h-4 rounded-full border-2 bg-[#0a0a0f]"
                                    style={{ borderColor: event.color }}
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: event.color }} />
                                </motion.div>
                            </div>

                            {/* Mobile: All on Right (or adjusted) */}
                            <div className="md:hidden w-full pl-8 border-l border-white/10 ml-4 pb-8 last:pb-0">
                                <EventCard event={event} align="left" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function EventCard({ event, align }: { event: TimelineEvent; align: 'left' | 'right' }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: align === 'left' ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className={`relative p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group-hover:shadow-[0_0_30px_-10px_${event.color}]`}
        >
            <div className={`flex items-center gap-3 mb-2 ${align === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="font-mono text-sm font-bold tracking-wider" style={{ color: event.color }}>
                    {event.year}
                </span>
                <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-${event.color}/20`} style={{ backgroundColor: `${event.color}33` }} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>

            {event.status === 'current' && (
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-pink-500/20 text-pink-400 text-xs font-bold rounded-full border border-pink-500/30 animate-pulse">
                    EM ANDAMENTO
                </div>
            )}
        </motion.div>
    );
}
