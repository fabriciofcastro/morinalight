"use client";

import { HexagonGrid } from "@/components/login/hexagon-grid";
import { GlassCard } from "@morina/ui";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
    Boxes,
    Code2,
    Cpu,
    Database,
    Globe,
    Shield,
    Zap
} from "lucide-react";
import { useRef } from "react";

interface TechItem {
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    category: string;
}

const techItems: TechItem[] = [
    { name: "Next.js 16", description: "Frontend de alta performance com App Router e Turbopack", icon: Globe, color: "text-white", category: "Frontend" },
    { name: "Node.js", description: "Backend escalável e eficiente com arquitetura de microserviços", icon: Cpu, color: "text-emerald-400", category: "Runtime" },
    { name: "PostgreSQL", description: "Banco de dados relacional robusto com Prisma ORM", icon: Database, color: "text-blue-400", category: "Database" },
    { name: "TailwindCSS", description: "Estilização moderna e responsiva com design system atomizado", icon: Code2, color: "text-cyan-400", category: "Styling" },
    { name: "Framer Motion", description: "Animações fluidas e interativas de alta fidelidade", icon: Zap, color: "text-purple-400", category: "Animation" },
    { name: "Shield Security", description: "Proteção enterprise-grade com RBAC e monitoramento IDS", icon: Shield, color: "text-red-400", category: "Security" },
    { name: "Turbopack", description: "Bundler de próxima geração para desenvolvimento ultra-rápido", icon: Boxes, color: "text-orange-400", category: "Development" },
];

export function PlaybookTechStack() {
    const scrollRef = useRef(null);
    const isInView = useInView(scrollRef, { once: true, margin: "-100px" });
    const shouldReduceMotion = useReducedMotion();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.05,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.8, y: shouldReduceMotion ? 0 : 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <section ref={scrollRef} className="relative py-32 px-6 overflow-hidden">
            {/* Hexagon Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <HexagonGrid />
            </div>

            {/* Grid Overlay */}
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
                        <Boxes className="w-5 h-5 text-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em] uppercase">
                            TECH_STACK
                        </span>
                    </div>

                    <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                            Arsenal
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                            Tecnológico
                        </span>
                    </h2>

                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Stack moderno e escalável. Cada tecnologia escolhida para máxima performance e developer experience.
                    </p>
                </motion.div>

                {/* Tech Grid */}
                <motion.div
                    variants={containerVariants as any}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {techItems.map((tech, index) => {
                        const Icon = tech.icon;

                        return (
                            <motion.div
                                key={tech.name}
                                variants={itemVariants as any}
                                whileHover={{
                                    scale: 1.05,
                                    transition: { duration: 0.2 }
                                }}
                                className="relative group"
                            >
                                <GlassCard className="h-full p-8 border-white/10 bg-white/5 backdrop-blur-sm group-hover:border-[hsl(var(--primary))]/30 group-hover:bg-white/10 transition-all duration-300">
                                    {/* Icon with pulse animation */}
                                    <motion.div
                                        className="mb-6 w-12 h-12"
                                        animate={!shouldReduceMotion ? {
                                            scale: [1, 1.1, 1],
                                        } : {}}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: index * 0.2
                                        }}
                                    >
                                        <Icon className={`w-12 h-12 ${tech.color}`} />
                                    </motion.div>

                                    {/* Name & Category */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-white group-hover:text-[hsl(var(--primary))] transition-colors">
                                                {tech.name}
                                            </h3>
                                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                                {tech.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            {tech.description}
                                        </p>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
