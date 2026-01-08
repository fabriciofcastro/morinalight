"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    Sparkles,
    Code,
    Palette,
    Shield,
    Zap,
    Database,
    GitBranch,
    Users
} from "lucide-react";
import { GlassCard } from "@morina/ui";
import { AnimatedTechCorners } from "@/shared/ui/base/animated-tech-corners";
import { HoverBorderGradient } from "@/shared/ui/base/hover-border-gradient";

interface Feature {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    highlights: string[];
    color: string;
}

const features: Feature[] = [
    {
        id: "design-system",
        icon: Palette,
        title: "Design System Futurístico",
        description: "Componentes premium com animações cinematográficas e glassmorphism",
        highlights: [
            "50+ componentes reutilizáveis",
            "Animações GPU-accelerated",
            "Dark mode nativo",
            "WCAG 2.1 AA compliant"
        ],
        color: "text-purple-400"
    },
    {
        id: "security",
        icon: Shield,
        title: "Segurança Enterprise",
        description: "RBAC granular, MFA, auditoria completa e compliance total",
        highlights: [
            "CASL-based permissions",
            "Multi-factor authentication",
            "Audit trail completo",
            "LGPD, ISO 27001, SOC 2"
        ],
        color: "text-emerald-400"
    },
    {
        id: "performance",
        icon: Zap,
        title: "Performance Otimizada",
        description: "Lighthouse 96+, code splitting, caching inteligente",
        highlights: [
            "FCP < 1.5s",
            "TTI < 3s",
            "Bundle optimization",
            "Edge computing ready"
        ],
        color: "text-amber-400"
    },
    {
        id: "data",
        icon: Database,
        title: "Camada de Dados Robusta",
        description: "PostgreSQL, Redis, Event Sourcing e GraphQL otimizado",
        highlights: [
            "Type-safe queries",
            "Real-time sync",
            "Event sourcing",
            "Multi-layer caching"
        ],
        color: "text-blue-400"
    },
    {
        id: "cicd",
        icon: GitBranch,
        title: "CI/CD Automatizado",
        description: "Deploy em minutos com quality gates e testes automatizados",
        highlights: [
            "GitHub Actions",
            "Automated testing",
            "Preview deployments",
            "Zero-downtime deploys"
        ],
        color: "text-cyan-400"
    },
    {
        id: "dx",
        icon: Code,
        title: "Developer Experience",
        description: "TypeScript strict, ESLint, Prettier e documentação viva",
        highlights: [
            "Type safety end-to-end",
            "Auto-completion",
            "Hot reload",
            "Comprehensive docs"
        ],
        color: "text-pink-400"
    },
    {
        id: "ai-powered",
        icon: Sparkles,
        title: "IA Assistente",
        description: "Playbooks inteligentes com MCP e auto-completion",
        highlights: [
            "Context-aware wizards",
            "Smart suggestions",
            "Auto-validation",
            "Learning from usage"
        ],
        color: "text-violet-400"
    },
    {
        id: "collaboration",
        icon: Users,
        title: "Colaboração em Tempo Real",
        description: "Múltiplos usuários, notificações e sincronização automática",
        highlights: [
            "Real-time updates",
            "Activity feed",
            "Notifications",
            "Team workspaces"
        ],
        color: "text-green-400"
    }
];

export function PlaybookFeatures() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="features" ref={ref} className="relative py-32 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.08),transparent_60%)]" />
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
                        <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em] uppercase">
                            CORE_CAPABILITIES
                        </span>
                    </div>

                    <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                            Recursos
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                            de Ponta
                        </span>
                    </h2>

                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Cada feature construída com excelência. Do design à infraestrutura, tudo pensado para escalar.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.08,
                                    ease: "easeOut"
                                }}
                                whileHover={{
                                    y: -8,
                                    rotateY: 5,
                                    rotateX: 5,
                                    transition: { duration: 0.3, type: "spring", stiffness: 300 }
                                }}
                                style={{ perspective: "1000px" }}
                            >
                                <GlassCard className="relative h-full p-6 group overflow-hidden">
                                    <AnimatedTechCorners variant="gradient" />
                                    <HoverBorderGradient />

                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Scanline sweep effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-linear-to-b from-transparent via-[hsl(var(--primary))]/20 to-transparent pointer-events-none"
                                        initial={{ y: "-100%", opacity: 0 }}
                                        whileHover={{ y: "100%", opacity: 1 }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                    />

                                    <div className="relative z-10">
                                        {/* Icon */}
                                        <motion.div
                                            className={`w-14 h-14 border border-white/10 bg-white/5 flex items-center justify-center mb-4 group-hover:border-[hsl(var(--primary))]/30 group-hover:bg-[hsl(var(--primary))]/10 transition-all duration-300`}
                                            whileHover={{
                                                rotate: [0, -10, 10, -10, 0],
                                                scale: [1, 1.1, 1.1, 1.1, 1],
                                                transition: { duration: 0.5 }
                                            }}
                                        >
                                            <Icon className={`w-7 h-7 ${feature.color}`} />
                                        </motion.div>

                                        {/* Title */}
                                        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[hsl(var(--primary))] transition-colors">
                                            {feature.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm text-white/60 mb-4 leading-relaxed">
                                            {feature.description}
                                        </p>

                                        {/* Highlights */}
                                        <ul className="space-y-2">
                                            {feature.highlights.map((highlight, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: index * 0.08 + i * 0.05
                                                    }}
                                                    className="flex items-center gap-2 text-xs text-white/50"
                                                >
                                                    <div className="w-1 h-1 bg-[hsl(var(--primary))] flex-shrink-0" />
                                                    {highlight}
                                                </motion.li>
                                            ))}
                                        </ul>
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
