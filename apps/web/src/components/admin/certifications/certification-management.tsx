'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Award,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Plus,
    Filter,
    MoreVertical,
    FileText,
    Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@morina/ui';
import { Badge } from '@/components/ui/badge';
import { useCertifications } from '@/hooks/queries/use-certifications';
import { useCurrentOrganization } from '@/hooks/queries/use-organizations';

export function CertificationManagement() {
    const { data: currentOrg } = useCurrentOrganization();
    const { data: certifications, isLoading } = useCertifications(currentOrg?.id);
    const [searchTerm, setSearchTerm] = useState('');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const filteredCerts = certifications?.filter((cert: any) =>
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const stats = {
        total: certifications?.length || 0,
        completed: certifications?.filter((c: any) => c.status === 'complete').length || 0,
        inProgress: certifications?.filter((c: any) => c.status === 'in-progress' || c.status === 'prepared').length || 0,
        pending: certifications?.filter((c: any) => c.status === 'pending').length || 0,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="w-6 h-6 text-blue-500" />
                        Gestão de Certificações
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gerencie a conformidade e as certificações da sua organização
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Certificação
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total" value={stats.total} icon={<Shield className="w-4 h-4" />} color="blue" />
                <StatCard label="Concluídas" value={stats.completed} icon={<CheckCircle2 className="w-4 h-4" />} color="emerald" />
                <StatCard label="Em Progresso" value={stats.inProgress} icon={<Clock className="w-4 h-4" />} color="amber" />
                <StatCard label="Pendentes" value={stats.pending} icon={<AlertCircle className="w-4 h-4" />} color="gray" />
            </div>

            {/* Filters */}
            <GlassCard className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar certificação ou categoria..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="border-white/10">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                    </Button>
                </div>
            </GlassCard>

            {/* Certifications Table/List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredCerts.map((cert: any) => (
                    <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <GlassCard className="p-4 hover:border-blue-500/30 transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{cert.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                                                {cert.category}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-xs text-muted-foreground">Progresso: {cert.progress}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <StatusBadge status={cert.status} />
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" title="Ver Evidências">
                                            <FileText className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${cert.progress}%` }}
                                    className={`h-full ${getProgressColor(cert.status)}`}
                                />
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    const colors: any = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        gray: "text-gray-500 bg-gray-500/10 border-gray-500/20",
    };

    return (
        <GlassCard className={`p-4 border ${colors[color]}`}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-80">{label}</span>
                {icon}
            </div>
            <div className="text-2xl font-bold mt-2">{value}</div>
        </GlassCard>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'complete':
            return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/20">Concluído</Badge>;
        case 'in-progress':
        case 'prepared':
            return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/20">Em Progresso</Badge>;
        case 'pending':
            return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/20">Pendente</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function getProgressColor(status: string) {
    switch (status) {
        case 'complete': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
        case 'in-progress':
        case 'prepared': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
        default: return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
    }
}
