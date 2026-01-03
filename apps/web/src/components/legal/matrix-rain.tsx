"use client";

import { motion } from "framer-motion";

export function MatrixRain() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-20">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-px bg-gradient-to-b from-transparent via-[hsl(var(--primary))] to-transparent"
                    style={{
                        left: `${(i / 20) * 100}%`,
                        height: "100%",
                    }}
                    animate={{
                        y: ["-100%", "200%"],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 3 + ((i * 0.17) % 2),
                        repeat: Infinity,
                        delay: ((i * 0.23) % 2),
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
}
