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
        "theme-shell relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)] transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease)]",
        className,
      )}
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
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(40,85,255,0.28)_0%,transparent_70%)] opacity-70"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_55%,rgba(40,85,255,0.18)_100%)] mix-blend-screen opacity-80"
      />
      <div aria-hidden className="glass-motion pointer-events-none absolute inset-0" />

      <div className="relative z-[1] flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
            Sincronizando tema da empresa...
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
