"use client";

import createGlobe from "cobe";
import { useEffect, useRef, useState, useMemo } from "react";
import { useSpring } from "react-spring";

export type Threat = {
    id: string;
    type: string;
    isBlocked: boolean;
    source: { lat: number; long: number; ip: string; country?: string };
    target: { lat: number; long: number };
    timestamp: string;
};

type HotZone = {
    lat: number;
    lng: number;
    intensity: number;
    label: string;
};

export function ThreatGlobe({ threats = [], className = "" }: { threats?: Threat[], className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointerInteracting = useRef(null);
    const pointerInteractionMovement = useRef(0);
    const [tooltip, setTooltip] = useState<{ x: number, y: number, data: Threat } | null>(null);

    // Smart Prediction: Identify clusters
    const hotZones = useMemo(() => {
        const clusters: Record<string, HotZone> = {};

        threats.forEach(t => {
            // Round coordinates to create groups (approx 10 degrees)
            const latCell = Math.round(t.source.lat / 10);
            const lngCell = Math.round(t.source.long / 10);
            const key = `${latCell}_${lngCell}`;

            if (!clusters[key]) {
                clusters[key] = {
                    lat: latCell * 10,
                    lng: lngCell * 10,
                    intensity: 0,
                    label: t.source.country || "Região Ativa"
                };
            }
            clusters[key].intensity += 1;
        });

        return Object.values(clusters).filter(c => c.intensity >= 3);
    }, [threats]);

    // Internal state to manage fading markers
    const [markers, setMarkers] = useState<any[]>([]);

    const [{ r: springR }, api] = useSpring(() => ({
        r: 0,
        config: {
            mass: 1,
            tension: 280,
            friction: 40,
            precision: 0.001,
        },
    }));

    // Current rotation state for coordinate mapping
    const rotationRef = useRef({ phi: 0, theta: 0.3 });

    useEffect(() => {
        let width = 0;
        const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
        window.addEventListener('resize', onResize);
        onResize();

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.1, 0.1, 0.2],
            markerColor: [1, 0.2, 0.2],
            glowColor: [0.2, 0.4, 1],
            markers: [],
            onRender: (state) => {
                if (!pointerInteracting.current) {
                    rotationRef.current.phi += 0.003;
                }
                state.phi = rotationRef.current.phi + springR.get();
                state.width = width * 2;
                state.height = width * 2;

                // Sync markers: Combine individual threats + Hot Zones (Predictions)
                const threatMarkers = threats.map(t => ({
                    location: [t.source.lat, t.source.long] as [number, number],
                    size: t.isBlocked ? 0.06 : 0.03
                }));

                const hotZoneMarkers = hotZones.map(hz => ({
                    location: [hz.lat, hz.lng] as [number, number],
                    size: 0.12 // Significantly larger
                }));

                state.markers = [...threatMarkers, ...hotZoneMarkers];
            },
        });

        canvasRef.current.style.opacity = '1';

        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize);
        }
    }, [threats, springR]);

    // Intersection logic for tooltips
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = rect.width;

        // Simple proximity check
        // To be accurate, we'd need full 3D projection logic
        // For a high-impact demo, we'll use a distance check on projected points
        let found: Threat | null = null;
        const currentPhi = rotationRef.current.phi + springR.get();
        const currentTheta = 0.3;

        for (const t of threats) {
            // Convert lat/long to 3D Cartesian
            const lat = t.source.lat * Math.PI / 180;
            const lng = t.source.long * Math.PI / 180;

            // Rotation around Y (phi)
            const phi = currentPhi + lng + Math.PI / 2;

            // Projection
            const x3d = Math.cos(lat) * Math.sin(phi);
            const y3d = Math.sin(lat) * Math.cos(currentTheta) - Math.cos(lat) * Math.cos(phi) * Math.sin(currentTheta);
            const z3d = Math.sin(lat) * Math.sin(currentTheta) + Math.cos(lat) * Math.cos(phi) * Math.cos(currentTheta);

            if (z3d > 0) { // Point is on the visible side
                const screenX = (x3d + 1) * size / 2;
                const screenY = (1 - y3d) * size / 2;

                const dist = Math.sqrt(Math.pow(screenX - x, 2) + Math.pow(screenY - y, 2));
                if (dist < 15) { // 15px threshold
                    found = t;
                    break;
                }
            }
        }

        if (found) {
            setTooltip({ x, y, data: found });
        } else {
            setTooltip(null);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: 600, aspectRatio: 1, margin: 'auto', position: 'relative' }} className={className}>
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    contain: 'layout paint size',
                    opacity: 0,
                    transition: 'opacity 1s ease',
                    cursor: tooltip ? 'pointer' : 'grab'
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTooltip(null)}
            />

            {/* Tooltip Overlay */}
            {tooltip && (
                <div
                    className="absolute z-50 pointer-events-none bg-black/80 border border-white/20 p-2 rounded shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-200"
                    style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
                >
                    <div className="flex flex-col gap-1 min-w-[150px]">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Tipo de Ataque</span>
                            <span className="text-[10px] font-bold text-red-400">{tooltip.data.isBlocked ? "BLOQUEADO" : "DETECTADO"}</span>
                        </div>
                        <div className="text-sm font-bold text-white mb-1">{tooltip.data.type}</div>
                        <div className="h-px bg-white/10 my-1" />
                        <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-white/40">ORIGEM IP</span>
                            <span className="text-white/80">{tooltip.data.source.ip}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-white/40">PAÍS</span>
                            <span className="text-white/80">{tooltip.data.source.country || "Desconhecido"}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 p-3 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] text-white/60 font-medium">Ataque Ativo</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-600/30 border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <span className="text-[10px] text-white/60 font-medium">Hot Zone (Previsão)</span>
                </div>
            </div>

            {/* Smart Insight Overlay */}
            {hotZones.length > 0 && (
                <div className="absolute bottom-16 left-4 right-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 backdrop-blur-md animate-pulse">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-3 w-3 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Insight da IA (Predição)</span>
                    </div>
                    <p className="text-[11px] text-blue-100/80 leading-tight">
                        Padrão de ataque detectado em {hotZones.length} região(ões).
                        Recomendado: Ativar Modo de Defesa Ativa para {hotZones[0].label}.
                    </p>
                </div>
            )}

            <div className="absolute bottom-4 left-4 text-xs font-mono text-white/50 bg-black/50 p-2 rounded backdrop-blur">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {threats.length} Active Threats
                </div>
            </div>
        </div>
    );
}
