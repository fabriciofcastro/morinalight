"use client";

import { motion } from "framer-motion";

export function HexagonGrid() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse">
                        <motion.path
                            d="M25 0 L50 14.4 L50 28.9 L25 43.4 L0 28.9 L0 14.4 Z"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="0.5"
                            animate={{
                                opacity: [0.3, 0.8, 0.3],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexagons)" />
            </svg>
        </div>
    );
}
