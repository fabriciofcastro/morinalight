'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, FileText, Target, Calendar, Shield, FileCheck, AlertCircle, Check, Download } from 'lucide-react';
import { Certification } from './types';
import { notificationCenter } from '@/components/notifications/notification-center';

interface CertificationModalProps {
    certification: Certification | null;
    onClose: () => void;
}

export const CertificationModal: React.FC<CertificationModalProps> = ({ certification, onClose }) => {
    if (!certification) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-3xl shadow-2xl custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Image/Background */}
                    <div className="h-40 bg-gradient-to-r from-blue-900 to-slate-900 relative border-b border-white/10">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-repeat" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="absolute -bottom-8 left-8 flex items-end gap-6">
                            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 shadow-xl relative z-10">
                                <div className="text-4xl text-blue-400">
                                    <Shield className="w-10 h-10" />
                                </div>
                            </div>
                            <div className="pb-4">
                                <h2 className="text-3xl font-bold text-white mb-1">{certification.title}</h2>
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${certification.status === 'complete'
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                        }`}>
                                        {certification.status === 'complete' ? 'Certificado' : 'Em Preparação'}
                                    </div>
                                    <span className="text-gray-400 text-sm">{certification.category}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 pt-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <p className="text-gray-300 text-lg leading-relaxed">
                                        {certification.description}
                                    </p>
                                </div>

                                {/* Controls Implementation (Rich Content) */}
                                {certification.controls && (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                                            <FileCheck className="w-5 h-5 text-blue-400" />
                                            Controls Implementation
                                        </h3>
                                        <div className="space-y-3">
                                            {certification.controls.map((control, index) => (
                                                <div
                                                    key={control.id}
                                                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">
                                                            {control.id}
                                                        </div>
                                                        <span className="font-medium text-gray-300 text-sm">{control.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-[10px] font-medium border border-emerald-500/20">
                                                        <Check className="w-3 h-3" />
                                                        {control.status}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Benefits */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h3 className="flex items-center gap-2 text-white font-bold mb-4">
                                            <Target className="w-5 h-5 text-blue-400" />
                                            Benefícios Principais
                                        </h3>
                                        <ul className="space-y-3">
                                            {certification.details.benefits.map((benefit, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Evidence */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h3 className="flex items-center gap-2 text-white font-bold mb-4">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                            Evidências de Conformidade
                                        </h3>
                                        <div className="space-y-2">
                                            {certification.details.evidence.map((item, i) => (
                                                <div key={i} className="px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs text-gray-300">
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sticky top-0">
                                    <h3 className="text-lg font-semibold mb-6 text-white text-center">Certification Status</h3>
                                    <div className="relative w-40 h-40 mx-auto mb-6">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                className="stroke-gray-800"
                                                strokeWidth="10"
                                                fill="transparent"
                                            />
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                className="stroke-blue-500"
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray={2 * Math.PI * 70}
                                                strokeDashoffset={2 * Math.PI * 70 * (1 - (certification.progress / 100))}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-white">{certification.progress}%</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                                                {certification.status === 'complete' ? 'Compliant' : 'Ready'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Certificate No.</span>
                                            <span className="font-mono text-white text-xs">
                                                {certification.metadata?.certificateNumber || 'PENDING-AUDIT'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Issued</span>
                                            <span className="text-white text-xs">
                                                {certification.metadata?.issuedDate || '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Expires</span>
                                            <span className="text-white text-xs">
                                                {certification.metadata?.expiryDate || 'Estimated Q4 2025'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            notificationCenter.add({
                                                type: 'success',
                                                title: 'Download Started',
                                                message: `Downloading ${certification.title} certificate...`,
                                            });
                                        }}
                                        className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 group text-white">
                                        <Download className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                                        Download Certificate
                                    </button>
                                </div>

                                {certification.metadata?.auditScope && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                                        <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            Audit Scope
                                        </h3>
                                        <p className="text-sm text-blue-200/70 leading-relaxed">
                                            {certification.metadata.auditScope}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

