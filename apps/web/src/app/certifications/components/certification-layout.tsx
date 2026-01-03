"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, CheckCircle2, FileText, Lock } from "lucide-react";
import { cn } from "@morina/ui";

interface CertificationLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    icon?: React.ReactNode;
    activeTab?: "iso27001" | "soc2" | "pci-dss";
    background?: React.ReactNode;
}

export function CertificationLayout({
    children,
    title,
    subtitle,
    icon,
    activeTab,
    background,
}: CertificationLayoutProps) {
    const tabs = [
        {
            id: "iso27001",
            label: "ISO 27001",
            href: "/certifications/iso27001",
            icon: <Shield className="w-4 h-4" />,
        },
        {
            id: "soc2",
            label: "SOC 2 Type II",
            href: "/certifications/soc2",
            icon: <FileText className="w-4 h-4" />,
        },
        {
            id: "pci-dss",
            label: "PCI DSS",
            href: "/certifications/pci-dss",
            icon: <Lock className="w-4 h-4" />,
        },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30">
            {/* Background Ambience */}
            {background ? (
                <div className="fixed inset-0 z-0 overflow-hidden">
                    {background}
                </div>
            ) : (
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
                </div>
            )}

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
                {/* Navigation */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                    <Link
                        href="/"
                        className="group flex items-center text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Back to Home
                    </Link>

                    <div className="flex items-center p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    activeTab === tab.id
                                        ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center md:text-left"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/20 mb-6 backdrop-blur-xl shadow-2xl shadow-orange-900/10">
                        {icon || <Shield className="w-8 h-8 text-orange-500" />}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent mb-4 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {children}
                </motion.div>

                {/* Footer info */}
                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Audited by independent third-party firms</span>
                    </div>
                    <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
        </div>
    );
}
