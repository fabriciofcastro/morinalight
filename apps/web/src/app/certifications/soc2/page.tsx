"use client";

import { CertificationLayout } from "../components/certification-layout";
import { FileText, CheckCircle2, Activity, Eye, ShieldCheck, Database, Clock } from "lucide-react";
import { motion } from "framer-motion";

const principles = [
    {
        id: "security",
        title: "Security",
        description: "System is protected against unauthorized access.",
        icon: <ShieldCheck className="w-6 h-6" />,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
    },
    {
        id: "availability",
        title: "Availability",
        description: "System is available for operation and use as committed or agreed.",
        icon: <Clock className="w-6 h-6" />,
        color: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
    },
    {
        id: "confidentiality",
        title: "Confidentiality",
        description: "Information designated as confidential is protected.",
        icon: <Eye className="w-6 h-6" />,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
    },
    {
        id: "integrity",
        title: "Processing Integrity",
        description: "System processing is complete, valid, accurate, timely, and authorized.",
        icon: <Database className="w-6 h-6" />,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
    },
];

const auditEvents = [
    { date: "Oct 2023", event: "Penetration Testing (Annual)", status: "Passed" },
    { date: "Nov 2023", event: "Internal Security Audit", status: "Completed" },
    { date: "Dec 2023", event: "SOC 2 Type II Observation Period End", status: "Completed" },
    { date: "Jan 2024", event: "Final Report Issuance", status: "Received" },
];

export default function SOC2Page() {
    return (
        <CertificationLayout
            title="SOC 2 Type II"
            subtitle="Audited by AICPA-accredited firms to ensure our controls are designed and operating effectively over time."
            activeTab="soc2"
            icon={<FileText className="w-8 h-8 text-blue-500" />}
        >
            <div className="space-y-12">
                {/* Principles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {principles.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-6 rounded-2xl border ${p.border} ${p.bg} backdrop-blur-sm`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center mb-4 ${p.color}`}>
                                {p.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                            <p className="text-sm text-gray-300/80 leading-relaxed">{p.description}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Real-time Status */}
                    <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                                <Activity className="w-5 h-5 text-green-500" />
                                Live Monitoring Status
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-mono text-green-500">OPERATIONAL</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Uptime (Last 90 days)</span>
                                    <span className="text-white font-mono">99.99%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[99.99%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Incident Response Time</span>
                                    <span className="text-white font-mono">&lt; 15 min</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[95%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Backup Integrity</span>
                                    <span className="text-white font-mono">100% (Verified)</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audit Timeline */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        <h3 className="text-lg font-semibold text-white mb-6">Audit Timeline</h3>
                        <div className="relative border-l border-white/10 ml-3 space-y-8">
                            {auditEvents.map((evt, i) => (
                                <div key={i} className="relative pl-8">
                                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-black" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-mono text-blue-400 mb-1">{evt.date}</span>
                                        <span className="text-sm font-medium text-white">{evt.event}</span>
                                        <span className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {evt.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </CertificationLayout>
    );
}
