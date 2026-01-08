"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface Node {
    id: number;
    x: number;
    y: number;
    size: number;
    connections: number[];
}

interface NetworkBackgroundProps {
    variant?: "users" | "permissions" | "roles";
    className?: string;
}

export function NetworkBackground({
    variant = "users",
    className = "",
}: NetworkBackgroundProps) {
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    // Generate network nodes
    const [nodes, setNodes] = useState<Node[]>([]);

    useEffect(() => {
        const nodeCount = 25;
        const generated: Node[] = [];

        for (let i = 0; i < nodeCount; i++) {
            const node: Node = {
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 4 + 2,
                connections: [],
            };

            // Connect to 2-4 nearby nodes
            const connectionCount = Math.floor(Math.random() * 3) + 2;
            for (let j = 0; j < connectionCount && generated.length > 0; j++) {
                const targetIndex = Math.floor(Math.random() * generated.length);
                if (!node.connections.includes(targetIndex)) {
                    node.connections.push(targetIndex);
                }
            }

            generated.push(node);
        }

        setNodes(generated);
    }, []);

    // Color schemes per variant
    const colorScheme = useMemo(() => {
        switch (variant) {
            case "users":
                return {
                    from: "from-blue-500/10",
                    via: "via-cyan-500/10",
                    to: "to-teal-500/10",
                    node: "bg-blue-400/30",
                    connection: "stroke-blue-400/20",
                    glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                };
            case "permissions":
                return {
                    from: "from-purple-500/10",
                    via: "via-pink-500/10",
                    to: "to-rose-500/10",
                    node: "bg-purple-400/30",
                    connection: "stroke-purple-400/20",
                    glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
                };
            case "roles":
                return {
                    from: "from-amber-500/10",
                    via: "via-orange-500/10",
                    to: "to-red-500/10",
                    node: "bg-amber-400/30",
                    connection: "stroke-amber-400/20",
                    glow: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
                };
            default:
                return {
                    from: "from-blue-500/10",
                    via: "via-cyan-500/10",
                    to: "to-teal-500/10",
                    node: "bg-blue-400/30",
                    connection: "stroke-blue-400/20",
                    glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                };
        }
    }, [variant]);

    // Track mouse position for interactive effects
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
            {/* Base dark background */}
            <div className="absolute inset-0 bg-[#09090b]" />

            {/* Animated gradient overlay */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${colorScheme.from} ${colorScheme.via} ${colorScheme.to}`}
                animate={{
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ backgroundSize: "400% 400%" }}
            />

            {/* SVG Network connections */}
            <svg
                className="absolute inset-0 w-full h-full"
                style={{ opacity: 0.4 }}
            >
                {nodes.map((node) =>
                    node.connections.map((targetId) => {
                        const target = nodes[targetId];
                        if (!target) return null;

                        return (
                            <motion.line
                                key={`${node.id}-${targetId}`}
                                x1={`${node.x}%`}
                                y1={`${node.y}%`}
                                x2={`${target.x}%`}
                                y2={`${target.y}%`}
                                className={colorScheme.connection}
                                strokeWidth="1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: [0, 1, 0],
                                    opacity: [0, 0.3, 0],
                                }}
                                transition={{
                                    duration: Math.random() * 10 + 8,
                                    repeat: Infinity,
                                    delay: Math.random() * 5,
                                    ease: "easeInOut",
                                }}
                            />
                        );
                    })
                )}
            </svg>

            {/* Network nodes */}
            {nodes.map((node) => (
                <motion.div
                    key={node.id}
                    className={`absolute rounded-full ${colorScheme.node} ${colorScheme.glow} backdrop-blur-sm`}
                    style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: `${node.size}px`,
                        height: `${node.size}px`,
                    }}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                        duration: Math.random() * 5 + 3,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Pulsating center node (larger) */}
            <motion.div
                className={`absolute rounded-full ${colorScheme.node} ${colorScheme.glow} backdrop-blur-md`}
                style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "12px",
                    height: "12px",
                }}
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Interactive radial gradient following mouse */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.06) 0%, transparent 40%)`,
                }}
                animate={{
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Grid overlay for tech feel */}
            <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: "80px 80px",
                }}
            />

            {/* Subtle noise texture */}
            <div
                className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                }}
            />

            {/* Vignette effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle at center, transparent 0%, rgba(9, 9, 11, 0.5) 100%)",
                }}
            />
        </div>
    );
}
