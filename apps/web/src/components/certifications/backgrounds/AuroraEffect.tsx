'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const AuroraEffect = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                    d="M-10,50 Q25,30 50,50 T110,50"
                    fill="none"
                    stroke="url(#aurora-gradient)"
                    strokeWidth="40"
                    animate={{
                        d: [
                            "M-10,50 Q25,30 50,50 T110,50",
                            "M-10,40 Q25,60 50,40 T110,40",
                            "M-10,50 Q25,30 50,50 T110,50"
                        ]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <defs>
                    <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                        <stop offset="50%" stopColor="rgba(59, 130, 246, 0.2)" />
                        <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 backdrop-blur-[100px]" />
        </div>
    );
};
