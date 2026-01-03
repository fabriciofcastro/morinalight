"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Mail, Building, Send, CheckCircle2, Sparkles } from "lucide-react";
import { GlassCard } from "@morina/ui";
import { AnimatedTechCorners } from "@/components/ui/animated-tech-corners";
import { EnergyRings } from "@/components/login/energy-rings";
import { FuturisticInput } from "@/components/ui/futuristic-input";

export function PlaybookCTA() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [email, setEmail] = useState("");
    const [organization, setOrganization] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setIsSuccess(true);

        // Reset after 3 seconds
        setTimeout(() => {
            setIsSuccess(false);
            setEmail("");
            setOrganization("");
        }, 3000);
    };

    return (
        <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 px-6">
            {/* Energy Rings Background */}
            <div className="absolute inset-0">
                <EnergyRings />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#020617_100%)]" />

            <motion.div
                className="relative z-10 max-w-2xl mx-auto w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6 }}
            >
                <GlassCard className="p-12">
                    <AnimatedTechCorners variant="accent" />

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
                            <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em] uppercase">
                                GET_STARTED
                            </span>
                        </div>

                        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white to-white/60 mb-4">
                            Pronto para Começar?
                        </h2>

                        <p className="text-lg text-white/60">
                            Entre em contato e descubra como podemos acelerar seu desenvolvimento.
                        </p>
                    </div>

                    {/* Form */}
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <FuturisticInput
                                    label="Email Corporativo"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="seu@empresa.com"
                                    startIcon={<Mail className="w-5 h-5" />}
                                />

                                <FuturisticInput
                                    label="Organização"
                                    type="text"
                                    value={organization}
                                    onChange={(e) => setOrganization(e.target.value)}
                                    required
                                    placeholder="Nome da sua empresa"
                                    startIcon={<Building className="w-5 h-5" />}
                                />

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-[hsl(var(--primary))] text-white font-bold border-2 border-[hsl(var(--primary))] relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {isSubmitting ? (
                                            <>
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                ENVIANDO...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                INICIAR ACESSO
                                            </>
                                        )}
                                    </span>

                                    {/* Glow pulse */}
                                    <motion.div
                                        className="absolute inset-0 bg-[hsl(var(--primary))]/20"
                                        animate={{
                                            opacity: [0.2, 0.4, 0.2],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                >
                                    <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
                                </motion.div>

                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Mensagem Enviada!
                                </h3>

                                <p className="text-white/60">
                                    Entraremos em contato em breve.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </GlassCard>
            </motion.div>
        </section>
    );
}
