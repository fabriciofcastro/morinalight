"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/base/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/base/card";
import { Button } from "@/shared/ui/base/button";
import { Switch } from "@/shared/ui/base/switch";
import {
    Trash2,
    Calendar,
    Filter,
    FileText,
    Clock,
    Mail,
    ChevronRight,
    Search,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { notificationCenter } from "@/shared/ui/notification-center";
import { cn } from "@/lib/utils";

interface FilterConfiguration {
    id: string;
    name: string;
    description: string | null;
    filterData: any;
    createdAt: string;
}

interface ReportSchedule {
    id: string;
    name: string;
    reportType: string;
    frequency: string;
    format: string;
    isActive: boolean;
    lastRunAt: string | null;
    nextRunAt: string | null;
    recipients: string[];
}

export const ReportsManagement = () => {
    const [activeTab, setActiveTab] = useState("schedules");
    const [filters, setFilters] = useState<FilterConfiguration[]>([]);
    const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [filtersRes, schedulesRes] = await Promise.all([
                fetch("/api/analytics/filters"),
                fetch("/api/analytics/schedules")
            ]);

            if (filtersRes.ok) setFilters(await filtersRes.json());
            if (schedulesRes.ok) setSchedules(await schedulesRes.json());
        } catch (error) {
            console.error("Failed to fetch reports management data:", error);
            notificationCenter.add({
                type: "error",
                title: "Erro de Carregamento",
                message: "Não foi possível carregar seus filtros e agendamentos."
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteFilter = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir esta configuração de filtro?")) return;

        try {
            const res = await fetch(`/api/analytics/filters?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setFilters(filters.filter(f => f.id !== id));
                notificationCenter.add({
                    type: "success",
                    title: "Filtro Excluído",
                    message: "A configuração foi removida com sucesso."
                });
            }
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao excluir filtro." });
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        if (!window.confirm("Deseja cancelar e excluir este agendamento de relatório?")) return;

        try {
            const res = await fetch(`/api/analytics/schedules?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setSchedules(schedules.filter(s => s.id !== id));
                notificationCenter.add({
                    type: "success",
                    title: "Agendamento Removido",
                    message: "O relatório não será mais enviado automaticamente."
                });
            }
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao excluir agendamento." });
        }
    };

    const handleToggleSchedule = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/analytics/schedules?id=${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                setSchedules(schedules.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
                notificationCenter.add({
                    type: "success",
                    title: currentStatus ? "Agendamento Pausado" : "Agendamento Ativado",
                    message: `O relatório agendado foi ${currentStatus ? "desativado" : "ativado"}.`
                });
            }
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao atualizar agendamento." });
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Gestão de Relatórios</h2>
                    <p className="text-gray-400 mt-2">Gerencie seus filtros salvos e agendamentos automáticos em um só lugar.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
                    <TabsTrigger value="schedules" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2 px-6">
                        <Clock className="w-4 h-4" />
                        Agendamentos
                    </TabsTrigger>
                    <TabsTrigger value="filters" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2 px-6">
                        <Filter className="w-4 h-4" />
                        Filtros Salvos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="schedules">
                    <div className="grid grid-cols-1 gap-4">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        ) : schedules.length > 0 ? (
                            schedules.map((schedule) => (
                                <motion.div
                                    key={schedule.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="bg-white/[0.03] border-white/10 hover:border-blue-500/30 transition-all overflow-hidden relative group">
                                        <div className={cn(
                                            "absolute left-0 top-0 bottom-0 w-1 transition-all",
                                            schedule.isActive ? "bg-blue-500" : "bg-gray-700"
                                        )} />
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                            <Calendar className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white">{schedule.name}</h3>
                                                            <p className="text-sm text-gray-400 capitalize">{schedule.reportType} • {schedule.frequency}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                                            <FileText className="w-4 h-4 text-gray-500" />
                                                            <span>Formato: <span className="text-gray-200 uppercase">{schedule.format}</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                                            <Mail className="w-4 h-4 text-gray-500" />
                                                            <span>{schedule.recipients.length} Destinatário(s)</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                                            <Clock className="w-4 h-4 text-gray-500" />
                                                            <span>Próximo envio: <span className="text-blue-400">{formatDate(schedule.nextRunAt)}</span></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 shrink-0">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Status</span>
                                                        <Switch
                                                            checked={schedule.isActive}
                                                            onCheckedChange={() => handleToggleSchedule(schedule.id, schedule.isActive)}
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-500 hover:text-red-400 transition-colors"
                                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <EmptyState
                                icon={Calendar}
                                title="Nenhum agendamento"
                                description="Você ainda não agendou nenhum relatório automático."
                            />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="filters">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        ) : filters.length > 0 ? (
                            filters.map((filter) => (
                                <motion.div
                                    key={filter.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Card className="bg-white/[0.03] border-white/10 hover:border-violet-500/30 transition-all h-full flex flex-col">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 mb-2">
                                                    <Filter className="w-5 h-5" />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-500 hover:text-red-400 -mt-1 -mr-2"
                                                    onClick={() => handleDeleteFilter(filter.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <CardTitle className="text-xl">{filter.name}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {filter.description || "Sem descrição disponível."}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="mt-auto space-y-4">
                                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                <span className="text-[10px] uppercase font-bold text-gray-500 block mb-2">Configuração</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.isArray(filter.filterData) ? filter.filterData.slice(0, 3).map((fd: any, i: number) => (
                                                        <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300">
                                                            {fd.fieldId}: {String(fd.value)}
                                                        </span>
                                                    )) : <span className="text-[10px] text-gray-500 italic">JSON customizado</span>}
                                                    {Array.isArray(filter.filterData) && filter.filterData.length > 3 && (
                                                        <span className="text-[10px] text-gray-500">+{filter.filterData.length - 3} mais</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>Salvo em {new Date(filter.createdAt).toLocaleDateString()}</span>
                                                <Button variant="link" className="text-violet-400 p-0 h-auto text-xs gap-1">
                                                    Usar <ChevronRight className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <EmptyState
                                icon={Filter}
                                title="Nenhum filtro salvo"
                                description="Salve suas configurações de filtros para acessá-las rapidamente depois."
                            />
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
        <div className="p-4 rounded-full bg-white/5 text-gray-500 mb-6 group-hover:scale-110 transition-transform">
            <Icon className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">{description}</p>
    </div>
);

const SkeletonCard = () => (
    <div className="h-40 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
);
