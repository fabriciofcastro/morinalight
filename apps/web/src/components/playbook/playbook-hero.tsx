"use client";

import { GridAnimatedBackground } from "@/components/ui/animated-backgrounds";
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Componentes internos auxiliares que estavam faltando
function FloatingOrbs() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[150px] animate-pulse delay-700" />
        </div>
    );
}

function LightBeams() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-screen bg-linear-to-b from-primary via-transparent to-transparent glow-sm" />
            <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[1px] h-screen bg-linear-to-b from-accent via-transparent to-transparent glow-sm delay-500" />
        </div>
    );
}

export function PlaybookHero() {
    const shouldReduceMotion = useReducedMotion();
    const [isLoaded, setIsLoaded] = useState(false);
    const scrollRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: scrollRef,
        offset: ["start start", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

    // Typewriter effect logic
    const baseText = "Acelere módulos críticos com RBAC granular, auditoria total e experiências assistidas por IA. Configuramos fluxos, eventos e interfaces para você subir em 48h.";
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayText = useTransform(rounded, (latest) => baseText.slice(0, latest));

    useEffect(() => {
        setIsLoaded(true);
        if (shouldReduceMotion) {
            count.set(baseText.length);
            return undefined;
        } else {
            const controls = animate(count, baseText.length, {
                type: "tween",
                duration: 2,
                ease: "easeInOut",
            });
            return controls.stop;
        }
    }, [shouldReduceMotion, count, baseText.length]);

    const renderText = (text: string) => {
        return text
            .replace(/RBAC granular/g, '<span class="text-[hsl(var(--primary))] font-semibold">RBAC granular</span>')
            .replace(/IA/g, '<span class="text-[hsl(var(--accent))] font-semibold">IA</span>')
            .replace(/48h/g, '<span class="text-[hsl(var(--secondary))] font-semibold">48h</span>');
    };

    return (
        <section ref={scrollRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <GridAnimatedBackground variant="default" className="opacity-60" />

            {/* Cinematic Overlays */}
            <div className="absolute inset-0 pointer-events-none opacity-20" aria-hidden="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#020617_100%)]" />
            </div>

            {/* Floating Elements */}
            <div className="opacity-30">
                <FloatingOrbs />
            </div>
            {!shouldReduceMotion && (
                <div className="opacity-20">
                    <LightBeams />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 mb-8"
                >
                    <div className="h-2 w-2 bg-[hsl(var(--primary))] animate-pulse" />
                    <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em] uppercase">
                        SISTEMA_DYNAMO_PLAYBOOK
                    </span>
                    <div className="h-2 w-2 bg-[hsl(var(--primary))] animate-pulse" />
                </motion.div>

                {/* Main Title */}
                <motion.h1
                    style={{ opacity, scale }}
                    className="text-[clamp(3rem,8vw,6rem)] font-black tracking-tighter mb-8 leading-[0.9]"
                >
                    <span className="inline-block text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                        FUTURO
                    </span>
                    <br />
                    <span className="inline-block text-transparent bg-clip-text bg-linear-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--primary))] bg-[size:200%_auto] animate-shimmer">
                        OPERACIONAL
                    </span>
                </motion.h1>

                {/* Animated Subtitle */}
                <motion.div
                    className="text-[clamp(1rem,2vw,1.25rem)] text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed min-h-[3.5em]"
                    initial={{ opacity: 0 }}
                    animate={isLoaded ? { opacity: 1 } : {}}
                >
                    <motion.span
                        dangerouslySetInnerHTML={{
                            __html: renderText(baseText.slice(0, rounded.get()))
                        }}
                    />
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link href="#showcase" className="group relative">
                        <div className="absolute -inset-1 bg-[hsl(var(--primary))] rounded-none blur-sm opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                        <button className="relative px-8 py-4 bg-[hsl(var(--primary))] text-white font-bold tracking-widest flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
                            <Play className="w-5 h-5 fill-current" />
                            EXPLORAR PLAYBOOKS
                        </button>
                    </Link>

                    <Link href="/docs" className="group">
                        <button className="px-8 py-4 border border-white/20 bg-white/5 backdrop-blur-sm text-white font-bold tracking-widest flex items-center gap-3 hover:bg-white/10 hover:border-white/40 transition-all">
                            <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
                            DOCUMENTAÇÃO
                        </button>
                    </Link>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-2 text-white/40"
                >
                    <span className="text-[10px] font-mono tracking-widest uppercase">Scroll</span>
                    <ChevronDown className="w-4 h-4" />
                </motion.div>
            </motion.div>
        </section>
    );
}
