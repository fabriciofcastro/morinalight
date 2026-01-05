'use client';

import React from 'react';
import { Shield, Activity } from 'lucide-react';
import { SecurityMonitoring } from '@/components/security/security-monitoring';
import { LiveActivityFeed } from '@/components/security/live-activity-feed';
import { RiskScoreIndicator } from '@/components/security/risk-score-indicator';
import { AccessPatternChart } from '@/components/security/access-pattern-chart';
import { WorldMap } from '@/components/security/world-map';

export default function SecurityDashboardPage() {
    // Mock data para demonstração - em produção viria de hooks/API
    const accessData = [
        { time: '00:00', count: 45, anomalies: 2 },
        { time: '04:00', count: 12, anomalies: 0 },
        { time: '08:00', count: 89, anomalies: 5 },
        { time: '12:00', count: 156, anomalies: 12 },
        { time: '16:00', count: 180, anomalies: 8 },
        { time: '20:00', count: 95, anomalies: 4 },
        { time: '23:59', count: 50, anomalies: 1 },
    ];

    const countryData = [
        { id: 'BR', name: 'Brasil', accessCount: 1200, blockedCount: 5, isHighRisk: false },
        { id: 'US', name: 'EUA', accessCount: 800, blockedCount: 12, isHighRisk: false },
        { id: 'CN', name: 'China', accessCount: 450, blockedCount: 380, isHighRisk: true },
        { id: 'DE', name: 'Alemanha', accessCount: 300, blockedCount: 2, isHighRisk: false },
        { id: 'RU', name: 'Rússia', accessCount: 200, blockedCount: 180, isHighRisk: true },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#04070d] p-4 md:p-8 space-y-8 pb-12">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        Command Center
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                        Enterprise Security & Threat Monitoring Infrastructure
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">System Pulse: Stable</span>
                    </div>
                </div>
            </div>

            {/* Hero Grid: Risk + Map + Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Global Health Gauge */}
                <div className="lg:col-span-3">
                    <div className="h-full bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-8">
                        <RiskScoreIndicator score={14} label="Global Risk Score" size="lg" />
                        <div className="w-full grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Active Threats</p>
                                <p className="text-lg font-black text-red-500">0</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Trust Level</p>
                                <p className="text-lg font-black text-green-500">98%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: Interactive World Map */}
                <div className="lg:col-span-6">
                    <WorldMap data={countryData} />
                </div>

                {/* Right: Real-time Stats */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-xl shadow-blue-600/10 text-white relative overflow-hidden group">
                        <Activity className="absolute bottom-[-10px] right-[-10px] w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Global Sessions</p>
                        <h3 className="text-4xl font-black mt-2">1,284</h3>
                        <p className="text-xs mt-4 flex items-center gap-1">
                            <span className="text-green-300 font-bold">+12%</span> vs last hour
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                        <AccessPatternChart data={accessData} height={180} />
                    </div>
                </div>
            </div>

            {/* Monitoring & Feed Section */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3">
                    <SecurityMonitoring />
                </div>

                <div className="xl:col-span-1">
                    <LiveActivityFeed orgId="current-org" />
                </div>
            </div>
        </div>
    );
}
