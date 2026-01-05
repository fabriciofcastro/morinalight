'use client';

import React, { useState } from 'react';
import { ShieldCheck, Clock, Globe, ShieldAlert, Settings } from 'lucide-react';
import { TimeWindowManager } from '@/components/security/time-window-manager';
import { GeoRestrictionManager } from '@/components/security/geo-restriction-manager';
import { motion } from 'framer-motion';

export default function PermissionsManagementPage() {
    const [activeTab, setActiveTab] = useState<'tbac' | 'geo' | 'policies'>('tbac');

    const tabs = [
        { id: 'tbac', label: 'Controle Temporal (TBAC)', icon: Clock, description: 'Gerencie janelas de acesso e horários permitidos por usuário ou role.' },
        { id: 'geo', label: 'Controle Geográfico', icon: Globe, description: 'Defina restrições de país, IP e proteção contra VPN/Proxy/Tor.' },
        { id: 'policies', label: 'Políticas Adicionais', icon: ShieldAlert, description: 'Configure limites de taxa, força de autenticação e outras regras.' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#04070d] p-4 md:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    Gestão de Permissões Críticas
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase text-xs tracking-widest">
                    Advanced Authorization Engine v2.0
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${isActive
                                ? 'bg-white dark:bg-gray-900 border-indigo-500 shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                                : 'bg-white/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                }`}
                        >
                            <div className={`p-3 rounded-xl w-fit mb-4 transition-colors ${isActive ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                }`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className={`font-bold transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                {tab.label}
                            </h3>
                            <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                {tab.description}
                            </p>

                            {isActive && (
                                <motion.div
                                    layoutId="tab-highlight"
                                    className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="transition-all duration-500">
                {activeTab === 'tbac' && (
                    <div className="bg-white dark:bg-gray-950/20 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-3xl p-6 animate-in fade-in slide-in-from-bottom-4">
                        <TimeWindowManager />
                    </div>
                )}

                {activeTab === 'geo' && (
                    <div className="bg-white dark:bg-gray-950/20 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-3xl p-6 animate-in fade-in slide-in-from-bottom-4">
                        <GeoRestrictionManager />
                    </div>
                )}

                {activeTab === 'policies' && (
                    <div className="bg-white dark:bg-gray-950/20 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                            <Settings className="w-10 h-10 text-yellow-500 animate-spin-slow" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Módulo em Desenvolvimento</h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            As políticas granulares de PBAC e ABAC estão sendo integradas.
                            Em breve, você poderá configurar regras baseadas em atributos complexos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
