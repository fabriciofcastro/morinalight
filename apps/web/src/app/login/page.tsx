"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectionStatusIndicator } from "@/components/connection-status-indicator";
import { AnimatedParticles } from "@/components/login/animated-particles";
import { AnimatedWaves } from "@/components/login/animated-waves";
import { EnergyRings } from "@/components/login/energy-rings";
import { FloatingOrbs } from "@/components/login/floating-orbs";
import { GlowingGrid } from "@/components/login/glowing-grid";
import { LightBeams } from "@/components/login/light-beams";
import { MorphingBlobs } from "@/components/login/morphing-blobs";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Garantir que o tema dark está ativo para a experiência visual
    const html = document.documentElement;
    if (!html.getAttribute("data-theme")) {
      html.setAttribute("data-theme", "dark");
    }
    if (!html.getAttribute("data-profile")) {
      html.setAttribute("data-profile", "web");
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-0">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-0"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",
      }}
    >
      {/* Background animado com gradientes radiais */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",
        }}
      />
      <div className="absolute inset-0 bg-animated" aria-hidden="true" />

      {/* Componentes de animação de background */}
      {mounted && (
        <>
          <FloatingOrbs />
          <AnimatedWaves />
          <AnimatedParticles />
          <LightBeams />
          <GlowingGrid />
          <MorphingBlobs />
          <EnergyRings />
        </>
      )}

      {/* Overlay de profundidade com animação */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)_/_0.12)_0%,transparent_50%)]"
        aria-hidden="true"
        animate={{
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,hsl(var(--secondary)_/_0.08)_0%,transparent_50%)]"
        aria-hidden="true"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--accent)_/_0.06)_0%,transparent_60%)]"
        aria-hidden="true"
        animate={{
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Grid pattern sutil animado */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"
        aria-hidden="true"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Container principal */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Lado esquerdo: Hero e Narrativa */}
          <motion.div
            className="flex flex-col justify-center gap-8 lg:gap-10"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Header com logo */}
            <header className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link
                  href="/"
                  className="group inline-flex max-w-max cursor-pointer items-center gap-3 text-sm font-medium uppercase tracking-wide text-[hsl(var(--text-3))] transition-colors hover:text-[hsl(var(--primary))]"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-[hsl(var(--primary))] opacity-20 blur-md"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <div className="relative h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                    </div>
                    <span className="font-semibold">Morina Light</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div
                className="flex flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.1] tracking-tight text-[hsl(var(--text-1))]">
                  Bem-vindo à
                  <br />
                  <motion.span
                    className="bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0%", "100%", "0%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundSize: "200% 200%",
                    }}
                  >
                    central Morina
                  </motion.span>
                </h1>
                <p className="text-lg leading-relaxed text-[hsl(var(--text-2))] md:text-xl">
                  Acesse sua conta para continuar gerenciando operações com auditoria em tempo real
                  e inteligência assistida por IA.
                </p>
              </motion.div>
            </header>

            {/* Features destacadas */}
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                className="group flex items-start gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface)_/_0.4)] p-4 backdrop-blur-sm transition-all hover:border-[hsl(var(--primary)_/_0.3)] hover:bg-[hsl(var(--surface)_/_0.6)]"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex-shrink-0">
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary)_/_0.15)]"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-[hsl(var(--text-1))]">
                    Segurança reforçada
                  </h3>
                  <p className="text-sm leading-relaxed text-[hsl(var(--text-2))]">
                    Todas as sessões são protegidas por criptografia de ponta a ponta e
                    monitoramento contínuo.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="group flex items-start gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface)_/_0.4)] p-4 backdrop-blur-sm transition-all hover:border-[hsl(var(--accent)_/_0.3)] hover:bg-[hsl(var(--surface)_/_0.6)]"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <div className="flex-shrink-0">
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent)_/_0.15)]"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Zap className="h-5 w-5 text-[hsl(var(--accent))]" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-[hsl(var(--text-1))]">
                    Auditoria em tempo real
                  </h3>
                  <p className="text-sm leading-relaxed text-[hsl(var(--text-2))]">
                    Cada ação é registrada e rastreada automaticamente para garantir transparência e
                    compliance.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="group flex items-start gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface)_/_0.4)] p-4 backdrop-blur-sm transition-all hover:border-[hsl(var(--secondary)_/_0.3)] hover:bg-[hsl(var(--surface)_/_0.6)]"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="flex-shrink-0">
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--secondary)_/_0.15)]"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Sparkles className="h-5 w-5 text-[hsl(var(--secondary))]" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-[hsl(var(--text-1))]">IA assistida</h3>
                  <p className="text-sm leading-relaxed text-[hsl(var(--text-2))]">
                    Inteligência artificial integrada para otimizar processos e acelerar decisões
                    estratégicas.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Lado direito: Formulário de Login */}
          <motion.div
            className="flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-md">
              {/* Efeito de glow atrás do card animado */}
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)_/_0.2),hsl(var(--secondary)_/_0.15))] blur-xl"
                aria-hidden="true"
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Card principal com glassmorphism */}
              <motion.div
                className="relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface)_/_0.7)] p-8 shadow-lg backdrop-blur-xl md:p-10"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                {/* Decoração interna animada */}
                <motion.div
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)_/_0.2)_0%,transparent_70%)] blur-2xl"
                  aria-hidden="true"
                  animate={{
                    x: [0, 10, -5, 0],
                    y: [0, -10, 5, 0],
                    scale: [1, 1.2, 0.9, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)_/_0.15)_0%,transparent_70%)] blur-xl"
                  aria-hidden="true"
                  animate={{
                    x: [0, -8, 4, 0],
                    y: [0, 8, -4, 0],
                    scale: [1, 1.3, 0.8, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />

                <div className="relative z-10">
                  {/* Header do formulário */}
                  <motion.div
                    className="mb-8 flex flex-col gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] shadow-lg"
                        animate={{
                          boxShadow: [
                            "0 10px 30px -10px hsl(var(--primary) / 0.3)",
                            "0 15px 40px -10px hsl(var(--primary) / 0.5)",
                            "0 10px 30px -10px hsl(var(--primary) / 0.3)",
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Lock className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-[hsl(var(--text-1))]">
                          Acesse sua conta
                        </h2>
                        <p className="text-sm text-[hsl(var(--text-3))]">
                          Entre com suas credenciais
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Formulário */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <LoginForm />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Status de conexão - posicionado no canto superior direito */}
      {mounted && <ConnectionStatusIndicator position="absolute" className="right-6 top-6" />}
    </main>
  );
}
