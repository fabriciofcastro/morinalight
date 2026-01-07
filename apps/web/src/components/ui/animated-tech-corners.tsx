"use client";

import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedTechCornersProps {
    variant?: "primary" | "accent" | "gradient";
    animate?: boolean;
}

export function AnimatedTechCorners({
    variant = "primary",
    animate = true
}: AnimatedTechCornersProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const cornerVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { duration: 1.5, ease: "easeInOut" },
                opacity: { duration: 0.5 },
            },
        },
    };

    const glowVariants: Variants = {
        glow: {
            filter: [
                "drop-shadow(0 0 2px hsl(var(--primary)/0.5))",
                "drop-shadow(0 0 8px hsl(var(--primary)/0.8))",
                "drop-shadow(0 0 2px hsl(var(--primary)/0.5))",
            ],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    const getStrokeColor = () => {
        switch (variant) {
            case "accent":
                return "hsl(var(--accent)/0.6)";
            case "gradient":
                return "url(#corner-gradient)";
            default:
                return "hsl(var(--primary)/0.6)";
        }
    };

    return (
        <>
            {/* SVG Definitions */}
            <svg width="0" height="0" className="absolute">
                <defs>
                    <linearGradient id="corner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Top Left */}
            <motion.svg
                className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
                initial="hidden"
                animate={isVisible && animate ? ["visible", "glow"] : "visible"}
                variants={glowVariants}
            >
                <motion.path
                    d="M 0 8 L 0 0 L 8 0"
                    stroke={getStrokeColor()}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={cornerVariants}
                />
                {/* Inner glow line */}
                <motion.path
                    d="M 0 8 L 0 0 L 8 0"
                    stroke={variant === "gradient" ? "url(#corner-gradient)" : `hsl(var(--${variant})/0.3)`}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="blur(2px)"
                    variants={cornerVariants}
                />
            </motion.svg>

            {/* Top Right */}
            <motion.svg
                className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
                initial="hidden"
                animate={isVisible && animate ? ["visible", "glow"] : "visible"}
                variants={glowVariants}
                transition={{ delay: 0.1 }}
            >
                <motion.path
                    d="M 24 0 L 32 0 L 32 8"
                    stroke={getStrokeColor()}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={cornerVariants}
                />
                <motion.path
                    d="M 24 0 L 32 0 L 32 8"
                    stroke={variant === "gradient" ? "url(#corner-gradient)" : `hsl(var(--${variant})/0.3)`}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="blur(2px)"
                    variants={cornerVariants}
                />
            </motion.svg>

            {/* Bottom Left */}
            <motion.svg
                className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none"
                initial="hidden"
                animate={isVisible && animate ? ["visible", "glow"] : "visible"}
                variants={glowVariants}
                transition={{ delay: 0.2 }}
            >
                <motion.path
                    d="M 0 24 L 0 32 L 8 32"
                    stroke={getStrokeColor()}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={cornerVariants}
                />
                <motion.path
                    d="M 0 24 L 0 32 L 8 32"
                    stroke={variant === "gradient" ? "url(#corner-gradient)" : `hsl(var(--${variant})/0.3)`}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="blur(2px)"
                    variants={cornerVariants}
                />
            </motion.svg>

            {/* Bottom Right */}
            <motion.svg
                className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
                initial="hidden"
                animate={isVisible && animate ? ["visible", "glow"] : "visible"}
                variants={glowVariants}
                transition={{ delay: 0.3 }}
            >
                <motion.path
                    d="M 32 24 L 32 32 L 24 32"
                    stroke={getStrokeColor()}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={cornerVariants}
                />
                <motion.path
                    d="M 32 24 L 32 32 L 24 32"
                    stroke={variant === "gradient" ? "url(#corner-gradient)" : `hsl(var(--${variant})/0.3)`}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="blur(2px)"
                    variants={cornerVariants}
                />
            </motion.svg>

            {/* Corner dots (decorative) */}
            {animate && (
                <>
                    <motion.div
                        className="absolute top-0 left-0 w-2 h-2 rounded-full"
                        style={{
                            background: variant === "gradient"
                                ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
                                : `hsl(var(--${variant}))`,
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0,
                        }}
                    />
                    <motion.div
                        className="absolute top-0 right-0 w-2 h-2 rounded-full"
                        style={{
                            background: variant === "gradient"
                                ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
                                : `hsl(var(--${variant}))`,
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0.5,
                        }}
                    />
                    <motion.div
                        className="absolute bottom-0 left-0 w-2 h-2 rounded-full"
                        style={{
                            background: variant === "gradient"
                                ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
                                : `hsl(var(--${variant}))`,
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 1,
                        }}
                    />
                    <motion.div
                        className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
                        style={{
                            background: variant === "gradient"
                                ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
                                : `hsl(var(--${variant}))`,
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 1.5,
                        }}
                    />
                </>
            )}
        </>
    );
}
