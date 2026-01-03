"use client";

import { motion } from "framer-motion";

export function WavePattern() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-20">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-full h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent"
                    style={{
                        top: `${20 + i * 20}%`,
                    }}
                    animate={{
                        x: ["-100%", "100%"],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 5 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
