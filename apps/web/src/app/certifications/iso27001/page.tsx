"use client";

import { CertificationLayout } from "../components/certification-layout";
import { Shield, Check, Lock, Server, FileCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@morina/ui";

const controls = [
    { id: "A.5", name: "Information Security Policies", status: "Compliant" },
    { id: "A.6", name: "Organization of Information Security", status: "Compliant" },
    { id: "A.7", name: "Human Resource Security", status: "Compliant" },
    { id: "A.8", name: "Asset Management", status: "Compliant" },
    { id: "A.9", name: "Access Control", status: "Compliant" },
    { id: "A.10", name: "Cryptography", status: "Compliant" },
    { id: "A.11", name: "Physical and Environmental Security", status: "Compliant" },
    { id: "A.12", name: "Operations Security", status: "Compliant" },
    { id: "A.13", name: "Communications Security", status: "Compliant" },
    { id: "A.14", name: "System Acquisition, Development and Maintenance", status: "Compliant" },
];

export default function ISO27001Page() {
    return (
        <CertificationLayout
            title="ISO/IEC 27001:2013"
            subtitle="The international standard for Information Security Management Systems (ISMS)."
            activeTab="iso27001"
            icon={<Shield className="w-8 h-8 text-orange-500" />}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <FileCheck className="w-6 h-6 text-orange-500" />
                            Controls Implementation
                        </h2>
                        <div className="space-y-4">
                            {controls.map((control, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={control.id}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-mono text-sm font-bold group-hover:bg-orange-500/20 transition-colors">
                                            {control.id}
                                        </div>
                                        <span className="font-medium text-gray-200">{control.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">
                                        <Check className="w-3 h-3" />
                                        {control.status}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                            <Lock className="w-8 h-8 text-blue-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Encryption Everywhere</h3>
                            <p className="text-gray-400 text-sm">
                                All data is encrypted in transit (TLS 1.2+) and at rest (AES-256), ensuring confidentiality across all layers.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                            <Server className="w-8 h-8 text-purple-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Physical Security</h3>
                            <p className="text-gray-400 text-sm">
                                Hosted in Tier IV data centers with biometric access controls, 24/7 surveillance, and redundancy.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold mb-6">Certification Status</h3>
                        <div className="relative w-48 h-48 mx-auto mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    className="stroke-gray-800"
                                    strokeWidth="12"
                                    fill="transparent"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    className="stroke-orange-500"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 88}
                                    strokeDashoffset={2 * Math.PI * 88 * (1 - 1)} // 100%
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-white">100%</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Compliant</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Certificate No.</span>
                                <span className="font-mono text-white">ISMS-749201</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Issued</span>
                                <span className="text-white">Jan 15, 2024</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Expires</span>
                                <span className="text-white">Jan 14, 2027</span>
                            </div>
                        </div>

                        <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 group">
                            <FileCheck className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                            Download Certificate
                        </button>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-orange-400 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Audit Scope
                        </h3>
                        <p className="text-sm text-orange-200/70 leading-relaxed">
                            The ISMS covers all MorinaLight SaaS operations, including software development, customer support, and data management services accessed via cloud interfaces.
                        </p>
                    </div>
                </div>
            </div>
        </CertificationLayout>
    );
}
