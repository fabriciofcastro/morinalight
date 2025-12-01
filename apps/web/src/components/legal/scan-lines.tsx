"use client";

import { motion } from "framer-motion";

export function ScanLines() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-10">
            <motion.div
                className="absolute w-full h-full"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary)) 2px, hsl(var(--primary)) 4px)",
                }}
                animate={{
                    y: ["0%", "100%"],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
}
