"use client";

import { motion } from "framer-motion";

export function SpaceshipAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Starship Path */}
            <motion.div
                className="absolute top-1/4 -left-32 w-24 h-12 z-10"
                initial={{ x: "-20vw", y: "0vh", scale: 0.5, opacity: 0 }}
                animate={{
                    x: ["-20vw", "120vw"],
                    y: ["0vh", "10vh"],
                    scale: [0.5, 1.2],
                    opacity: [0, 1, 1, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: "circIn"
                }}
            >
                {/* The Ship */}
                <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                    <path
                        d="M10 25 L80 10 L100 25 L80 40 L10 25 M80 10 L80 40 M25 25 L20 25"
                        fill="#e2e8f0"
                        stroke="#3b82f6"
                        strokeWidth="2"
                    />
                    {/* Engine Glow */}
                    <circle cx="10" cy="25" r="4" fill="#60a5fa" className="animate-pulse" />
                </svg>

                {/* Engine Trail */}
                <motion.div
                    className="absolute top-1/2 right-[100%] h-[2px] w-64 bg-gradient-to-l from-blue-500 to-transparent transform -translate-y-1/2 origin-right"
                    animate={{ scaleX: [0.5, 1.5, 0.5], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                />
            </motion.div>
        </div>
    );
}
