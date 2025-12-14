"use client";

import { motion } from "framer-motion";

export function DataStream() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-15">
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-full w-0.5"
                    style={{
                        left: `${(i / 10) * 100}%`,
                        background: "linear-gradient(to bottom, transparent, hsl(var(--primary)), transparent)",
                    }}
                    animate={{
                        y: ["-100%", "100%"],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2 + ((i * 0.13) % 1),
                        repeat: Infinity,
                        delay: ((i * 0.21) % 2),
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
}
