"use client";

import Link from "next/link";
import { Button } from "@morina/ui";
import { ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#030712] text-white selection:bg-[hsl(var(--primary))] selection:text-white relative overflow-hidden">
            {/* Ambient Glows */}
            <div className="absolute top-[-20%] left-[10%] h-[500px] w-[500px] rounded-full bg-[hsl(var(--primary)/0.1)] blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[10%] h-[500px] w-[500px] rounded-full bg-[hsl(var(--secondary)/0.1)] blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="gap-2 text-white/70 hover:text-white hover:bg-white/5 font-sans">
                                <ArrowLeft className="h-4 w-4" />
                                Voltar
                            </Button>
                        </Link>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-sans font-bold tracking-wide text-white">
                                MORINA <span className="text-[hsl(var(--primary))]">LEGAL</span>
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-5xl px-4 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_50px_-10px_hsl(var(--primary)/0.2)]"
                >
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-[hsl(var(--secondary)/0.05)] pointer-events-none" />

                    {/* Top Bar Decoration */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent opacity-80 shadow-[0_0_10px_hsl(var(--primary))]" />

                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-12">
                        <div className="prose prose-invert prose-lg max-w-none font-sans [&_h1]:font-sans [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-white [&_h2]:font-sans [&_h2]:font-semibold [&_h2]:text-[hsl(var(--primary))] [&_h2]:mt-8 [&_p]:text-white/80 [&_p]:leading-relaxed [&_ul]:text-white/70 [&_li]:my-1">
                            {children}
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#030712]/80 backdrop-blur-xl py-8 mt-12 relative z-10">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-white/40 font-sans">
                        &copy; {new Date().getFullYear()} Morina Sistema Corporativo. Todos os direitos reservados.
                    </p>
                    <p className="text-xs text-white/30 mt-2 font-sans">
                        Desenvolvido por Michel, Adriana e Fabrício
                    </p>
                </div>
            </footer>
        </div>
    );
}
