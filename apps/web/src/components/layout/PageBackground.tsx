"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@morina/ui";

export function PageBackground() {
    const pathname = usePathname();
    const [bgType, setBgType] = useState<"minimalist" | "flow" | "nodes" | "circuit">("minimalist");

    useEffect(() => {
        if (pathname.startsWith("/analytics")) {
            setBgType("flow");
        } else if (pathname.startsWith("/users") || pathname.startsWith("/team")) {
            setBgType("nodes");
        } else if (pathname.startsWith("/settings")) {
            setBgType("circuit");
        } else {
            setBgType("minimalist"); // Default to minimalist for dashboard/home
        }
    }, [pathname]);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[#020617]" /> {/* Base Layer */}

            <AnimatePresence mode="wait">
                <motion.div
                    key={bgType}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    {bgType === "minimalist" && <MinimalistBackground />}
                    {bgType === "flow" && <FlowBackground />}
                    {bgType === "nodes" && <NodesBackground />}
                    {bgType === "circuit" && <CircuitBackground />}
                </motion.div>
            </AnimatePresence>

            {/* Global Vignette & Noise */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}

function MinimalistBackground() {
    const [particles, setParticles] = useState<{ top: string; left: string; duration: number; delay: number }[]>([]);

    useEffect(() => {
        setParticles(
            [...Array(3)].map(() => ({
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                duration: 10 + Math.random() * 10,
                delay: Math.random() * 5,
            }))
        );
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Subtle Breathing Gradient Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[20%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary))_0%,transparent_70%)] blur-[120px]"
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

            {/* Sparse Floating Particles */}
            {particles.map((p, i) => (
                <motion.div
                    key={i}
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]" />
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
                    style={{ top: `${20 + i * 15}%` }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                        duration: 10 + i * 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.5
                    }}
                />
            ))}
        </div>
    );
}

function NodesBackground() {
    return (
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.08),transparent_50%)]" />
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
    );
}

function CircuitBackground() {
    return (
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#000000_25%,transparent_25%,transparent_75%,#000000_75%,#000000),linear-gradient(45deg,#000000_25%,transparent_25%,transparent_75%,#000000_75%,#000000)]" style={{ backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px', opacity: 0.1 }} />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-900/50" />
        </div>
    );
}
