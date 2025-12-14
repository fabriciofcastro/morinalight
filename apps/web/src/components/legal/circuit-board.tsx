"use client";

import { motion } from "framer-motion";

export function CircuitBoard() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-15">
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${((i * 37) % 100).toFixed(2)}%`,
                        top: `${((i * 61) % 100).toFixed(2)}%`,
                    }}
                >
                    <motion.div
                        className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: ((i * 0.17) % 2),
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 w-20 h-px bg-gradient-to-r from-[hsl(var(--primary))] to-transparent"
                        style={{ transformOrigin: "left center" }}
                        animate={{
                            scaleX: [0, 1, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: ((i * 0.29) % 2),
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
}
