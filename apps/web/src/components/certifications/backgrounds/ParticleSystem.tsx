'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const ParticleSystem = () => {
    const particles = Array.from({ length: 30 });

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%',
                        opacity: Math.random() * 0.5,
                        scale: Math.random() * 0.5 + 0.5,
                    }}
                    animate={{
                        y: [null, Math.random() * 100 + '%'],
                        x: [null, Math.random() * 100 + '%'],
                        opacity: [null, Math.random() * 0.5 + 0.2, Math.random() * 0.5],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full"
                    style={{
                        boxShadow: '0 0 10px 2px rgba(96, 165, 250, 0.3)',
                    }}
                />
            ))}
        </div>
    );
};
