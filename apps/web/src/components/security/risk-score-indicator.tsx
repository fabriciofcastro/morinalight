'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RiskScoreIndicatorProps {
    score: number;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function RiskScoreIndicator({ score, label = 'Risk Score', size = 'md' }: RiskScoreIndicatorProps) {
    const getScoreColor = (s: number) => {
        if (s < 30) return '#10b981'; // Green
        if (s < 70) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const getSocreGlow = (s: number) => {
        if (s < 30) return 'shadow-[0_0_20px_rgba(16,185,129,0.3)]';
        if (s < 70) return 'shadow-[0_0_20px_rgba(245,158,11,0.3)]';
        return 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
    };

    const radius = size === 'sm' ? 30 : size === 'md' ? 50 : 80;
    const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 12;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const sizeClasses = {
        sm: 'w-24 h-24',
        md: 'w-40 h-40',
        lg: 'w-64 h-64',
    };

    const fontSizeClasses = {
        sm: 'text-xl',
        md: 'text-3xl',
        lg: 'text-5xl',
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
                {/* Background Circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-gray-200 dark:text-gray-800"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        fill="transparent"
                        stroke={getScoreColor(score)}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Glossy Overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-white/0 pointer-events-none" />

                {/* Score Text */}
                <div className="text-center z-10">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`font-bold text-gray-900 dark:text-white ${fontSizeClasses[size]}`}
                    >
                        {Math.round(score)}
                    </motion.span>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        / 100
                    </p>
                </div>

                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-full ${getSocreGlow(score)} -z-10`} />
            </div>

            {label && (
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                </span>
            )}
        </div>
    );
}
