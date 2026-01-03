"use client";

import { CertificationLayout } from "../components/certification-layout";
import { Lock, CreditCard, Shield, Search, LockKeyhole, ServerCog, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function PCIDSSPage() {
    return (
        <CertificationLayout
            title="PCI DSS Level 1"
            subtitle="Certified as a Level 1 Service Provider, maintaining the highest standards for secure payments."
            activeTab="pci-dss"
            icon={<Lock className="w-8 h-8 text-red-500" />}
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-2xl p-8 backdrop-blur-md">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-red-500/20 rounded-xl">
                                <CreditCard className="w-10 h-10 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Level 1 Service Provider</h2>
                                <p className="text-red-200/70 text-lg leading-relaxed">
                                    MorinaLight processes over 6 million transactions annually, qualifying us as a Level 1 provider.
                                    We undergo rigorous annual onsite audits by an independent Qualified Security Assessor (QSA).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { title: "Tokenization", desc: "Raw card data never touches our servers. We use secure tokens for all processing.", icon: <LockKeyhole className="w-6 h-6 text-yellow-500" /> },
                            { title: "Network Segmentation", desc: "Cardholder data environments (CDE) are completely isolated from corporate networks.", icon: <ServerCog className="w-6 h-6 text-cyan-500" /> },
                            { title: "Vulnerability Scans", desc: "Quarterly external scans by an Approved Scanning Vendor (ASV).", icon: <Search className="w-6 h-6 text-purple-500" /> },
                            { title: "Web App Firewall", desc: "Advanced WAF rules protect against SQLi, XSS, and other OWASP Top 10 threats.", icon: <Shield className="w-6 h-6 text-green-500" /> },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-colors"
                            >
                                <div className="mb-4">{item.icon}</div>
                                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Visual Encryption Flow */}
                <div className="lg:col-span-4">
                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-6 h-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
                        <h3 className="text-lg font-semibold text-white mb-6 relative z-10">Secure Data Flow</h3>

                        <div className="relative z-10 space-y-8 pl-4 border-l-2 border-dashed border-gray-800 ml-4 py-4">
                            <div className="relative">
                                <div className="absolute -left-[25px] top-2 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-black flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                    <span className="text-xs text-blue-400 font-mono uppercase">User Browser</span>
                                    <p className="text-sm text-white mt-1">Direct Post to Vault</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[25px] top-2 w-4 h-4 rounded-full bg-yellow-500 ring-4 ring-black flex items-center justify-center">
                                    <Lock className="w-2 h-2 text-black" />
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                                    <span className="text-xs text-yellow-400 font-mono uppercase">Encryption</span>
                                    <p className="text-sm text-white mt-1">TLS 1.3 / AES-256</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[25px] top-2 w-4 h-4 rounded-full bg-green-500 ring-4 ring-black flex items-center justify-center">
                                    <CheckCircle2 className="w-2 h-2 text-black" />
                                </div>
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                                    <span className="text-xs text-green-400 font-mono uppercase">Safe Vault</span>
                                    <p className="text-sm text-white mt-1">Token Generated</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                            <p className="text-xs text-gray-400 mb-2">Validated on</p>
                            <p className="text-lg font-bold text-white font-mono">Jan 20, 2024</p>
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                                <Shield className="w-3 h-3" />
                                PCI Compliant
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CertificationLayout>
    );
}
