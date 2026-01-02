"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    Activity,
    CheckCircle2,
    Clock,
    Rocket,
    TrendingUp,
    Zap
} from "lucide-react";
import { GlassCard } from "@morina/ui";
import { AnimatedTechCorners } from "@/components/ui/animated-tech-corners";
import { Progress } from "@/components/ui/progress";

interface Milestone {
    id: string;
    title: string;
    status: "completed" | "in-progress" | "planned" | "future";
    progress: number;
    description: string;
    impact: string;
    completedAt?: string;
    eta?: string;
    features: string[];
}

const milestones: Milestone[] = [
    {
        id: "auth-system",
        title: "Sistema de Autenticação Cinematográfico",
        status: "completed",
        progress: 100,
        description: "Portal de login com vídeo imersivo, validações Zod e testes E2E garantindo narrativa de segurança.",
        impact: "Experiência premium de primeiro acesso",
        completedAt: "2025-12-15",
        features: [
            "Video background com fallback",
            "Formulário validado com Zod",
            "Testes E2E completos",
            "Auditoria de tentativas",
            "MFA opcional"
        ]
    },
    {
        id: "rbac-casl",
        title: "RBAC Granular com CASL",
        status: "completed",
        progress: 100,
        description: "Sistema de permissões baseado em CASL com abilities dinâmicas e guards de rota.",
        impact: "Controle de acesso enterprise-grade",
        completedAt: "2025-12-20",
        features: [
            "Abilities factory",
            "Route guards",
            "UI component guards",
            "Permission inheritance",
            "Real-time updates"
        ]
    },
    {
        id: "audit-system",
        title: "Sistema de Auditoria Completo",
        status: "in-progress",
        progress: 75,
        description: "Rastreamento completo de eventos com timeline interativa e logs SOC.",
        impact: "Compliance e rastreabilidade total",
        eta: "2026-01-15",
        features: [
            "Event sourcing",
            "Timeline interativa",
            "Logs estruturados",
            "Retention policies",
            "Export compliance"
        ]
    },
    {
        id: "design-system",
        title: "Design System Futurístico",
        status: "completed",
        progress: 100,
        description: "Sistema de design completo com componentes futurísticos, animações e tokens.",
        impact: "Consistência e velocidade de desenvolvimento",
        completedAt: "2025-12-28",
        features: [
            "Futuristic components",
            "Animation library",
            "Design tokens",
            "Glassmorphism",
            "Cinematic overlays"
        ]
    },
    {
        id: "error-handling",
        title: "Error Handling Avançado",
        status: "completed",
        progress: 100,
        description: "Sistema de tratamento de erros com categorização, telemetria e recovery automático.",
        impact: "Resiliência e debugging eficiente",
        completedAt: "2025-12-30",
        features: [
            "Error boundaries",
            "Error parser",
            "Telemetry integration",
            "User-friendly messages",
            "Auto-recovery"
        ]
    },
    {
        id: "data-connect",
        title: "Firebase Data Connect",
        status: "in-progress",
        progress: 60,
        description: "Integração com Firebase Data Connect para queries GraphQL otimizadas.",
        impact: "Performance e type-safety",
        eta: "2026-01-20",
        features: [
            "GraphQL schema",
            "Generated SDKs",
            "Real-time subscriptions",
            "Offline support",
            "Cloud SQL integration"
        ]
    },
    {
        id: "ai-playbooks",
        title: "Playbooks Assistidos por IA",
        status: "planned",
        progress: 25,
        description: "Wizards inteligentes usando MCP para guiar operações críticas.",
        impact: "Automação e redução de erros",
        eta: "2026-02-15",
        features: [
            "MCP integration",
            "Context-aware wizards",
            "Auto-completion",
            "Validation assistance",
            "Learning from usage"
        ]
    },
    {
        id: "analytics-dashboard",
        title: "Dashboard Analytics Avançado",
        status: "planned",
        progress: 15,
        description: "Visualizações interativas com charts futurísticos e métricas em tempo real.",
        impact: "Insights acionáveis",
        eta: "2026-03-01",
        features: [
            "Real-time metrics",
            "Custom dashboards",
            "Drill-down analysis",
            "Export reports",
            "Predictive analytics"
        ]
    },
    {
        id: "mobile-app",
        title: "Aplicativo Mobile Nativo",
        status: "future",
        progress: 0,
        description: "App nativo iOS/Android com sincronização offline e notificações push.",
        impact: "Mobilidade e acessibilidade",
        eta: "Q3 2026",
        features: [
            "React Native",
            "Offline-first",
            "Push notifications",
            "Biometric auth",
            "Native performance"
        ]
    },
    {
        id: "ai-insights",
        title: "AI Insights Engine",
        status: "future",
        progress: 0,
        description: "Motor de IA para análise preditiva e recomendações inteligentes.",
        impact: "Decisões data-driven",
        eta: "Q4 2026",
        features: [
            "Predictive analytics",
            "Anomaly detection",
            "Smart recommendations",
            "Natural language queries",
            "Auto-optimization"
        ]
    }
];

const statusConfig = {
    completed: {
        icon: CheckCircle2,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        label: "CONCLUÍDO"
    },
    "in-progress": {
        icon: Activity,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        label: "EM ANDAMENTO"
    },
    planned: {
        icon: Clock,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        label: "PLANEJADO"
    },
    future: {
        icon: Rocket,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
        label: "FUTURO"
    }
};

export function PlaybookRoadmap() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const stats = {
        completed: milestones.filter(m => m.status === "completed").length,
        inProgress: milestones.filter(m => m.status === "in-progress").length,
        planned: milestones.filter(m => m.status === "planned").length,
        future: milestones.filter(m => m.status === "future").length,
        totalProgress: Math.round(
            milestones.reduce((acc, m) => acc + m.progress, 0) / milestones.length
        )
    };

    return (
        <section ref={ref} className="relative py-32 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.05),transparent_70%)]" />
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
                        <TrendingUp className="w-5 h-5 text-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em] uppercase">
                            PROJECT_ROADMAP
                        </span>
                    </div>

                    <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                            Acompanhamento em
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                            Tempo Real
                        </span>
                    </h2>

                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Transparência total do desenvolvimento. Cada milestone rastreado com progresso real e impacto mensurável.
                    </p>
                </motion.div>

                {/* Stats Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16"
                >
                    <GlassCard className="p-6 text-center">
                        <div className="text-3xl font-bold text-emerald-400 mb-2">{stats.completed}</div>
                        <div className="text-xs font-mono text-white/50 uppercase tracking-wider">Concluídos</div>
                    </GlassCard>

                    <GlassCard className="p-6 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">{stats.inProgress}</div>
                        <div className="text-xs font-mono text-white/50 uppercase tracking-wider">Em Andamento</div>
                    </GlassCard>

                    <GlassCard className="p-6 text-center">
                        <div className="text-3xl font-bold text-amber-400 mb-2">{stats.planned}</div>
                        <div className="text-xs font-mono text-white/50 uppercase tracking-wider">Planejados</div>
                    </GlassCard>

                    <GlassCard className="p-6 text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">{stats.future}</div>
                        <div className="text-xs font-mono text-white/50 uppercase tracking-wider">Futuros</div>
                    </GlassCard>

                    <GlassCard className="p-6 text-center col-span-2 md:col-span-1">
                        <div className="text-3xl font-bold text-[hsl(var(--primary))] mb-2">{stats.totalProgress}%</div>
                        <div className="text-xs font-mono text-white/50 uppercase tracking-wider">Progresso Total</div>
                    </GlassCard>
                </motion.div>

                {/* Milestones Timeline */}
                <div className="space-y-6">
                    {milestones.map((milestone, index) => {
                        const config = statusConfig[milestone.status];
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, x: -30 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                            >
                                <GlassCard className="relative p-6 hover:bg-white/5 transition-all duration-300 group">
                                    <AnimatedTechCorners variant="primary" animate={milestone.status === "in-progress"} />

                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Status Badge */}
                                        <div className="flex-shrink-0">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 border ${config.borderColor} ${config.bgColor} backdrop-blur-sm`}>
                                                <Icon className={`w-4 h-4 ${config.color}`} />
                                                <span className={`text-xs font-mono ${config.color} tracking-wider`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                                                        {milestone.title}
                                                    </h3>
                                                    <p className="text-sm text-white/60">
                                                        {milestone.description}
                                                    </p>
                                                </div>

                                                <div className="flex-shrink-0 text-right">
                                                    <div className="text-2xl font-bold text-[hsl(var(--primary))] mb-1">
                                                        {milestone.progress}%
                                                    </div>
                                                    {milestone.completedAt && (
                                                        <div className="text-xs text-white/40 font-mono">
                                                            {milestone.completedAt}
                                                        </div>
                                                    )}
                                                    {milestone.eta && (
                                                        <div className="text-xs text-white/40 font-mono">
                                                            ETA: {milestone.eta}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <Progress value={milestone.progress} className="h-2" />
                                            </div>

                                            {/* Impact */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <Zap className="w-4 h-4 text-amber-400" />
                                                <span className="text-sm text-white/70">
                                                    <span className="text-white/40 font-mono text-xs uppercase tracking-wider mr-2">
                                                        Impacto:
                                                    </span>
                                                    {milestone.impact}
                                                </span>
                                            </div>

                                            {/* Features */}
                                            <div className="flex flex-wrap gap-2">
                                                {milestone.features.map((feature, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-xs px-3 py-1 border border-white/10 bg-white/5 text-white/60 font-mono"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
