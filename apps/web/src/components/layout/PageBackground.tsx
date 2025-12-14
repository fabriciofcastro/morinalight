"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const FLOW_LINES = [
  { id: "flow-a", top: "20%", duration: 10, delay: 0 },
  { id: "flow-b", top: "35%", duration: 12, delay: 0.5 },
  { id: "flow-c", top: "50%", duration: 14, delay: 1.0 },
  { id: "flow-d", top: "65%", duration: 16, delay: 1.5 },
  { id: "flow-e", top: "80%", duration: 18, delay: 2.0 },
] as const;

const REALTIME_PULSES = [
  { id: "pulse-a", rotate: 0, delay: 0.0 },
  { id: "pulse-b", rotate: 15, delay: 0.45 },
  { id: "pulse-c", rotate: 30, delay: 0.9 },
  { id: "pulse-d", rotate: 45, delay: 1.35 },
  { id: "pulse-e", rotate: 60, delay: 1.8 },
  { id: "pulse-f", rotate: 75, delay: 2.25 },
] as const;

const REALTIME_STREAMS = [
  { id: "stream-a", top: "12%", duration: 6, delay: 0.0 },
  { id: "stream-b", top: "24%", duration: 7, delay: 0.35 },
  { id: "stream-c", top: "36%", duration: 8, delay: 0.7 },
  { id: "stream-d", top: "48%", duration: 9, delay: 1.05 },
  { id: "stream-e", top: "60%", duration: 10, delay: 1.4 },
  { id: "stream-f", top: "72%", duration: 11, delay: 1.75 },
  { id: "stream-g", top: "84%", duration: 12, delay: 2.1 },
] as const;

const FORGE_SPARKS = [
  { id: "spark-a", top: "10%", left: "0%", rotate: "0deg", duration: 2.8, delay: 0.0 },
  { id: "spark-b", top: "19%", left: "13%", rotate: "17deg", duration: 3.8, delay: 0.2 },
  { id: "spark-c", top: "28%", left: "26%", rotate: "34deg", duration: 4.8, delay: 0.4 },
  { id: "spark-d", top: "37%", left: "39%", rotate: "51deg", duration: 2.8, delay: 0.6 },
  { id: "spark-e", top: "46%", left: "52%", rotate: "68deg", duration: 3.8, delay: 0.8 },
  { id: "spark-f", top: "55%", left: "65%", rotate: "85deg", duration: 4.8, delay: 1.0 },
  { id: "spark-g", top: "64%", left: "78%", rotate: "102deg", duration: 2.8, delay: 1.2 },
  { id: "spark-h", top: "73%", left: "1%", rotate: "119deg", duration: 3.8, delay: 1.4 },
  { id: "spark-i", top: "82%", left: "14%", rotate: "136deg", duration: 4.8, delay: 1.6 },
  { id: "spark-j", top: "91%", left: "27%", rotate: "153deg", duration: 2.8, delay: 1.8 },
] as const;

export function PageBackground() {
  const pathname = usePathname();
  const [bgType, setBgType] = useState<
    "terminal" | "jarvis" | "flow" | "nodes" | "circuit" | "vault" | "realtime" | "forge" | "fichas-custo"
  >("terminal");

  useEffect(() => {
    queueMicrotask(() => {
      if (pathname.startsWith("/dashboard")) {
        setBgType("jarvis");
      } else if (pathname.startsWith("/admin/realtime-lab")) {
        setBgType("realtime");
      } else if (pathname.startsWith("/admin")) {
        setBgType("vault");
      } else if (pathname.startsWith("/analytics")) {
        setBgType("flow");
      } else if (
        pathname.startsWith("/users") ||
        pathname.startsWith("/team") ||
        pathname.startsWith("/clientes") ||
        pathname.startsWith("/clients")
      ) {
        setBgType("nodes");
      } else if (pathname.startsWith("/settings")) {
        setBgType("circuit");
      } else if (
        pathname.startsWith("/catalog") ||
        pathname.startsWith("/products") ||
        pathname.startsWith("/produtos")
      ) {
        setBgType("forge");
      } else if (pathname.startsWith("/fichas-custo")) {
        setBgType("fichas-custo");
      } else {
        setBgType("terminal"); // Default: secure terminal for dashboard/home
      }
    });
  }, [pathname]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-(--surface-veil,#020617)" /> {/* Base Layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
          className="absolute inset-0"
        >
          {bgType === "jarvis" && <JarvisBackground />}
          {bgType === "terminal" && <TerminalBackground />}
          {bgType === "flow" && <FlowBackground />}
          {bgType === "nodes" && <NodesBackground />}
          {bgType === "circuit" && <CircuitBackground />}
          {bgType === "vault" && <VaultBackground />}
          {bgType === "realtime" && <RealtimeBackground />}
          {bgType === "forge" && <ForgeBackground />}
          {bgType === "fichas-custo" && <FichasCustoBackground />}
        </motion.div>
      </AnimatePresence>
      {/* Cinematic system overlays (tokens controlam intensidade) */}
      <div className="absolute inset-0 cinematic-noise pointer-events-none" aria-hidden="true" />
      <div
        className="absolute inset-0 cinematic-scanlines pointer-events-none motion-reduce:hidden"
        aria-hidden="true"
      />
      <div className="absolute inset-0 cinematic-glow pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 cinematic-vignette pointer-events-none" aria-hidden="true" />
    </div>
  );
}

function JarvisBackground() {
  const [particles, setParticles] = useState<
    { top: string; left: string; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    queueMicrotask(() => {
      setParticles(
        [...Array(7)].map(() => ({
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          duration: 10 + Math.random() * 9,
          delay: Math.random() * 4,
        })),
      );
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid estilo login (mais “cinematic”) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,hsl(var(--border))_20%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,hsl(var(--border))_18%,transparent)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(0,0,0,0)_55%,rgba(2,6,23,1)_100%)]" />

      {/* Glows (JARVIS + login blend) */}
      <div className="absolute -top-[25%] left-[18%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary))/0.12,transparent_70%)] blur-[140px]" />
      <div className="absolute -bottom-[25%] right-[12%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,hsl(var(--accent))/0.10,transparent_72%)] blur-[130px]" />

      {/* Núcleo HUD */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-70 motion-reduce:hidden">
        <div className="relative h-[min(520px,55svh)] w-[min(520px,55svh)]">
          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full blur-[18px]"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(55,224,246,0.10), transparent 62%)",
            }}
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Radar sweep (JARVIS) */}
          <motion.div
            className="absolute inset-0 opacity-70"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            style={{
              background:
                "conic-gradient(from 90deg, transparent 0deg, rgba(55,224,246,0.18) 18deg, transparent 60deg)",
              maskImage: "radial-gradient(circle, rgba(0,0,0,1) 0%, transparent 72%)",
              WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 0%, transparent 72%)",
            }}
          />

          {/* Rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-[hsl(var(--primary)/0.12)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-10 rounded-full border border-dashed border-[hsl(var(--accent)/0.14)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-24 rounded-full border border-[hsl(var(--primary)/0.10)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-36 rounded-full border border-dashed border-[hsl(var(--primary)/0.10)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />

          {/* Orbit dots */}
          {[
            { id: "o1", inset: "12px", size: 6, dur: 9.5, delay: 0 },
            { id: "o2", inset: "56px", size: 5, dur: 12.5, delay: 0.8 },
            { id: "o3", inset: "100px", size: 4, dur: 15.5, delay: 1.6 },
          ].map((o) => (
            <motion.div
              key={o.id}
              className="absolute"
              style={{
                inset: o.inset,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: o.dur, repeat: Infinity, ease: "linear", delay: o.delay }}
            >
              <div
                className="absolute -top-[2px] left-1/2 -translate-x-1/2 bg-[hsl(var(--primary))] opacity-70 shadow-[0_0_16px_rgba(55,224,246,0.35)]"
                style={{ width: o.size, height: o.size }}
              />
            </motion.div>
          ))}

          {/* Pulse bursts */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`p-${i}`}
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[hsl(var(--accent)/0.22)]"
              animate={{ scale: [1, 3.6], opacity: [0.22, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeOut", delay: i * 1.1 }}
            />
          ))}

          {/* Core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-28 w-28 border-2 border-[hsl(var(--primary)/0.20)] bg-[hsl(var(--primary)/0.05)] backdrop-blur-sm shadow-[0_0_45px_rgba(55,224,246,0.10)]">
              <div className="absolute -left-1 -top-1 h-5 w-5 border-l border-t border-[hsl(var(--primary)/0.7)]" />
              <div className="absolute -right-1 -top-1 h-5 w-5 border-r border-t border-[hsl(var(--primary)/0.55)]" />
              <div className="absolute -left-1 -bottom-1 h-5 w-5 border-l border-b border-[hsl(var(--primary)/0.55)]" />
              <div className="absolute -right-1 -bottom-1 h-5 w-5 border-r border-b border-[hsl(var(--primary)/0.7)]" />

              <div className="absolute inset-0 grid grid-cols-3 gap-1 p-3">
                {["j1", "j2", "j3", "j4", "j5", "j6", "j7", "j8", "j9"].map((id, idx) => (
                  <motion.div
                    key={id}
                    className="bg-[hsl(var(--primary)/0.55)]"
                    animate={{ opacity: [0.15, 0.85, 0.15] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.08,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Data streams */}
          <div className="absolute top-1/2 left-0 h-px w-full bg-linear-to-r from-transparent via-[hsl(var(--primary)/0.18)] to-transparent" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-linear-to-b from-transparent via-[hsl(var(--accent)/0.16)] to-transparent" />
        </div>
      </div>

      {/* Sweep diagonal */}
      <motion.div
        className="absolute -top-24 left-0 right-0 h-24 bg-[linear-gradient(to_bottom,transparent,hsla(var(--primary)/0.12),transparent)] opacity-70 motion-reduce:hidden"
        animate={{ y: ["0%", "140%"] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: "linear" }}
        style={{ rotate: "-10deg" }}
      />

      {/* Beam line (login vibe) */}
      <motion.div
        className="absolute -inset-[30%] opacity-25 motion-reduce:hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 18px)",
        }}
        animate={{ rotate: [0, 1.8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Partículas */}
      {particles.map((p) => (
        <motion.div
          key={`${p.top}-${p.left}-${p.duration}-${p.delay}`}
          className="absolute h-1 w-1 bg-white/20"
          style={{ top: p.top, left: p.left }}
          animate={{ y: [0, -120, 0], opacity: [0, 0.55, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
        />
      ))}
    </div>
  );
}

function TerminalBackground() {
  const [particles, setParticles] = useState<
    { top: string; left: string; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    queueMicrotask(() => {
      setParticles(
        [...Array(5)].map(() => ({
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          duration: 12 + Math.random() * 10,
          delay: Math.random() * 5,
        })),
      );
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid técnico (coeso com o login) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,hsl(var(--border))_22%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,hsl(var(--border))_22%,transparent)_1px,transparent_1px)] bg-size-[4.5rem_4.5rem] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(0,0,0,0)_60%,rgba(2,6,23,1)_100%)]" />

      {/* Subtle Breathing Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-12%] left-[15%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary))_0%,transparent_72%)] blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.15, 0.05],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,hsl(var(--secondary))_0%,transparent_70%)] blur-[100px]"
      />

      {/* Sweep (scanline) */}
      <motion.div
        className="absolute inset-x-0 -top-24 h-24 bg-[linear-gradient(to_bottom,transparent,hsla(var(--primary)/0.10),transparent)]"
        animate={{ y: ["0%", "120%"] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Sparse Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={`${p.top}-${p.left}-${p.duration}-${p.delay}`}
          className="absolute h-1 w-1 rounded-full bg-white/20"
          style={{
            top: p.top,
            left: p.left,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function FlowBackground() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--secondary))/0.06,transparent_55%)]" />
      {FLOW_LINES.map((line) => (
        <motion.div
          key={line.id}
          className="absolute h-px w-full bg-linear-to-r from-transparent via-[hsl(var(--secondary)/0.35)] to-transparent"
          style={{ top: line.top }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: line.duration,
            repeat: Infinity,
            ease: "linear",
            delay: line.delay,
          }}
        />
      ))}
    </div>
  );
}

function NodesBackground() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent))/0.10,transparent_55%)]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

function CircuitBackground() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.06) 75%, rgba(255,255,255,0.06)), linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.06) 75%, rgba(255,255,255,0.06))",
          backgroundSize: "60px 60px",
          backgroundPosition: "0 0, 30px 30px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,hsl(var(--primary))/0.08,transparent_55%),radial-gradient(circle_at_70%_80%,hsl(var(--accent))/0.07,transparent_60%)]" />
      {/* Traços de circuito */}
      <div className="absolute inset-0 opacity-50 bg-[linear-gradient(to_right,transparent,hsla(var(--primary)/0.16),transparent)]" />
    </div>
  );
}

function VaultBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,hsl(var(--primary))/0.10,transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,hsl(var(--border))_26%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,hsl(var(--border))_18%,transparent)_1px,transparent_1px)] bg-size-[5.25rem_5.25rem] opacity-30" />

      {/* “Portas” diagonais do cofre */}
      <motion.div
        className="absolute -inset-[40%] opacity-35"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 18px)",
        }}
        animate={{ rotate: [0, 1.5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Trava central (pulso) */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 border border-[hsl(var(--primary)/0.12)]"
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function RealtimeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--accent))/0.10,transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,hsl(var(--border))_22%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,hsl(var(--border))_22%,transparent)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-25" />

      {/* Radar sweep */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 90deg, transparent 0deg, rgba(55,224,246,0.18) 18deg, transparent 55deg)",
          maskImage: "radial-gradient(circle, rgba(0,0,0,1) 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 0%, transparent 70%)",
        }}
      />

      {/* Pulsos de evento */}
      {REALTIME_PULSES.map((pulse) => (
        <motion.div
          key={pulse.id}
          className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 border border-[hsl(var(--accent)/0.22)]"
          style={{ rotate: pulse.rotate }}
          animate={{ scale: [1, 3.2], opacity: [0.28, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut", delay: pulse.delay }}
        />
      ))}

      {/* Linhas de stream */}
      {REALTIME_STREAMS.map((stream) => (
        <motion.div
          key={stream.id}
          className="absolute h-px w-full bg-linear-to-r from-transparent via-[hsl(var(--primary)/0.22)] to-transparent opacity-60"
          style={{ top: stream.top }}
          animate={{ x: ["-120%", "120%"] }}
          transition={{
            duration: stream.duration,
            repeat: Infinity,
            ease: "linear",
            delay: stream.delay,
          }}
        />
      ))}
    </div>
  );
}

function ForgeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,hsl(var(--primary))/0.10,transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,hsl(var(--secondary))/0.08,transparent_62%)]" />

      {/* Grade mais “industrial” */}
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[3.5rem_3.5rem]" />

      {/* Faíscas minimalistas */}
      {FORGE_SPARKS.map((spark) => (
        <motion.div
          key={spark.id}
          className="absolute h-0.5 w-16 bg-linear-to-r from-transparent via-[hsl(var(--accent)/0.35)] to-transparent opacity-60"
          style={{
            top: spark.top,
            left: spark.left,
            rotate: spark.rotate,
          }}
          animate={{ opacity: [0.15, 0.65, 0.15] }}
          transition={{
            duration: spark.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: spark.delay,
          }}
        />
      ))}
    </div>
  );
}

function FichasCustoBackground() {
  const [dataNodes, setDataNodes] = useState<
    { id: string; top: string; left: string; delay: number; duration: number }[]
  >([]);
  const [circuitLines, setCircuitLines] = useState<
    { id: string; path: string; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    queueMicrotask(() => {
      // Nós de dados flutuantes
      setDataNodes(
        Array.from({ length: 12 }).map((_, i) => ({
          id: `node-${i}`,
          top: `${15 + (i % 4) * 25}%`,
          left: `${10 + Math.floor(i / 4) * 30}%`,
          delay: i * 0.3,
          duration: 8 + Math.random() * 6,
        })),
      );

      // Linhas de circuito conectando nós
      setCircuitLines(
        Array.from({ length: 8 }).map((_, i) => ({
          id: `circuit-${i}`,
          path: `M ${20 + i * 12} ${30 + (i % 3) * 20} L ${60 + i * 8} ${50 + (i % 2) * 25}`,
          delay: i * 0.4,
          duration: 6 + Math.random() * 4,
        })),
      );
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient com cores vibrantes */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629]" />
      
      {/* Grid holográfico animado */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "4rem 4rem",
        }}
        animate={{
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orbs de energia pulsantes */}
      <motion.div
        className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[radial-gradient(circle,hsl(var(--primary))/0.15,transparent_70%)] blur-[120px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.25, 0.1],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[radial-gradient(circle,hsl(var(--accent))/0.12,transparent_70%)] blur-[100px]"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.08, 0.22, 0.08],
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,hsl(var(--secondary))/0.10,transparent_70%)] blur-[90px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.06, 0.18, 0.06],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Nós de dados flutuantes */}
      {dataNodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute"
          style={{
            top: node.top,
            left: node.left,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: node.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: node.delay,
          }}
        >
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_12px_hsl(var(--primary)/0.8)]" />
          <motion.div
            className="absolute inset-0 rounded-full bg-[hsl(var(--primary))]"
            animate={{
              scale: [1, 3, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: node.duration * 0.7,
              repeat: Infinity,
              ease: "easeOut",
              delay: node.delay,
            }}
          />
        </motion.div>
      ))}

      {/* Linhas de circuito conectando nós */}
      <svg className="absolute inset-0 opacity-30" style={{ mixBlendMode: "screen" }}>
        {circuitLines.map((line) => (
          <motion.path
            key={line.id}
            d={line.path}
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: line.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: line.delay,
            }}
          />
        ))}
      </svg>

      {/* Partículas de energia */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute h-1 w-1 rounded-full bg-[hsl(var(--accent))]"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Wave scan effect */}
      <motion.div
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[hsl(var(--primary)/0.15)] via-transparent to-transparent"
        animate={{
          y: ["-100%", "200%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Holographic overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_30%,rgba(59,130,246,0.03)_50%,transparent_70%)] opacity-50" />
    </div>
  );
}
