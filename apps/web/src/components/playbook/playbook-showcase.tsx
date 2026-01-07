"use client";

import { AnimatedTechCorners } from "@/components/ui/animated-tech-corners";
import { GlassCard } from "@morina/ui";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PlaybookItem {
    id: string;
    title: string;
    description: string;
    category: string;
    features: string[];
    status: "live" | "beta" | "planned";
}

const playbooks: PlaybookItem[] = [
    {
        id: "user-onboarding",
        title: "Onboarding de Usuários",
        description: "Wizard assistido para cadastro completo de usuários com validações inteligentes",
        category: "Gestão de Pessoas",
        features: ["Validação em tempo real", "Upload de documentos", "Integração com AD", "Notificações automáticas"],
        status: "live"
    },
    {
        id: "product-catalog",
        title: "Catálogo de Produtos",
        description: "Gestão completa de produtos com categorias, variantes e precificação dinâmica",
        category: "Catálogo",
        features: ["Importação em lote", "Gestão de estoque", "Precificação automática", "SEO otimizado"],
        status: "live"
    },
    {
        id: "inventory-management",
        title: "Controle de Inventário",
        description: "Sistema de inventário com rastreamento em tempo real e alertas automáticos",
        category: "Operações",
        features: ["Rastreamento RFID", "Alertas de estoque", "Relatórios preditivos", "Integração ERP"],
        status: "beta"
    },
    {
        id: "analytics-dashboard",
        title: "Dashboard Analytics",
        description: "Visualizações interativas com métricas de negócio em tempo real",
        category: "Analytics",
        features: ["Métricas customizáveis", "Drill-down analysis", "Export automático", "Alertas inteligentes"],
        status: "planned"
    }
];

const statusConfig = {
    live: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "LIVE" },
    beta: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "BETA" },
    planned: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "PLANNED" }
};

export function PlaybookShowcase() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-play carousel
    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                setDirection(1);
                setCurrentIndex((prev) => (prev + 1) % playbooks.length);
            }, 5000);

            return () => clearInterval(interval);
        }
        return undefined;
    }, [isPaused]);

    const handlePrevious = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + playbooks.length) % playbooks.length);
    };

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % playbooks.length);
    };

    const currentPlaybook = playbooks[currentIndex]!;
    const config = statusConfig[currentPlaybook.status];

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    return (
        <section ref={ref} className="relative py-32 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(99,102,241,0.08),transparent_60%)]" />
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
                            PLAYBOOK_SHOWCASE
                        </span>
                    </div>

                    <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight mb-6">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                            Wizards
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                            Inteligentes
                        </span>
                    </h2>

                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Playbooks assistidos por IA que guiam operações críticas com validações automáticas e contexto inteligente.
                    </p>
                </motion.div>

                {/* Carousel */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="relative h-[500px] flex items-center justify-center">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="absolute w-full max-w-4xl"
                            >
                                <motion.div
                                    whileHover={{
                                        scale: 1.02,
                                        rotateY: 3,
                                        rotateX: 3,
                                        transition: { duration: 0.3 }
                                    }}
                                    style={{ perspective: "1000px" }}
                                >
                                    <GlassCard className="relative p-12 group overflow-hidden">
                                        <AnimatedTechCorners variant="gradient" />

                                        {/* Scanline sweep effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-linear-to-b from-transparent via-[hsl(var(--primary))]/20 to-transparent pointer-events-none"
                                            initial={{ y: "-100%", opacity: 0 }}
                                            whileHover={{ y: "100%", opacity: 1 }}
                                            transition={{ duration: 1, ease: "easeInOut" }}
                                        />

                                        <div className="relative z-10">
                                            {/* Status Badge */}
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="text-sm font-mono text-white/40 uppercase tracking-wider">
                                                    {currentPlaybook.category}
                                                </span>
                                                <span className={`text-xs font-mono px-3 py-1 border ${config.border} ${config.bg} ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-4xl font-black text-white mb-4">
                                                {currentPlaybook.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-xl text-white/70 mb-8 leading-relaxed">
                                                {currentPlaybook.description}
                                            </p>

                                            {/* Features */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {currentPlaybook.features.map((feature, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="flex items-center gap-2 text-sm text-white/60"
                                                    >
                                                        <div className="w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full" />
                                                        {feature}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:border-[hsl(var(--primary))] hover:bg-white/10 transition-all duration-300"
                        aria-label="Previous playbook"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:border-[hsl(var(--primary))] hover:bg-white/10 transition-all duration-300"
                        aria-label="Next playbook"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {playbooks.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1);
                                    setCurrentIndex(index);
                                }}
                                className={`h-2 transition-all duration-300 ${index === currentIndex
                                    ? "w-8 bg-[hsl(var(--primary))]"
                                    : "w-2 bg-white/20 hover:bg-white/40"
                                    }`}
                                aria-label={`Go to playbook ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
