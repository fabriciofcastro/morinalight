"use client";

import { cn } from "@morina/ui";
import type { PropsWithChildren } from "react";

import { useThemeEngine } from "@/hooks/use-theme-engine";

type ThemeShellProps = PropsWithChildren<{
  className?: string;
}>;

export function ThemeShell({ children, className }: ThemeShellProps) {
  const { getCompanyVideo, loading } = useThemeEngine();
  const videoSrc = getCompanyVideo();

  return (
    <div
      className={cn(
        "theme-shell relative flex min-h-screen flex-col overflow-hidden text-[var(--fg)] transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease)]",
        className,
      )}
      style={{ background: "var(--bg-gradient, hsl(var(--bg)))" }}
    >
      {videoSrc ? (
        <iframe
          title="Vídeo Institucional Morina"
          src={videoSrc}
          className="absolute inset-0 h-full w-full object-cover opacity-[0.48] mix-blend-screen"
          allow="autoplay; fullscreen; encrypted-media"
          loading="lazy"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle at top, hsla(var(--primary) / 0.28) 0%, transparent 70%)",
          }}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-80"
        style={{
          background:
            "linear-gradient(135deg, hsla(var(--text-1) / 0.12) 0%, transparent 55%, hsla(var(--secondary) / 0.22) 100%)",
        }}
      />
      <div aria-hidden className="glass-motion pointer-events-none absolute inset-0" />

      <div className="relative z-[1] flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-[var(--fs-sm)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
            Sincronizando tema da empresa...
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
