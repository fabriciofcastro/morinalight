'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const HolographicGrid = () => {
    return (
        <div className="absolute inset-0 perspective-[1000px] pointer-events-none opacity-20">
            <motion.div
                initial={{ rotateX: 60, y: -200 }}
                animate={{
                    backgroundPosition: ["0px 0px", "0px 100px"]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute inset-0 w-full h-[200%] bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] bg-[size:50px_50px]"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
                }}
            />
        </div>
    );
};
