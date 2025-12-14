"use client";

import { motion } from "framer-motion";

export function ParticleField() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-[hsl(var(--primary))]"
                    style={{
                        left: `${((i * 37) % 100).toFixed(2)}%`,
                        top: `${((i * 61) % 100).toFixed(2)}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, ((i * 0.19) % 1) * 20 - 10, 0],
                        opacity: [0.2, 0.8, 0.2],
                        scale: [0.5, 1.5, 0.5],
                    }}
                    transition={{
                        duration: 3 + ((i * 0.17) % 2),
                        repeat: Infinity,
                        delay: ((i * 0.23) % 2),
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
