"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
}

interface GridAnimatedBackgroundProps {
    variant?: "company" | "supplier" | "branch" | "default";
    className?: string;
}

export function GridAnimatedBackground({
    variant = "default",
    className = ""
}: GridAnimatedBackgroundProps) {
    const particles = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 20 + 15,
            delay: Math.random() * 5,
        }));
    }, []);

    const gradientColors = useMemo(() => {
        switch (variant) {
            case "company":
                return {
                    from: "from-blue-500/10",
                    via: "via-purple-500/10",
                    to: "to-pink-500/10",
                    glow: "bg-blue-500/20",
                };
            case "supplier":
                return {
                    from: "from-emerald-500/10",
                    via: "via-teal-500/10",
                    to: "to-cyan-500/10",
                    glow: "bg-emerald-500/20",
                };
            case "branch":
                return {
                    from: "from-orange-500/10",
                    via: "via-amber-500/10",
                    to: "to-yellow-500/10",
                    glow: "bg-orange-500/20",
                };
            default:
                return {
                    from: "from-violet-500/10",
                    via: "via-indigo-500/10",
                    to: "to-blue-500/10",
                    glow: "bg-violet-500/20",
                };
        }
    }, [variant]);

    return (
        <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
            {/* Base gradient */}
            <div className="absolute inset-0 bg-[#09090b]" />

            {/* Animated gradient overlay */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${gradientColors.from} ${gradientColors.via} ${gradientColors.to}`}
                animate={{
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ backgroundSize: "400% 400%" }}
            />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Floating particles */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className={`absolute rounded-full ${gradientColors.glow} blur-xl`}
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 50 - 25, 0],
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Radial gradient spotlight */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.05) 0%, transparent 50%)`,
                }}
            />

            {/* Noise texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}

export function WaveAnimatedBackground({ variant = "default", className = "" }: GridAnimatedBackgroundProps) {
    const waveColors = useMemo(() => {
        switch (variant) {
            case "company":
                return ["#3b82f6", "#8b5cf6", "#ec4899"];
            case "supplier":
                return ["#10b981", "#14b8a6", "#06b6d4"];
            case "branch":
                return ["#f97316", "#f59e0b", "#eab308"];
            default:
                return ["#8b5cf6", "#6366f1", "#3b82f6"];
        }
    }, [variant]);

    return (
        <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-[#09090b]" />

            {/* Animated waves */}
            {waveColors.map((color, index) => (
                <motion.div
                    key={index}
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(180deg, transparent 0%, ${color}15 100%)`,
                    }}
                    animate={{
                        y: [0, -20, 0],
                    }}
                    transition={{
                        duration: 8 + index * 2,
                        repeat: Infinity,
                        delay: index * 0.5,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: "80px 80px",
                }}
            />
        </div>
    );
}

export function DotMatrixBackground({ variant = "default", className = "" }: GridAnimatedBackgroundProps) {
    const dots = useMemo(() => {
        return Array.from({ length: 200 }, (_, i) => ({
            id: i,
            x: (i % 20) * 5,
            y: Math.floor(i / 20) * 5,
            delay: Math.random() * 2,
        }));
    }, []);

    return (
        <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-[#09090b]" />

            {dots.map((dot) => (
                <motion.div
                    key={dot.id}
                    className="absolute w-1 h-1 bg-white/20 rounded-full"
                    style={{
                        left: `${dot.x}%`,
                        top: `${dot.y}%`,
                    }}
                    animate={{
                        opacity: [0.1, 0.5, 0.1],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 3,
                        delay: dot.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
