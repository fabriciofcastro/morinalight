"use client";

import { DigitalGridMap } from "@/components/login/digital-grid-map";
import { EnergyRings } from "@/components/login/energy-rings";
import { FloatingOrbs } from "@/components/login/floating-orbs";
import { GlowingGrid } from "@/components/login/glowing-grid";
import { HexagonGrid } from "@/components/login/hexagon-grid";
import { LightBeams } from "@/components/login/light-beams";
import { useEffect, useState } from "react";

/**
 * Background fixo animado replicado da tela de login
 * Estilo futurístico e consistente para todo o sistema
 */
export function AppBackgroundAdvanced() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient e grid pattern */}
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

      {/* Animated components do login */}
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
  );
}
