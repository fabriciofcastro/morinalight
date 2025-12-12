"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense } from "react";
import { AuthGlassCard } from "@/components/auth/AuthGlassCard";
import { authEnterLeft, authEnterScale } from "@/components/auth/auth-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { DeveloperCredits } from "@/components/login/developer-credits";
import { DigitalGridMap } from "@/components/login/digital-grid-map";
import { EnergyRings } from "@/components/login/energy-rings";
import { FloatingOrbs } from "@/components/login/floating-orbs";
import { GlowingGrid } from "@/components/login/glowing-grid";
import { HexagonGrid } from "@/components/login/hexagon-grid";
import { LightBeams } from "@/components/login/light-beams";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-(--auth-surface,#030712) text-white selection:bg-[hsl(var(--primary))] selection:text-white">
      {/* Futuristic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0),color:var(--auth-surface,#030712))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color:var(--auth-grid-line,rgba(255,255,255,0.02))_1px,transparent_1px),linear-gradient(to_bottom,color:var(--auth-grid-line,rgba(255,255,255,0.02))_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-(--auth-grid-opacity,1)" />

        {/* Cinematic overlays (tokens controlam intensidade) */}
        <div className="absolute inset-0 auth-noise pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 auth-vignette pointer-events-none" aria-hidden="true" />

        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[20%] h-[500px] w-[500px] rounded-full bg-(--auth-glow-primary,hsla(var(--primary)/0.15)) blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[20%] h-[500px] w-[500px] rounded-full bg-(--auth-glow-secondary,hsla(var(--secondary)/0.15)) blur-[120px]" />

        <div className="motion-reduce:hidden">
          <DigitalGridMap />
          <HexagonGrid />
          <LightBeams />
          <EnergyRings />
          <GlowingGrid />
        </div>
        <div className="opacity-30">
          <FloatingOrbs />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1100px] grid lg:grid-cols-2 gap-8 lg:gap-12 p-4 sm:p-6 items-center lg:items-start min-h-svh lg:min-h-0 pb-24 lg:pb-12">
        {/* Left Side: Tactical Command Interface */}
        <motion.div
          variants={authEnterLeft}
          initial="hidden"
          animate="show"
          className="hidden lg:flex flex-col justify-between h-full min-h-[min(600px,78svh)] relative pb-6"
        >
          {/* Top: Brand Identity */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 bg-[hsl(var(--primary))]" />
              <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em]">
                SECURE_ACCESS_TERMINAL
              </span>
            </div>

            <div className="relative inline-block">
              <h1
                className="text-[clamp(3.25rem,5.2vw,4.5rem)] font-black tracking-[-0.06em] text-transparent bg-clip-text bg-linear-to-b from-white via-gray-100 to-gray-400 font-display relative z-10 pb-4 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-[60%] after:bg-linear-to-r after:from-transparent after:via-[hsl(var(--primary)/0.8)] after:to-transparent after:opacity-60"
                style={{
                  textShadow:
                    "0 0 40px rgba(14,165,233,0.16), 0 0 90px rgba(99,102,241,0.10), 8px 8px 10px rgba(0,0,0,0.35)",
                }}
              >
                MORINA
              </h1>
            </div>

            <div className="flex items-center gap-4 mt-2 border-l-2 border-[hsl(var(--primary))] pl-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white tracking-[0.2em] uppercase">
                  System v2.0
                </span>
                <span className="text-[10px] text-white/40 font-mono">BUILD.2025.11.27</span>
              </div>
            </div>
          </div>

          {/* Middle: Abstract Control System Visualization */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="relative w-[min(400px,46svh)] h-[min(400px,46svh)]">
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
                    {["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"].map((pulseId, idx) => (
                      <div
                        key={pulseId}
                        className="w-2 h-2 bg-[hsl(var(--primary))] animate-pulse"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Streams */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-[hsl(var(--primary)/0.2)] to-transparent" />
              <div className="absolute left-1/2 top-0 w-px h-full bg-linear-to-b from-transparent via-[hsl(var(--primary)/0.2)] to-transparent" />
            </div>
          </div>

          {/* Bottom: Floating System Architects Module */}
          <div className="relative z-10 mt-auto pt-6">
            <DeveloperCredits />
          </div>
        </motion.div>

        {/* Mobile Header - Visible only on small screens */}
        <div className="lg:hidden flex flex-col items-center justify-center min-h-[18svh] mb-6 text-center relative z-20">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1.5 w-1.5 bg-[hsl(var(--primary))]" />
            <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-[0.3em]">
              SECURE_ACCESS
            </span>
          </div>
          <div className="relative inline-block">
            <h1
              className="text-[clamp(3rem,11vw,4rem)] font-black tracking-[-0.06em] text-transparent bg-clip-text bg-linear-to-b from-white via-gray-100 to-gray-400 font-display relative z-10 pb-2 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-0.5 after:h-px after:w-[70%] after:bg-linear-to-r after:from-transparent after:via-[hsl(var(--primary)/0.75)] after:to-transparent after:opacity-60"
              style={{
                textShadow:
                  "0 0 32px rgba(14,165,233,0.14), 0 0 70px rgba(99,102,241,0.10), 6px 6px 8px rgba(0,0,0,0.30)",
              }}
            >
              MORINA
            </h1>
          </div>
        </div>

        {/* Right Side: Glass Login Module */}
        <motion.div
          variants={authEnterScale}
          initial="hidden"
          animate="show"
          className="relative w-full"
        >
          <AuthGlassCard title="Acesso Restrito" subtitle="Autenticação Necessária">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative h-16 w-16 border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] flex items-center justify-center">
                    <div className="absolute inset-0 border-t-2 border-[hsl(var(--primary))] animate-spin" />
                    <div className="h-8 w-8 bg-[hsl(var(--primary))] animate-pulse" />
                  </div>
                  <div className="font-mono text-xs text-[hsl(var(--primary))] tracking-[0.2em] animate-pulse">
                    INICIALIZANDO UPLINK...
                  </div>
                </div>
              }
            >
              <LoginForm />
            </Suspense>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/20 uppercase tracking-widest">
              <span>SECURE CONNECTION</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
          </AuthGlassCard>

          {/* Mobile Credits - Visible only on small screens below form */}
          <div className="lg:hidden mt-8 flex justify-center">
            <DeveloperCredits />
          </div>
        </motion.div>
      </div>

      {/* Footer with Legal Links Only */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-6 py-6 flex justify-center bg-linear-to-t from-black/80 to-transparent">
        <div className="flex gap-6 text-[10px] font-semibold text-white/30">
          <Link href="/lgpd" className="hover:text-white transition-colors">
            LGPD
          </Link>
          <Link href="/termos" className="hover:text-white transition-colors">
            Termos
          </Link>
          <Link href="/privacidade" className="hover:text-white transition-colors">
            Privacidade
          </Link>
          <Link href="/cookies" className="hover:text-white transition-colors">
            Cookies
          </Link>
          <Link href="/lei-representante" className="hover:text-white transition-colors">
            Lei 4.886/65
          </Link>
          <Link href="/vinculo-empregaticio" className="hover:text-white transition-colors">
            Não Vínculo
          </Link>
        </div>
      </div>
    </main>
  );
}
