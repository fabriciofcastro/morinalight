"use client";

import { cn } from "@morina/ui";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect, useRef, useState } from "react";
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

const NOTICE_TIMEOUT_MS = 12_000;

type LoginNotice = {
  message: string;
  attempts?: number;
  status?: number;
  category?: string;
  origin?: string;
  code?: string;
};

export default function LoginPage() {
  const [notice, setNotice] = useState<LoginNotice | null>(null);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeExpanded, setNoticeExpanded] = useState(false);
  const [noticePaused, _setNoticePaused] = useState(false);
  const [noticeRemainingMs, setNoticeRemainingMs] = useState(NOTICE_TIMEOUT_MS);
  const intervalRef = useRef<number | null>(null);
  const noticePausedRef = useRef(false);

  const setNoticePaused = (next: boolean) => {
    noticePausedRef.current = next;
    _setNoticePaused(next);
  };

  useEffect(() => {
    function isTypingTarget(el: Element | null) {
      if (!el) return false;
      if (el instanceof HTMLInputElement) return true;
      if (el instanceof HTMLTextAreaElement) return true;
      if (el instanceof HTMLSelectElement) return true;
      if (el instanceof HTMLElement && el.isContentEditable) return true;
      return false;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNoticeVisible(false);
        setNoticeExpanded(false);
        return;
      }

      if (!noticeVisible) return;
      if (isTypingTarget(document.activeElement)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "d" || e.key === "D") {
        setNoticeExpanded((v) => !v);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [noticeVisible]);

  useEffect(() => {
    if (!noticeVisible) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setNoticeRemainingMs(NOTICE_TIMEOUT_MS);
    noticePausedRef.current = false;
    _setNoticePaused(false);

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = window.setInterval(() => {
      setNoticeRemainingMs((ms) => {
        if (noticePausedRef.current) return ms;
        const next = ms - 50;
        if (next <= 0) {
          // fecha automaticamente
          setNoticeVisible(false);
          setNoticeExpanded(false);
          return 0;
        }
        return next;
      });
    }, 50);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [noticeVisible]);

  const progress = Math.max(0, Math.min(1, noticeRemainingMs / NOTICE_TIMEOUT_MS));

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#030712] text-white selection:bg-[hsl(var(--primary))] selection:text-white" style={{ backgroundColor: 'var(--auth-surface, #030712)' }}>
      {/* Futuristic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0),var(--auth-surface,#030712))]" />
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--auth-grid-line,rgba(255,255,255,0.02))_1px,transparent_1px),linear-gradient(to_bottom,var(--auth-grid-line,rgba(255,255,255,0.02))_1px,transparent_1px)] bg-[size:4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" 
          style={{ opacity: 'var(--auth-grid-opacity, 1)' }}
        />

        {/* Cinematic overlays (tokens controlam intensidade) */}
        <div className="absolute inset-0 auth-noise pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 auth-vignette pointer-events-none" aria-hidden="true" />

        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[20%] h-[500px] w-[500px] rounded-full blur-[120px]" style={{ backgroundColor: 'var(--auth-glow-primary, hsla(var(--primary) / 0.15))' }} />
        <div className="absolute bottom-[-20%] right-[20%] h-[500px] w-[500px] rounded-full blur-[120px]" style={{ backgroundColor: 'var(--auth-glow-secondary, hsla(var(--secondary) / 0.15))' }} />

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

      {/* ERP-style global notice (HUD) — na tela de login, fora do card */}
      <AnimatePresence>
        {noticeVisible && notice ? (
          <motion.div
            className="fixed inset-x-0 top-4 z-40 flex justify-center px-4"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div
              className={cn(
                "relative w-full max-w-[1100px] border border-red-500/40 bg-[color-mix(in_oklab,black_78%,hsl(var(--surface))_22%)] backdrop-blur-xl shadow-[0_28px_120px_-48px_rgba(239,68,68,0.35)] overflow-hidden transition-all duration-300",
                noticeExpanded ? "px-3 py-2" : "px-4 py-3",
              )}
              role="alert"
              aria-live="polite"
              onMouseEnter={() => setNoticePaused(true)}
              onMouseLeave={() => setNoticePaused(false)}
            >
              {/* HUD overlays */}
              <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3.25rem_3.25rem]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsla(var(--primary)/0.10),transparent_60%)]" />
              </div>

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono tracking-[0.22em] uppercase">
                    <span className="text-red-200/90">EVENT</span>
                    <span className="text-white/30">/</span>
                    <span className="text-white/70">AUTH_FAILURE</span>
                    <span className="text-white/30">/</span>
                    <span className="text-white/55">LOGIN</span>
                  </div>

                  {noticeExpanded ? (
                    <div className="mt-0.5 text-xs leading-snug text-red-50/90 truncate max-w-[400px]">{notice.message}</div>
                  ) : (
                    <div className="mt-1 text-sm leading-snug text-red-50/90">{notice.message}</div>
                  )}

                  {!noticeExpanded ? (
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-white/55">
                      <span className="border border-white/10 bg-white/5 px-2 py-1">
                        TENTATIVAS:{" "}
                        <span className="text-white/80">{typeof notice.attempts === "number" ? notice.attempts : 0}/5</span>
                      </span>
                      <span className="border border-white/10 bg-white/5 px-2 py-1">
                        AUTO_CLOSE: <span className="text-white/80">{Math.ceil(noticeRemainingMs / 1000)}s</span>
                      </span>
                      {noticePaused ? (
                        <span className="border border-white/10 bg-white/5 px-2 py-1 text-white/70">
                          PAUSADO
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-white/50">
                      <span>TENTATIVAS: {typeof notice.attempts === "number" ? notice.attempts : 0}/5</span>
                      <span>•</span>
                      <span>{Math.ceil(noticeRemainingMs / 1000)}s</span>
                      {noticePaused ? <span>• PAUSADO</span> : null}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNoticeExpanded((v) => !v)}
                    className="h-10 border border-white/10 bg-white/5 px-3 text-[11px] font-mono uppercase tracking-[0.2em] text-white/75 hover:bg-white/10 hover:text-white transition-colors"
                    aria-expanded={noticeExpanded}
                    aria-controls="login-notice-drawer"
                    title="Atalho: D"
                  >
                    {noticeExpanded ? "OCULTAR" : "DETALHES"}
                  </button>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/70 hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    RECUPERAR
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setNoticeVisible(false);
                      setNoticeExpanded(false);
                    }}
                    className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white transition-colors"
                    aria-label="Fechar aviso"
                    title="Fechar (Esc)"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Countdown bar (real, com pause) */}
              <div className={cn("relative w-full bg-white/5 overflow-hidden", noticeExpanded ? "mt-2 h-[2px]" : "mt-3 h-[3px]")}>
                <div
                  className="h-full origin-left bg-[linear-gradient(to_right,hsla(var(--primary)/0.0),hsla(var(--primary)/0.85),hsla(var(--accent)/0.65))] motion-reduce:hidden"
                  style={{ transform: `scaleX(${progress})` }}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Drawer HUD de detalhes (insano) — mobile: bottom sheet, desktop: drawer lateral */}
      <AnimatePresence>
        {noticeVisible && notice && noticeExpanded ? (
          <>
            {/* Mobile: overlay escuro (backdrop) */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setNoticeExpanded(false)}
              aria-hidden="true"
            />

            {/* Mobile: bottom sheet (full-width, vem de baixo) */}
            <motion.aside
              id="login-notice-drawer-mobile"
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[75vh] border-t border-[hsl(var(--primary)/0.22)] bg-[color-mix(in_oklab,black_76%,hsl(var(--surface))_24%)] backdrop-blur-xl shadow-[0_28px_120px_-48px_rgba(55,224,246,0.32)] overflow-hidden sm:hidden"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.25 }}
              dragMomentum={false}
              whileDrag={{ opacity: 0.85 }}
              onDragStart={() => {
                // Pausa o timer quando começa a arrastar
                setNoticePaused(true);
              }}
              onDragEnd={(_, info) => {
                // Fecha se arrastar para baixo mais de 120px ou com velocidade > 400
                if (info.offset.y > 120 || info.velocity.y > 400) {
                  setNoticeExpanded(false);
                }
                // Retoma o timer se não fechar
                setNoticePaused(false);
              }}
              onMouseEnter={() => setNoticePaused(true)}
              onMouseLeave={() => setNoticePaused(false)}
              role="dialog"
              aria-label="Detalhes do aviso de autenticação"
            >
              <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
                <div className="absolute inset-0 holo-grid opacity-40" />
                <div className="absolute left-0 top-0 h-full w-[2px] beam-line opacity-35" />
                <div className="absolute right-0 top-0 h-full w-px beam-line opacity-25" />
              </div>

              {/* Handle arrastável (barra no topo) — área de arraste aumentada */}
              <div className="relative flex flex-col items-center justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing touch-none select-none gap-2">
                <div className="h-1 w-16 bg-white/40" />
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">
                  ARRASTE PARA FECHAR
                </div>
                <div className="absolute inset-x-0 top-0 bottom-0" aria-hidden="true" />
              </div>

              <div className="relative p-4 overflow-y-auto max-h-[calc(75vh-3rem)]">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-[hsl(var(--primary))]">
                      DIAGNOSTICS_CONSOLE
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white/90">Auth Failure Telemetry</div>
                    <div className="mt-0.5 text-[11px] font-mono text-white/45">Esc: fechar • Hover: pausa</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoticeExpanded(false)}
                    className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white transition-colors"
                    aria-label="Fechar detalhes"
                    title="Fechar detalhes"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid gap-2">
                  {[
                    { k: "STATUS", v: typeof notice.status === "number" ? String(notice.status) : "—" },
                    { k: "CATEGORIA", v: notice.category ?? "—" },
                    { k: "ORIGEM", v: notice.origin ?? "—" },
                    { k: "CODE", v: notice.code ?? "—" },
                  ].map((row) => (
                    <div key={row.k} className="grid grid-cols-[100px_1fr] gap-3 border border-white/10 bg-black/20 px-3 py-2">
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/35">{row.k}</div>
                      <div className="min-w-0 text-[12px] font-mono text-white/80 truncate" title={row.v}>
                        {row.v}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border border-white/10 bg-black/20 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/35">MENSAGEM</div>
                  <div className="mt-1 text-sm text-white/80 leading-snug">{notice.message}</div>
                </div>

                <div className="mt-4 h-[3px] w-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full origin-left bg-[linear-gradient(to_right,hsla(var(--primary)/0.0),hsla(var(--primary)/0.85),hsla(var(--accent)/0.65))] motion-reduce:hidden"
                    style={{ transform: `scaleX(${progress})` }}
                  />
                </div>
              </div>
            </motion.aside>

            {/* Desktop: drawer lateral (vem da direita) */}
            <motion.aside
              id="login-notice-drawer"
              className="hidden sm:block fixed top-24 right-4 z-50 w-[460px] max-h-[calc(100vh-7rem)] border border-[hsl(var(--primary)/0.22)] bg-[color-mix(in_oklab,black_76%,hsl(var(--surface))_24%)] backdrop-blur-xl shadow-[0_28px_120px_-48px_rgba(55,224,246,0.32)] overflow-hidden"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onMouseEnter={() => setNoticePaused(true)}
              onMouseLeave={() => setNoticePaused(false)}
              role="dialog"
              aria-label="Detalhes do aviso de autenticação"
            >
              <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
                <div className="absolute inset-0 holo-grid opacity-40" />
                <div className="absolute left-0 top-0 h-full w-[2px] beam-line opacity-35" />
                <div className="absolute right-0 top-0 h-full w-px beam-line opacity-25" />
              </div>

              <div className="relative p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-[hsl(var(--primary))]">
                      DIAGNOSTICS_CONSOLE
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white/90">Auth Failure Telemetry</div>
                    <div className="mt-0.5 text-[11px] font-mono text-white/45">D: alternar • Esc: fechar • Hover: pausa</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoticeExpanded(false)}
                    className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white transition-colors"
                    aria-label="Fechar detalhes"
                    title="Fechar detalhes (D)"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 grid gap-2">
                  {[
                    { k: "STATUS", v: typeof notice.status === "number" ? String(notice.status) : "—" },
                    { k: "CATEGORIA", v: notice.category ?? "—" },
                    { k: "ORIGEM", v: notice.origin ?? "—" },
                    { k: "CODE", v: notice.code ?? "—" },
                  ].map((row) => (
                    <div key={row.k} className="grid grid-cols-[120px_1fr] gap-3 border border-white/10 bg-black/20 px-3 py-2">
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/35">{row.k}</div>
                      <div className="min-w-0 text-[12px] font-mono text-white/80 truncate" title={row.v}>
                        {row.v}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border border-white/10 bg-black/20 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/35">MENSAGEM</div>
                  <div className="mt-1 text-sm text-white/80 leading-snug">{notice.message}</div>
                </div>

                <div className="mt-4 h-[3px] w-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full origin-left bg-[linear-gradient(to_right,hsla(var(--primary)/0.0),hsla(var(--primary)/0.85),hsla(var(--accent)/0.65))] motion-reduce:hidden"
                    style={{ transform: `scaleX(${progress})` }}
                  />
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1100px] grid lg:grid-cols-2 gap-8 lg:gap-12 p-4 sm:p-6 items-center lg:items-start pb-16 lg:pb-10">
        {/* Left Side: Tactical Command Interface */}
        <motion.div
          variants={authEnterLeft}
          initial="hidden"
          animate="show"
          className="hidden lg:flex flex-col justify-between h-full min-h-[min(600px,78vh)] relative pb-6"
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
        <div className="lg:hidden flex flex-col items-center justify-center min-h-[18vh] mb-6 text-center relative z-20">
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
              <LoginForm
                onNotice={(payload) => {
                  setNotice(payload);
                  setNoticeVisible(true);
                }}
                onDismissNotice={() => {
                  setNoticeVisible(false);
                  setNoticeExpanded(false);
                }}
              />
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
