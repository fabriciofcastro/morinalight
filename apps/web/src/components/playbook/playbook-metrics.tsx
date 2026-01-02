"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    Activity,
    Zap,
    Shield,
    Clock,
    Users,
    TrendingUp,
    Database,
    Cpu
} from "lucide-react";
import { GlassCard } from "@morina/ui";
import { AnimatedTechCorners } from "@/components/ui/animated-tech-corners";

interface Metric {
    id: string;
    icon: React.ElementType;
    label: string;
    value: string;
    unit: string;
    trend: string;
    trendDirection: "up" | "down" | "stable";
    description: string;
    color: string;
}

const metrics: Metric[] = [
    {
        id: "latency",
        icon: Activity,
        label: "Latência Média",
        value: "98",
        unit: "ms",
        trend: "+12%",
        trendDirection: "down",
        description: "Tempo médio de resposta das APIs",
        color: "text-blue-400"
    },
    {
        id: "playbooks",
        icon: Zap,
        label: "Playbooks Ativos",
        value: "12",
        unit: "",
        trend: "+3",
        trendDirection: "up",
        description: "Wizards automatizados prontos para uso",
        color: "text-amber-400"
    },
    {
        id: "coverage",
        icon: Shield,
        label: "Cobertura de Testes",
        value: "94",
        unit: "%",
        trend: "+5%",
        trendDirection: "up",
        description: "Código coberto por testes automatizados",
        color: "text-emerald-400"
    },
    {
        id: "uptime",
        icon: Clock,
        label: "Uptime",
        value: "99.9",
        unit: "%",
        trend: "stable",
        trendDirection: "stable",
        description: "Disponibilidade do sistema nos últimos 30 dias",
        color: "text-purple-400"
    },
    {
        id: "users",
        icon: Users,
        label: "Usuários Ativos",
        value: "247",
        unit: "",
        trend: "+18%",
        trendDirection: "up",
        description: "Usuários ativos nos últimos 7 dias",
        color: "text-cyan-400"
    },
    {
        id: "performance",
        icon: TrendingUp,
        label: "Lighthouse Score",
        value: "96",
        unit: "",
        trend: "+4",
        trendDirection: "up",
        description: "Performance, acessibilidade e SEO",
        color: "text-green-400"
    },
    {
        id: "database",
        icon: Database,
        label: "Query Time",
        value: "45",
        unit: "ms",
        trend: "-8%",
        trendDirection: "down",
        description: "Tempo médio de queries no banco",
        color: "text-indigo-400"
    },
    {
        id: "cpu",
        icon: Cpu,
        label: "CPU Usage",
        value: "32",
        unit: "%",
        trend: "-5%",
        trendDirection: "down",
        description: "Uso médio de CPU nos servidores",
        color: "text-pink-400"
    }
];

export function PlaybookMetrics() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-transparent via-[hsl(var(--primary))]/5 to-transparent">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em] uppercase">
                            REAL_TIME_METRICS
                        </span>
                    </div>

                    <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                            Telemetria
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                            em Tempo Real
                        </span>
                    </h2>

                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Métricas atualizadas continuamente. Monitoramento completo de performance, disponibilidade e uso.
                    </p>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, index) => {
                        const Icon = metric.icon;

                        return (
                            <motion.div
                                key={metric.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.05,
                                    type: "spring",
                                    stiffness: 100
                                }}
                            >
                                <GlassCard className="relative p-6 hover:bg-white/10 transition-all duration-300 group overflow-hidden">
                                    <AnimatedTechCorners variant="primary" />

                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="relative z-10">
                                        {/* Icon */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-[hsl(var(--primary))]/30 transition-colors`}>
                                                <Icon className={`w-6 h-6 ${metric.color}`} />
                                            </div>

                                            {/* Trend Badge */}
                                            <div className={`text-xs font-mono px-2 py-1 border ${metric.trendDirection === "up"
                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                                    : metric.trendDirection === "down"
                                                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                                                        : "border-white/10 bg-white/5 text-white/50"
                                                }`}>
                                                {metric.trend}
                                            </div>
                                        </div>

                                        {/* Label */}
                                        <div className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                                            {metric.label}
                                        </div>

                                        {/* Value */}
                                        <div className="flex items-baseline gap-2 mb-3">
                                            <motion.div
                                                className={`text-4xl font-bold ${metric.color}`}
                                                initial={{ opacity: 0 }}
                                                animate={isInView ? { opacity: 1 } : {}}
                                                transition={{ duration: 0.8, delay: index * 0.05 + 0.3 }}
                                            >
                                                {metric.value}
                                            </motion.div>
                                            {metric.unit && (
                                                <span className="text-lg text-white/40 font-mono">
                                                    {metric.unit}
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            {metric.description}
                                        </p>

                                        {/* Pulse indicator */}
                                        <div className="absolute top-4 right-4 w-2 h-2 bg-[hsl(var(--primary))] rounded-full animate-pulse" />
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Live Status Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-12"
                >
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-mono text-white/70 uppercase tracking-wider">
                                        SISTEMA OPERACIONAL
                                    </span>
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <span className="text-xs text-white/40 font-mono">
                                    Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                                </span>
                            </div>

                            <div className="flex items-center gap-6 text-xs font-mono text-white/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500" />
                                    <span>API: ONLINE</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500" />
                                    <span>DB: ONLINE</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500" />
                                    <span>CACHE: ONLINE</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </section>
    );
}
