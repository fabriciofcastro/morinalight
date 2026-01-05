'use client';

import React, { useState } from 'react';
import { History, ShieldEllipsis, FileBarChart, Search, Filter, Download } from 'lucide-react';
import { AuditDashboard } from '@/components/security/audit-dashboard';
import { ComplianceReportViewer } from '@/components/security/compliance-report-viewer';

export default function AuditCenterPage() {
    const [view, setView] = useState<'logs' | 'reports'>('logs');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#04070d] p-4 md:p-8 space-y-8">
            {/* Header section with Glassmorphism */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 px-8 py-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-xl">
                                <History className="w-6 h-6 text-white" />
                            </div>
                            Audit Intelligence
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                            Complete traceability and compliance governance center.
                        </p>
                    </div>

                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setView('logs')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'logs'
                                ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-lg'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <ShieldEllipsis className="w-4 h-4" />
                            Activity Logs
                        </button>
                        <button
                            onClick={() => setView('reports')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'reports'
                                ? 'bg-white dark:bg-gray-900 text-purple-600 shadow-lg'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <FileBarChart className="w-4 h-4" />
                            Compliance
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="animate-in fade-in duration-500">
                {view === 'logs' ? (
                    <div className="space-y-6">
                        {/* Rapid search bar styling */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Universal search through all audit logs (User ID, IP, Action...)"
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <button className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                                <Filter className="w-4 h-4" />
                                Advanced Filters
                            </button>
                        </div>

                        <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-3xl p-2">
                            <AuditDashboard orgId="current-org" />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto py-8">
                        <ComplianceReportViewer orgId="current-org" />
                    </div>
                )}
            </div>

            {/* Bottom Sticky Export (Optional UI touch) */}
            <div className="fixed bottom-8 right-8 z-40">
                <button className="p-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-2xl flex items-center gap-3 hover:scale-110 active:scale-95 transition-all group">
                    <Download className="w-5 h-5" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">
                        Export Center
                    </span>
                </button>
            </div>
        </div>
    );
}
