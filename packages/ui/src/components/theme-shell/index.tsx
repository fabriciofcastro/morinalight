"use client";

import type { PropsWithChildren } from "react";
import * as React from "react";
import { cn } from "../../lib/cn";

export interface ThemeShellProps extends PropsWithChildren {
    /** Video URL for the background (YouTube/Vimeo/Direct) */
    videoSrc?: string | null;
    /** Whether the application is in a loading state */
    loading?: boolean;
    /** Whether to show the elaborate "Boot Sequence" animation when loading */
    isBootSequence?: boolean;
    /** Custom class name */
    className?: string;
    /** Custom style object */
    style?: React.CSSProperties;
}

export function ThemeShell({
    children,
    className,
    videoSrc,
    loading,
    isBootSequence,
    style,
    ...props
}: ThemeShellProps) {
    return (
        <div
            className={cn(
                "theme-shell relative flex min-h-screen flex-col overflow-hidden text-(--fg) transition-colors duration-(--motion-duration-base) ease-(--motion-ease)",
                className,
            )}
            style={{
                background: "var(--bg-gradient, hsl(var(--bg)))",
                ...style,
            }}
            {...props}
        >
            {/* Background Video or Fallback Gradient */}
            {videoSrc ? (
                <iframe
                    title="Background Video"
                    src={videoSrc}
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.48] mix-blend-screen pointer-events-none"
                    allow="autoplay; fullscreen; encrypted-media"
                    loading="lazy"
                />
            ) : (
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-70 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(circle at top, hsla(var(--primary) / 0.28) 0%, transparent 70%)",
                    }}
                />
            )}

            {/* Cinematic Overlays */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 mix-blend-screen opacity-80"
                style={{
                    background:
                        "linear-gradient(135deg, hsla(var(--text-1) / 0.12) 0%, transparent 55%, hsla(var(--secondary) / 0.22) 100%)",
                }}
            />
            <div aria-hidden className="glass-motion pointer-events-none absolute inset-0" />

            {/* Main Content Area */}
            <div className="relative z-1 flex flex-1 flex-col">
                {loading ? (
                    isBootSequence ? (
                        /* Futuristic Boot Sequence Animation */
                        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[4rem_4rem]" />
                                <div className="absolute inset-0 auth-noise" />
                                <div className="absolute inset-0 auth-vignette" />
                                <div className="absolute -top-[25%] left-[15%] h-[520px] w-[520px] bg-[radial-gradient(circle,hsla(var(--primary)/0.14),transparent_70%)] blur-[140px]" />
                                <div className="absolute -bottom-[25%] right-[12%] h-[520px] w-[520px] bg-[radial-gradient(circle,hsla(var(--secondary)/0.12),transparent_72%)] blur-[140px]" />
                            </div>

                            <div className="relative w-[min(92vw,760px)] border border-white/10 bg-[color-mix(in_oklab,black_70%,hsl(var(--surface))_30%)] p-6 backdrop-blur-xl shadow-[0_28px_120px_-48px_rgba(55,224,246,0.25)]">
                                {/* Decorative Corners */}
                                <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[hsl(var(--primary)/0.55)]" />
                                <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[hsl(var(--primary)/0.55)]" />
                                <div className="absolute left-0 bottom-0 h-4 w-4 border-l-2 border-b-2 border-[hsl(var(--primary)/0.45)]" />
                                <div className="absolute right-0 bottom-0 h-4 w-4 border-r-2 border-b-2 border-[hsl(var(--primary)/0.45)]" />

                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-[hsl(var(--primary))]">
                                            SYSTEM_BOOT_SEQUENCE
                                        </div>
                                        <div className="mt-2 text-xl font-bold text-white tracking-tight">
                                            Calibrando ambiente seguro…
                                        </div>
                                        <div className="mt-1 text-sm text-white/55">
                                            Sincronizando tokens de tema, vídeo e perfil da organização.
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 border border-white/10 bg-white/5" aria-hidden="true">
                                        <div className="h-full w-full bg-[linear-gradient(to_bottom,transparent,hsla(var(--primary)/0.25),transparent)] animate-[pulse_1.2s_ease-in-out_infinite]" />
                                    </div>
                                </div>

                                <div className="mt-5 h-[3px] w-full bg-white/5 overflow-hidden">
                                    <div className="h-full w-full origin-left bg-[hsl(var(--primary)/0.75)] animate-[scale-x_1.6s_ease-in-out_infinite]" />
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-3 text-[10px] font-mono text-white/55">
                                    <div className="border border-white/10 bg-white/5 px-3 py-2">
                                        <div className="text-white/35 tracking-[0.22em] uppercase">Fase</div>
                                        <div className="mt-0.5 text-white/80">THEME_SYNC</div>
                                    </div>
                                    <div className="border border-white/10 bg-white/5 px-3 py-2">
                                        <div className="text-white/35 tracking-[0.22em] uppercase">Canal</div>
                                        <div className="mt-0.5 text-white/80">SECURE_UI</div>
                                    </div>
                                    <div className="border border-white/10 bg-white/5 px-3 py-2">
                                        <div className="text-white/35 tracking-[0.22em] uppercase">Modo</div>
                                        <div className="mt-0.5 text-white/80">BOOT</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Simple Loading State */
                        <div className="flex flex-1 items-center justify-center text-sm text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                            Calibrando tema…
                        </div>
                    )
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
