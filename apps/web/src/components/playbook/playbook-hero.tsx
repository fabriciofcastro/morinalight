"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowDown, Play, BookOpen } from "lucide-react";
import { GridAnimatedBackground } from "@/components/ui/animated-backgrounds";
import { FloatingOrbs } from "@/components/login/floating-orbs";
import { LightBeams } from "@/components/login/light-beams";

export function PlaybookHero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <GridAnimatedBackground variant="default" className="opacity-60" />

            {/* Cinematic Overlays */}
            <div className="absolute inset-0 cinematic-noise pointer-events-none" aria-hidden="true" />
            <div className="absolute inset-0 cinematic-vignette pointer-events-none" aria-hidden="true" />
            <div className="absolute inset-0 cinematic-scanlines pointer-events-none" aria-hidden="true" />
            <div className="absolute inset-0 cinematic-glow pointer-events-none" aria-hidden="true" />

            {/* Floating Elements */}
            <div className="opacity-30">
                <FloatingOrbs />
            </div>
            <div className="motion-reduce:hidden">
                <LightBeams />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 mb-8"
                >
                    <div className="h-2 w-2 bg-[hsl(var(--primary))] animate-pulse" />
                    <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em] uppercase">
                        OPERATIONAL_PLAYBOOK_SYSTEM
                    </span>
                    <div className="h-2 w-2 bg-[hsl(var(--primary))] animate-pulse" />
                </motion.div>

                {/* Main Title */}
                <motion.h1
                    className="text-[clamp(3.5rem,8vw,7rem)] font-black tracking-[-0.06em] leading-[0.9] mb-6"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <span className="text-transparent bg-clip-text bg-linear-to-b from-white via-gray-100 to-gray-400">
                        FUTURO
                    </span>
                    <br />
                    <span
                        className="text-transparent bg-clip-text bg-linear-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--secondary))] text-glow"
                        style={{
                            textShadow: "0 0 40px rgba(14,165,233,0.3), 0 0 90px rgba(99,102,241,0.2)"
                        }}
                    >
                        OPERACIONAL
                    </span>
                </motion.h1>

                {/* Subtitle with Typewriter Effect */}
                <motion.p
                    className="text-[clamp(1rem,2vw,1.5rem)] text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    Acelere módulos críticos com <span className="text-[hsl(var(--primary))] font-semibold">RBAC granular</span>,
                    auditoria total e experiências assistidas por <span className="text-[hsl(var(--accent))] font-semibold">IA</span>.
                    <br />
                    Configuramos fluxos, eventos e interfaces para você subir em <span className="text-[hsl(var(--secondary))] font-semibold">48h</span>.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-6 mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                >
                    <Link
                        href="#features"
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[hsl(var(--primary))] text-white font-bold border border-[hsl(var(--primary))] overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Play className="w-5 h-5" />
                            EXPLORAR PLAYBOOKS
                        </span>
                        {/* Scanline effect */}
                        <motion.div
                            className="absolute inset-0 bg-linear-to-b from-transparent via-white/20 to-transparent"
                            initial={{ y: "-100%" }}
                            whileHover={{ y: "100%" }}
                            transition={{ duration: 0.6 }}
                        />
                    </Link>

                    <Link
                        href="#documentation"
                        className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white font-bold bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-[hsl(var(--primary))] hover:bg-white/10 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                    >
                        <BookOpen className="w-5 h-5" />
                        DOCUMENTAÇÃO
                    </Link>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    className="inline-flex flex-col items-center gap-2 text-white/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                >
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase">
                        SCROLL_TO_EXPLORE
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ArrowDown className="w-5 h-5" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
        </section>
    );
}
