"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { GlowingGrid } from "@/components/login/glowing-grid";
import { LightBeams } from "@/components/login/light-beams";
import { EnergyRings } from "@/components/login/energy-rings";
import { FloatingOrbs } from "@/components/login/floating-orbs";
import { DeveloperCredits } from "@/components/login/developer-credits";
import { DigitalGridMap } from "@/components/login/digital-grid-map";
import { HexagonGrid } from "@/components/login/hexagon-grid";
import Link from "next/link";

export default function LoginPage() {
    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#030712] text-white selection:bg-[hsl(var(--primary))] selection:text-white">
            {/* Futuristic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0),rgba(3,7,18,1))]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                {/* Ambient Glows */}
                <div className="absolute top-[-20%] left-[20%] h-[500px] w-[500px] rounded-full bg-[hsl(var(--primary)/0.15)] blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[20%] h-[500px] w-[500px] rounded-full bg-[hsl(var(--secondary)/0.15)] blur-[120px]" />

                <DigitalGridMap />
                <HexagonGrid />
                <LightBeams />
                <EnergyRings />
                <GlowingGrid />
                <div className="opacity-30">
                    <FloatingOrbs />
                </div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-[1000px] grid lg:grid-cols-2 gap-12 p-6 items-center min-h-screen lg:min-h-0">

                {/* Left Side: Tactical Command Interface */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:flex flex-col justify-between h-full min-h-[600px] relative"
                >
                    {/* Top: Brand Identity */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-2 w-2 bg-[hsl(var(--primary))]" />
                            <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em]">SECURE_ACCESS_TERMINAL</span>
                        </div>

                        <div className="relative inline-block">
                            <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 font-display relative z-10 pb-4" style={{
                                textShadow: '1px 1px 0 #ccc, 2px 2px 0 #bbb, 3px 3px 0 #aaa, 4px 4px 0 #999, 5px 5px 0 #888, 6px 6px 0 #777, 7px 7px 0 #666, 8px 8px 7px rgba(0,0,0,0.4), 8px 8px 10px rgba(0,0,0,0.2)'
                            }}>
                                MORINA
                            </h1>
                        </div>

                        <div className="flex items-center gap-4 mt-2 border-l-2 border-[hsl(var(--primary))] pl-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white tracking-[0.2em] uppercase">System v2.0</span>
                                <span className="text-[10px] text-white/40 font-mono">BUILD.2025.11.27</span>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Abstract Control System Visualization */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                        <div className="relative w-[400px] h-[400px]">
                            {/* Rotating Rings */}
                            <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
                            <div className="absolute inset-10 border border-dashed border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                            <div className="absolute inset-20 border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />

                            {/* Central Core */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 border-2 border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.05)] backdrop-blur-sm flex items-center justify-center relative">
                                    <div className="absolute inset-0 border-t border-l border-[hsl(var(--primary))] w-4 h-4 -top-1 -left-1" />
                                    <div className="absolute inset-0 border-b border-r border-[hsl(var(--primary))] w-4 h-4 -bottom-1 -right-1" />
                                    <div className="grid grid-cols-3 gap-1">
                                        {[...Array(9)].map((_, i) => (
                                            <div key={i} className="w-2 h-2 bg-[hsl(var(--primary))] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Data Streams */}
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.2)] to-transparent" />
                            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[hsl(var(--primary)/0.2)] to-transparent" />
                        </div>
                    </div>

                    {/* Bottom: Floating System Architects Module */}
                    <div className="relative z-10 mt-auto">
                        <DeveloperCredits />
                    </div>
                </motion.div>

                {/* Mobile Header - Visible only on small screens */}
                <div className="lg:hidden flex flex-col items-center justify-center min-h-[20vh] mb-8 text-center relative z-20">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-1.5 bg-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em]">SECURE_ACCESS</span>
                    </div>
                    <div className="relative inline-block">
                        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 font-display relative z-10 pb-2" style={{
                            textShadow: '1px 1px 0 #ccc, 2px 2px 0 #bbb, 3px 3px 0 #aaa, 4px 4px 0 #999, 5px 5px 0 #888, 6px 6px 5px rgba(0,0,0,0.4), 6px 6px 8px rgba(0,0,0,0.2)'
                        }}>
                            MORINA
                        </h1>
                    </div>
                </div>

                {/* Right Side: Glass Login Module */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="relative w-full"
                >
                    {/* Glass Card with Squared Cyber-Glass Aesthetics */}
                    <div className="relative overflow-hidden border border-white/10 bg-black/20 p-6 lg:p-10 backdrop-blur-md shadow-2xl group">
                        {/* Periodic Reflection Animation - Infinite Loop */}
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] animate-shine-interval" />
                        </div>

                        {/* Tech Corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[hsl(var(--primary)/0.5)]" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[hsl(var(--primary)/0.5)]" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[hsl(var(--primary)/0.5)]" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[hsl(var(--primary)/0.5)]" />

                        <div className="relative z-10">
                            <div className="mb-8 border-b border-white/10 pb-4">
                                <h2 className="text-2xl font-bold text-white tracking-[0.1em] uppercase font-mono">
                                    <span className="text-[hsl(var(--primary))] mr-2">/</span>
                                    Acesso Restrito
                                </h2>
                                <p className="text-xs text-white/40 mt-2 font-mono uppercase tracking-widest">
                                    Autenticação Necessária
                                </p>
                            </div>

                            <Suspense fallback={
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <div className="relative h-16 w-16 border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] flex items-center justify-center">
                                        <div className="absolute inset-0 border-t-2 border-[hsl(var(--primary))] animate-spin" />
                                        <div className="h-8 w-8 bg-[hsl(var(--primary))] animate-pulse" />
                                    </div>
                                    <div className="font-mono text-xs text-[hsl(var(--primary))] tracking-[0.2em] animate-pulse">
                                        INICIALIZANDO UPLINK...
                                    </div>
                                </div>
                            }>
                                <LoginForm />
                            </Suspense>

                            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/20 uppercase tracking-widest">
                                <span>SECURE CONNECTION</span>
                                <span className="flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    ONLINE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Credits - Visible only on small screens below form */}
                    <div className="lg:hidden mt-8 flex justify-center">
                        <DeveloperCredits />
                    </div>
                </motion.div>

            </div>

            {/* Footer with Legal Links Only */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex gap-6 text-[10px] font-semibold text-white/30">
                    <Link href="/lgpd" className="hover:text-white transition-colors">LGPD</Link>
                    <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
                    <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
                    <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                    <Link href="/lei-representante" className="hover:text-white transition-colors">Lei 4.886/65</Link>
                    <Link href="/vinculo-empregaticio" className="hover:text-white transition-colors">Não Vínculo</Link>
                </div>
            </div>
        </main>
    );
}
