"use client";

type JarvisHudOverlayProps = {
  variant?: "dashboard";
};

export function JarvisHudOverlay({ variant = "dashboard" }: JarvisHudOverlayProps) {
  if (variant !== "dashboard") return null;

  return (
    // Overlay decorativo: fica ENTRE o background (z-0) e a UI (z-10+)
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      {/* Corner brackets */}
      <div className="absolute left-5 top-5 h-10 w-10 border-l border-t border-[hsl(var(--primary)/0.35)]" />
      <div className="absolute right-5 top-5 h-10 w-10 border-r border-t border-[hsl(var(--primary)/0.35)]" />
      <div className="absolute left-5 bottom-5 h-10 w-10 border-l border-b border-[hsl(var(--primary)/0.25)]" />
      <div className="absolute right-5 bottom-5 h-10 w-10 border-r border-b border-[hsl(var(--primary)/0.25)]" />

      {/* HUD arcs (JARVIS vibe) */}
      <svg
        className="absolute -left-12 top-24 h-[260px] w-[260px] opacity-60 motion-reduce:hidden"
        viewBox="0 0 200 200"
        fill="none"
      >
        <title>HUD</title>
        <path
          d="M100 14a86 86 0 1 0 0 172a86 86 0 1 0 0-172Z"
          stroke="hsl(var(--primary)/0.18)"
          strokeWidth="1"
        />
        <path
          d="M100 34a66 66 0 1 0 0 132a66 66 0 1 0 0-132Z"
          stroke="hsl(var(--accent)/0.16)"
          strokeWidth="1"
          strokeDasharray="6 6"
        />
        <path
          d="M100 52a48 48 0 1 0 0 96a48 48 0 1 0 0-96Z"
          stroke="hsl(var(--primary)/0.14)"
          strokeWidth="1"
        />
      </svg>

      <svg
        className="absolute -right-14 bottom-14 h-[320px] w-[320px] opacity-55 motion-reduce:hidden"
        viewBox="0 0 200 200"
        fill="none"
      >
        <title>HUD</title>
        <path
          d="M100 12a88 88 0 1 0 0 176a88 88 0 1 0 0-176Z"
          stroke="hsl(var(--accent)/0.18)"
          strokeWidth="1"
        />
        <path
          d="M100 28a72 72 0 1 0 0 144a72 72 0 1 0 0-144Z"
          stroke="hsl(var(--primary)/0.16)"
          strokeWidth="1"
          strokeDasharray="10 8"
        />
      </svg>

      {/* (intencional) sem textos no HUD para não conflitar com o Header */}

      {/* Sweep line (subtle) */}
      <div className="jarvis-hud-sweep absolute left-0 right-0 top-0 h-[2px] opacity-60 motion-reduce:hidden" />

      {/* Linha inferior (sem texto) */}
      <div className="absolute bottom-6 left-6 right-6 h-px bg-linear-to-r from-transparent via-white/10 to-transparent opacity-60 motion-reduce:hidden" />
    </div>
  );
}
