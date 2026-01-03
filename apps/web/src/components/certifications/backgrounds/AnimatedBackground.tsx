'use client';

import React from 'react';
import { GradientMesh } from './GradientMesh';
import { ParticleSystem } from './ParticleSystem';
import { AuroraEffect } from './AuroraEffect';
import { HolographicGrid } from './HolographicGrid';

export const AnimatedBackground = ({ children }: { children?: React.ReactNode }) => {
    return (
        <div className="relative w-full min-h-screen bg-[#0a0a0a] overflow-hidden">
            <GradientMesh />
            <ParticleSystem />
            <AuroraEffect />
            <HolographicGrid />

            {/* Overlay Gradient to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] opacity-80 pointer-events-none" />

            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    );
};
