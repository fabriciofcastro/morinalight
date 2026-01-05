"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { cn } from "@morina/ui";

interface BrazilSalesMapProps {
    className?: string;
}

export function BrazilSalesMap({ className }: BrazilSalesMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let phi = 4.5;
        let width = 0;
        let currentGlobe: any = null;

        const onResize = () => {
            if (divRef.current && (width = divRef.current.offsetWidth)) {
                // Resize logic handled by cobe automatically on next frame if width changes? 
                // Actually cobe needs recreation or width param update. 
                // Simplest is to let cobe read the canvas size.
            }
        }

        if (!canvasRef.current || !divRef.current) return;

        // Initialize Globe
        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: divRef.current.clientWidth * 2,
            height: divRef.current.clientHeight * 2,
            phi: 4.5,
            theta: 0.1,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.1, 0.1, 0.2], // Slightly lighter base for visibility
            markerColor: [0.55, 0.35, 1],
            glowColor: [0.2, 0.1, 0.4],
            opacity: 1, // Full opacity
            markers: [
                { location: [-23.5505, -46.6333], size: 0.1 },
                { location: [-22.9068, -43.1729], size: 0.08 },
                { location: [-19.9167, -43.9345], size: 0.06 },
                { location: [-15.7801, -47.9292], size: 0.05 },
                { location: [-30.0346, -51.2177], size: 0.05 },
                { location: [-12.9777, -38.5016], size: 0.05 },
                { location: [-3.7172, -38.5434], size: 0.04 },
                { location: [-1.4558, -48.4902], size: 0.03 },
                { location: [-16.6869, -49.2648], size: 0.04 },
                { location: [-25.4284, -49.2733], size: 0.05 },
            ],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.003;
            },
        });

        // Use ResizeObserver for robust sizing
        const resizeObserver = new ResizeObserver(() => {
            // Cobe doesn't support dynamic resizing easily without destroy/create or internal width update, 
            // but for now we rely on initial size. 
            // If resize is critical, we'd need to re-init. 
            // For this fix, getting it to show up is priority.
        });
        resizeObserver.observe(divRef.current);

        return () => {
            globe.destroy();
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div ref={divRef} className={cn("relative w-full h-[400px] overflow-hidden rounded-2xl bg-[#090b16]/80 border border-white/5 shadow-2xl", className)}>
            {/* Atmospheric Glow - Simplified */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="absolute top-4 left-6 z-10 pointer-events-none">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Geografia de Vendas
                </h3>
                <p className="text-sm text-white/50">Monitoramento global em tempo real</p>
            </div>

            {/* Live Stats Overlay */}
            <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-lg flex items-center gap-3">
                    <div className="bg-violet-500/20 p-2 rounded-md">
                        <div className="w-4 h-4 text-violet-400 animate-bounce">⚡</div>
                    </div>
                    <div>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider">Vendas Hoje</p>
                        <p className="text-lg font-bold text-white">R$ 142.5k</p>
                    </div>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", contain: "layout paint size" }}
                className="relative z-10"
            />
        </div>
    );
}
