"use client";

import { motion } from "framer-motion";

export function PulsingGrid() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute inset-0" style={{
                backgroundImage: `
          linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
        `,
                backgroundSize: "50px 50px",
            }}>
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3), transparent 70%)",
                    }}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>
        </div>
    );
}
