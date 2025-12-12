"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type InsaneNotFoundProps = {
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function InsaneNotFound({
  title = "Rota não encontrada",
  subtitle = "O sistema recebeu uma coordenada inválida. Nenhum módulo corresponde a este endereço.",
  primaryHref = "/dashboard",
  primaryLabel = "Voltar ao Dashboard",
  secondaryHref = "/login",
  secondaryLabel = "Ir para Login",
}: InsaneNotFoundProps) {
  const router = useRouter();
  const [lastPath, setLastPath] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    try {
      setLastPath(window.sessionStorage.getItem("morina:lastPath"));
    } catch {
      // ignore
    }
    try {
      setIsAuthed(!!window.localStorage.getItem("user_data"));
    } catch {
      // ignore
    }
  }, []);

  const now = useMemo(() => {
    const d = new Date();
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }, []);

  return (
    <main className="relative min-h-svh w-full overflow-hidden bg-(--auth-surface,#030712) text-white">
      {/* Base tech grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0),color:var(--auth-surface,#030712))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color:var(--auth-grid-line,rgba(255,255,255,0.02))_1px,transparent_1px),linear-gradient(to_bottom,color:var(--auth-grid-line,rgba(255,255,255,0.02))_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_62%_55%_at_50%_0%,#000_72%,transparent_100%)] opacity-(--auth-grid-opacity,1)" />

        {/* Cinematic overlays (tokens) */}
        <div className="absolute inset-0 auth-noise pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 auth-vignette pointer-events-none" aria-hidden="true" />

        {/* Ambient glows */}
        <div className="absolute -top-[30%] left-[12%] h-[520px] w-[520px] rounded-full bg-(--auth-glow-primary,hsla(var(--primary)/0.16)) blur-[140px]" />
        <div className="absolute -bottom-[30%] right-[10%] h-[520px] w-[520px] rounded-full bg-(--auth-glow-secondary,hsla(var(--secondary)/0.14)) blur-[140px]" />

        {/* Subtle sweep */}
        <div className="jarvis-hud-sweep absolute left-0 right-0 top-0 h-[2px] opacity-60 motion-reduce:hidden" />
      </div>

      {/* HUD line */}
      <div className="absolute left-6 right-6 top-6 z-10 flex items-center justify-between text-[10px] font-mono tracking-[0.22em] text-white/40">
        <div className="flex items-center gap-3">
          <span className="text-[hsl(var(--primary)/0.9)]">MORINA</span>
          <span className="h-3 w-px bg-white/15" />
          <span>ROUTE_RESOLUTION_ENGINE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80 shadow-[0_0_18px_rgba(252,211,77,0.25)]" />
          <span>WARN</span>
          <span className="h-3 w-px bg-white/15" />
          <span>{now}</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-5xl items-center px-6 py-16">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative overflow-hidden border border-white/10 bg-white/3 p-8 backdrop-blur-xl"
          >
            {/* tech corners */}
            <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[hsl(var(--primary)/0.55)]" />
            <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[hsl(var(--primary)/0.55)]" />
            <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[hsl(var(--primary)/0.45)]" />
            <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[hsl(var(--primary)/0.45)]" />

            {/* scanline */}
            <div
              className="pointer-events-none absolute inset-0 opacity-50 motion-reduce:hidden"
              aria-hidden="true"
            >
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-linear-to-r from-transparent via-[hsl(var(--primary)/0.45)] to-transparent animate-auth-scanline" />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-[hsl(var(--primary))]" />
                <span className="text-[10px] font-mono tracking-[0.32em] text-[hsl(var(--primary))]">
                  NAVIGATION_EXCEPTION
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-end">
                <div className="relative">
                  <div
                    className="jarvis-404 text-[clamp(3.2rem,9vw,6.2rem)] font-black tracking-[-0.08em] text-transparent bg-clip-text bg-linear-to-b from-white via-gray-100 to-gray-400 font-display leading-none"
                    style={{
                      textShadow:
                        "0 0 50px rgba(14,165,233,0.18), 0 0 120px rgba(99,102,241,0.12), 10px 10px 14px rgba(0,0,0,0.35)",
                    }}
                  >
                    404
                  </div>
                  <div className="pointer-events-none absolute left-0 top-1/2 h-px w-[70%] bg-linear-to-r from-transparent via-[hsl(var(--primary)/0.6)] to-transparent opacity-60" />
                </div>

                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
                  <p className="max-w-[70ch] text-sm leading-relaxed text-white/55">{subtitle}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href={isAuthed ? (lastPath ?? primaryHref) : secondaryHref}
                  className="group relative overflow-hidden border border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.12)] px-5 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[hsl(var(--primary)/0.16)]"
                >
                  <span className="relative z-10">
                    {isAuthed
                      ? lastPath
                        ? "Voltar para última tela"
                        : primaryLabel
                      : secondaryLabel}
                  </span>
                  <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 motion-reduce:hidden" />
                </Link>

                {isAuthed ? (
                  <Link
                    href="/dashboard?cmdk=1"
                    className="group relative overflow-hidden border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold tracking-wide text-white/90 transition hover:bg-white/8 hover:text-white"
                  >
                    <span className="relative z-10">Buscar no menu</span>
                    <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 motion-reduce:hidden" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="group relative overflow-hidden border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold tracking-wide text-white/90 transition hover:bg-white/8 hover:text-white"
                  >
                    <span className="relative z-10">Voltar</span>
                    <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 motion-reduce:hidden" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-[10px] font-mono tracking-[0.2em] text-white/30">
                <span>STATUS: ROUTE_NOT_FOUND</span>
                <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">
                  IR PARA HOME
                </Link>
              </div>
            </div>
          </motion.div>

          {/* bottom telemetry */}
          <div className="mt-8 overflow-hidden">
            <div className="jarvis-telemetry flex min-w-max items-center gap-6 text-[10px] font-mono tracking-[0.18em] text-white/25 motion-reduce:hidden">
              <span className="text-[hsl(var(--primary)/0.75)]">SCAN: PATH_MAP_INVALID</span>
              <span>RBAC: ENFORCED</span>
              <span>TENANT: REQUIRED</span>
              <span>RECOVERY: SUGGESTED</span>
              <span className="text-[hsl(var(--accent)/0.75)]">ASSIST: STANDBY</span>
              <span className="text-[hsl(var(--primary)/0.75)]">SCAN: PATH_MAP_INVALID</span>
              <span>RBAC: ENFORCED</span>
              <span>TENANT: REQUIRED</span>
              <span>RECOVERY: SUGGESTED</span>
              <span className="text-[hsl(var(--accent)/0.75)]">ASSIST: STANDBY</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
