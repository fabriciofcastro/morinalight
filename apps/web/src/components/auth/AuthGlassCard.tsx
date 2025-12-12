import { cn } from "@morina/ui";
import type { CSSProperties, ReactNode } from "react";

type AuthGlassCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function AuthGlassCard({ title, subtitle, children, className }: AuthGlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-(--auth-card-border,rgba(255,255,255,0.10)) bg-(--auth-card-bg,rgba(0,0,0,0.20)) p-6 lg:p-10 backdrop-blur-(--auth-card-blur,12px) shadow-(--auth-card-shadow,0_25px_50px_-12px_rgba(0,0,0,0.45)) group",
        className,
      )}
    >
      {/* Reflexo “luz no vidro/espelho” (loop, de fora a fora) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          aria-hidden="true"
          className="auth-mirror-glint absolute -top-[70%] -left-[70%] h-[240%] w-[70%] bg-linear-to-r from-transparent via-white/20 to-transparent blur-[2px] mix-blend-screen motion-reduce:hidden"
          style={
            {
              // mais sutil por padrão no card
              "--auth-mirror-glint-opacity": "0.10",
              "--auth-mirror-glint-opacity-focus": "0.14",
              "--auth-mirror-glint-duration": "6.4s",
              "--auth-mirror-glint-delay": "1.2s",
            } as CSSProperties
          }
        />
      </div>

      {/* Tech Corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[hsl(var(--primary)/0.5)]" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[hsl(var(--primary)/0.5)]" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[hsl(var(--primary)/0.5)]" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[hsl(var(--primary)/0.5)]" />

      <div className="relative z-10">
        <div className="mb-8 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase font-mono">
            <span className="text-[hsl(var(--primary))] mr-2">/</span>
            {title}
          </h2>
          {subtitle ? (
            <p className="text-xs text-white/40 mt-2 font-mono uppercase tracking-widest">
              {subtitle}
            </p>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}
