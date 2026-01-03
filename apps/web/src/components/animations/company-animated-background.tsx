"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CompanyAnimatedBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        queueMicrotask(() => setMounted(true));
    }, []);

    if (!mounted) return null;

    // Partículas flutuantes (cores frias corporativas)
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${(i * 23) % 100}%`,
        top: `${(i * 31) % 100}%`,
        size: Math.random() * 3 + 1,
        duration: 15 + Math.random() * 10,
        delay: i * 0.3,
        xDrift: (Math.sin(i) * 40 - 20),
        yDrift: (Math.cos(i) * 40 - 20),
    }));

    // Orbs grandes com blur (azul, roxo, rosa)
    const orbs = [
        { id: 1, color: "#3b82f6", size: 600, top: "10%", left: "15%", duration: 60 },
        { id: 2, color: "#8b5cf6", size: 550, top: "60%", right: "20%", duration: 70 },
        { id: 3, color: "#ec4899", size: 500, top: "35%", right: "10%", duration: 65 },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#0a0a10] to-[#09090b]" />

            {/* Orbs grandes animados */}
            {orbs.map((orb) => (
                <motion.div
                    key={orb.id}
                    className="absolute rounded-full blur-[120px] opacity-30"
                    style={{
                        width: `${orb.size}px`,
                        height: `${orb.size}px`,
                        background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                        top: orb.top,
                        ...(orb.left ? { left: orb.left } : {}),
                        ...(orb.right ? { right: orb.right } : {}),
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, orb.id % 2 === 0 ? 50 : -50, 0],
                        y: [0, orb.id % 2 === 0 ? -50 : 50, 0],
                    }}
                    transition={{
                        duration: orb.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: orb.id * 2,
                    }}
                />
            ))}

            {/* Grid pattern animado */}
            <motion.div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
            linear-gradient(#3b82f6 1px, transparent 1px),
            linear-gradient(90deg, #3b82f6 1px, transparent 1px)
          `,
                    backgroundSize: "50px 50px",
                }}
                animate={{
                    backgroundPosition: ["0 0", "50px 50px"],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Linhas diagonais animadas */}
            <motion.div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(139, 92, 246, 0.3) 10px,
              rgba(139, 92, 246, 0.3) 11px
            )
          `,
                }}
                animate={{
                    x: [0, 20, 0],
                    y: [0, 20, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Partículas flutuantes */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        background: `radial-gradient(circle, #3b82f6, #8b5cf6)`,
                    }}
                    animate={{
                        y: [0, p.yDrift, 0],
                        x: [0, p.xDrift, 0],
                        opacity: [0.1, 0.4, 0.1],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: p.delay,
                    }}
                />
            ))}

            {/* Ondas de energia (azul) */}
            <motion.div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    background: `radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)`,
                }}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.02, 0.06, 0.02],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Ondas de energia (roxo) */}
            <motion.div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    background: `radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)`,
                }}
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.02, 0.05, 0.02],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />

            {/* Ondas de energia (rosa) */}
            <motion.div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    background: `radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)`,
                }}
                animate={{
                    scale: [1, 1.35, 1],
                    opacity: [0.02, 0.05, 0.02],
                }}
                transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4,
                }}
            />

            {/* Scanline sutil */}
            <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-10"
                animate={{
                    y: ["0%", "100%"],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
}
