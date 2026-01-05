'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountryData {
    id: string;
    name: string;
    accessCount: number;
    blockedCount: number;
    isHighRisk: boolean;
}

interface WorldMapProps {
    data: CountryData[];
    onCountryClick?: (id: string) => void;
}

/**
 * WorldMap Component
 * Um mapa SVG simplificado e estilizado para visualização de segurança global
 */
export function WorldMap({ data, onCountryClick }: WorldMapProps) {
    const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);

    // Coordenadas simplificadas para alguns países chave (apenas para efeito visual)
    // Em uma aplicação real, usaríamos um GeoJSON completo
    const highlights = [
        { id: 'BR', name: 'Brasil', x: 280, y: 350, r: 8 },
        { id: 'US', name: 'EUA', x: 180, y: 180, r: 10 },
        { id: 'CN', name: 'China', x: 740, y: 220, r: 12 },
        { id: 'RU', name: 'Rússia', x: 650, y: 120, r: 14 },
        { id: 'DE', name: 'Alemanha', x: 490, y: 160, r: 6 },
        { id: 'GB', name: 'Reino Unido', x: 465, y: 155, r: 5 },
        { id: 'IN', name: 'Índia', x: 680, y: 300, r: 9 },
        { id: 'AU', name: 'Austrália', x: 820, y: 450, r: 11 },
    ];

    const getCountryColor = (countryId: string) => {
        const item = data.find(d => d.id === countryId);
        if (!item) return 'fill-gray-300 dark:fill-gray-800';
        if (item.isHighRisk) return 'fill-red-500 animate-pulse';
        if (item.blockedCount > 0) return 'fill-orange-500';
        return 'fill-blue-500';
    };

    return (
        <div className="relative w-full aspect-[2/1] bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800 shadow-2xl overflow-hidden group">
            <div className="absolute top-4 left-6 z-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Global Traffic Monitor
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                </h2>
                <p className="text-xs text-gray-500 font-medium">Real-time geo-analysis</p>
            </div>

            <svg
                viewBox="0 0 1000 600"
                className="w-full h-full p-4 pointer-events-none"
                style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.1))' }}
            >
                {/* Simplified World Outlines (Abstracted) */}
                <g opacity="0.4">
                    {/* Americas */}
                    <path d="M150,120 Q120,200 150,300 Q180,400 250,550 Q350,500 320,380 Q280,300 300,180 Z" className="fill-gray-200 dark:fill-gray-800" />
                    {/* Eurasia + Africa */}
                    <path d="M450,120 Q380,250 480,450 Q550,550 650,450 Q750,350 850,250 Q900,100 700,50 Q550,50 450,120" className="fill-gray-200 dark:fill-gray-800" />
                </g>

                {/* Dynamic Country Points */}
                {highlights.map((country) => {
                    const stats = data.find(d => d.id === country.id);
                    const isActive = !!stats;

                    return (
                        <motion.g
                            key={country.id}
                            initial={false}
                            className="cursor-pointer pointer-events-auto"
                            onMouseEnter={() => stats && setHoveredCountry(stats)}
                            onMouseLeave={() => setHoveredCountry(null)}
                            onClick={() => onCountryClick?.(country.id)}
                        >
                            <motion.circle
                                cx={country.x}
                                cy={country.y}
                                r={country.r}
                                className={getCountryColor(country.id)}
                                whileHover={{ scale: 1.5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            />
                            {isActive && (
                                <circle
                                    cx={country.x}
                                    cy={country.y}
                                    r={country.r + 10}
                                    className="stroke-blue-400/30 fill-none animate-ping"
                                    style={{ animationDuration: '3s' }}
                                />
                            )}
                        </motion.g>
                    );
                })}

                {/* Interactive Connections (Simplified lines) */}
                <motion.path
                    d="M280,350 L180,180"
                    className="stroke-blue-400/20 fill-none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
                <motion.path
                    d="M280,350 L490,160"
                    className="stroke-blue-400/20 fill-none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                />
            </svg>

            {/* Tooltip Overlay */}
            <AnimatePresence>
                {hoveredCountry && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-8 right-8 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-4 rounded-xl shadow-2xl min-w-[200px] z-50"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{hoveredCountry.name}</span>
                            <span className={`w-2 h-2 rounded-full ${hoveredCountry.isHighRisk ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                                <span>Total Traffic</span>
                                <span className="text-gray-900 dark:text-gray-300">{hoveredCountry.accessCount}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                    className="bg-blue-500 h-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '70%' }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                                <span>Blocked</span>
                                <span className="text-orange-500">{hoveredCountry.blockedCount}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                    className="bg-orange-500 h-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(hoveredCountry.blockedCount / hoveredCountry.accessCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Legend */}
            <div className="absolute bottom-4 left-6 flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Safe</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase">High Risk</span>
                </div>
            </div>
        </div>
    );
}
