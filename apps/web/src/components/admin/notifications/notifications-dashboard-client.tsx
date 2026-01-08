"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    Bell,
    Mail,
    MessageSquare,
    Smartphone,
    Send,
    Settings,
    Plus,
    BarChart,
    CheckCircle,
    AlertCircle,
    Clock,
    Search,
    RefreshCw,
    MoreVertical,
    Radio,
    Play
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { notificationsApi, NotificationChannel, NotificationTemplate, NotificationLog } from "@/lib/api/notifications";
import { notificationCenter } from "@/shared/ui/notification-center";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/base/tabs";

const TAB_OPTIONS = [
    { id: 'dashboard', label: 'Visão Geral', icon: BarChart },
    { id: 'channels', label: 'Canais', icon: Settings },
    { id: 'templates', label: 'Modelos', icon: FileTextIcon },
    { id: 'logs', label: 'Histórico', icon: Clock },
    { id: 'simulation', label: 'Simulação', icon: Play },
];

function FileTextIcon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
}

export function NotificationsDashboardClient() {
    const router = useRouter();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    // Realtime connection status
    const { isConnected } = useRealtimeNotifications({ enabled: true });

    // Data
    const [channels, setChannels] = useState<NotificationChannel[]>([]);
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [logs, setLogs] = useState<NotificationLog[]>([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            // Parallel fetching
            const [channelsRes, templatesRes, logsRes] = await Promise.all([
                notificationsApi.listChannels(orgId).catch(() => [] as NotificationChannel[]),
                notificationsApi.listTemplates(orgId).catch(() => [] as NotificationTemplate[]),
                notificationsApi.listLogs(orgId, { limit: 10 }).catch(() => ({ items: [], total: 0 })),
            ]);

            setChannels(channelsRes.length > 0 ? channelsRes : [
                { id: '1', name: 'E-mail Principal', type: 'EMAIL', status: 'ACTIVE' },
                { id: '2', name: 'Push Mobile', type: 'PUSH', status: 'ACTIVE' },
                { id: '3', name: 'In-App System', type: 'IN_APP', status: 'ACTIVE' }
            ]);

            setTemplates(templatesRes.length > 0 ? templatesRes : [
                { id: '1', code: 'WELCOME', name: 'Boas Vindas', subject: 'Bem-vindo!', body: 'Olá {{name}}...', variables: ['name'], channels: ['1', '3'], priority: 'HIGH' },
                { id: '2', code: 'RESET_PASS', name: 'Reset de Senha', subject: 'Recuperar Senha', body: 'Clique aqui...', variables: ['link'], channels: ['1'], priority: 'CRITICAL' }
            ]);

            setLogs(logsRes.items.length > 0 ? logsRes.items : [
                { id: '1', templateCode: 'WELCOME', recipient: 'fab@morina.com', channel: 'EMAIL', status: 'DELIVERED', createdAt: new Date().toISOString() },
                { id: '2', templateCode: 'RESET_PASS', recipient: 'user@test.com', channel: 'EMAIL', status: 'SENT', createdAt: new Date(Date.now() - 3600000).toISOString() }
            ]);

        } catch (error) {
            console.error("Failed to load notification data", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar dados." });
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    return (
        <div className="p-8 space-y-8 min-h-screen text-white pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-violet-500">
                        Central de Notificações
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-white/60">Gerencie canais, modelos e envios em massa</p>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-xs font-mono">
                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isConnected ? "bg-emerald-500" : "bg-red-500")} />
                            <span className={isConnected ? "text-emerald-500" : "text-white/40"}>
                                {isConnected ? "REALTIME ON" : "REALTIME OFF"}
                            </span>
                        </div>
                    </div>
                </div>
                <Button className="bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] gap-2">
                    <Radio className="w-4 h-4" />
                    Novo Broadcast
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#090b16]/60 border border-white/5 rounded-xl p-1 w-full max-w-2xl backdrop-blur-md">
                {TAB_OPTIONS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                                isActive ? "bg-violet-500/20 text-violet-300 shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard title="Envios Hoje" value="1,240" icon={Send} colorClass="text-emerald-400" bgClass="bg-emerald-500/10" />
                            <StatCard title="Entregues" value="98.5%" icon={CheckCircle} colorClass="text-blue-400" bgClass="bg-blue-500/10" />
                            <StatCard title="Falhas" value="12" icon={AlertCircle} colorClass="text-red-400" bgClass="bg-red-500/10" />
                            <StatCard title="Canais Ativos" value={channels.length.toString()} icon={Settings} colorClass="text-violet-400" bgClass="bg-violet-500/10" />
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                            <h3 className="text-lg font-bold text-white mb-4">Últimos Envios</h3>
                            <div className="space-y-2">
                                {logs.map(log => (
                                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-2 h-2 rounded-full", log.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-gray-500')} />
                                            <div>
                                                <div className="font-medium text-white text-sm">{log.templateCode}</div>
                                                <div className="text-xs text-white/40">{log.recipient}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-white/70">{log.channel}</div>
                                            <div className="text-[10px] text-white/30">{new Date(log.createdAt).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'channels' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {channels.map(channel => (
                            <motion.div
                                key={channel.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                        {channel.type === 'EMAIL' ? <Mail className="w-6 h-6 text-blue-400" /> :
                                            channel.type === 'PUSH' ? <Smartphone className="w-6 h-6 text-purple-400" /> :
                                                <Bell className="w-6 h-6 text-yellow-400" />}
                                    </div>
                                    <div className={cn("px-2 py-1 rounded text-xs font-bold", channel.status === 'ACTIVE' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                                        {channel.status}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{channel.name}</h3>
                                <p className="text-sm text-white/50 mb-4">Canal oficial de comunicação via {channel.type.toLowerCase()}.</p>
                                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">Configurar</Button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-[#090b16]/40 p-4 rounded-xl border border-white/5">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input type="text" placeholder="Buscar modelos..." className="w-full bg-white/5 border-none rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-1 focus:ring-violet-500" />
                            </div>
                            <Button size="sm" className="bg-white/10 text-white hover:bg-white/20">
                                <Plus className="w-4 h-4 mr-2" /> Novo Modelo
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map(tpl => (
                                <div key={tpl.id} className="p-4 rounded-xl bg-[#090b16]/40 border border-white/5 hover:border-violet-500/30 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white">{tpl.name}</h4>
                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded",
                                            tpl.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                        )}>{tpl.priority}</span>
                                    </div>
                                    <div className="text-xs text-white/40 font-mono mb-2">{tpl.code}</div>
                                    <p className="text-sm text-white/60 mb-2 truncate">Assunto: {tpl.subject}</p>
                                    <div className="flex gap-2">
                                        {tpl.channels.map(c => (
                                            <span key={c} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-white/40">
                                                {c === '1' ? 'EMAIL' : c === '2' ? 'PUSH' : 'SYSTEM'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'simulation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Simulation Controls */}
                        <div className="space-y-6">
                            <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Play className="w-5 h-5 text-violet-400" />
                                    Simulador de Notificações
                                </h3>
                                <p className="text-sm text-white/60 mb-6">
                                    Dispare notificações locais para testar a experiência do usuário e o visual dos alertas.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        onClick={() => notificationCenter.add({
                                            type: "success",
                                            title: "Operação Realizada",
                                            message: "Os dados foram salvos com sucesso no sistema."
                                        })}
                                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Sucesso
                                    </Button>

                                    <Button
                                        onClick={() => notificationCenter.add({
                                            type: "error",
                                            title: "Erro de Conexão",
                                            message: "Não foi possível conectar ao servidor remoto."
                                        })}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                    >
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        Erro
                                    </Button>

                                    <Button
                                        onClick={() => notificationCenter.add({
                                            type: "warning",
                                            title: "Atenção Necessária",
                                            message: "Sua licença irá expirar em 3 dias."
                                        })}
                                        className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
                                    >
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        Aviso
                                    </Button>

                                    <Button
                                        onClick={() => notificationCenter.add({
                                            type: "info",
                                            title: "Nova Mensagem",
                                            message: "Você recebeu uma nova mensagem de suporte."
                                        })}
                                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Info
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                                <h3 className="text-lg font-bold text-white mb-4">Debug de Conexão</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                        <span className="text-sm text-white/60">Status WebSocket</span>
                                        <span className={cn("text-xs font-bold px-2 py-1 rounded", isConnected ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                                            {isConnected ? "CONECTADO" : "DESCONECTADO"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                        <span className="text-sm text-white/60">Organização ID</span>
                                        <span className="text-xs font-mono text-white/80">{orgId}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                        <span className="text-sm text-white/60">Ambiente</span>
                                        <span className="text-xs font-mono text-white/80">{process.env.NODE_ENV}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Placeholder */}
                        <div className="flex items-center justify-center p-12 bg-white/5 border border-white/5 rounded-xl border-dashed">
                            <div className="text-center">
                                <Bell className="w-16 h-16 text-white/10 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-white/40">Área de Visualização</h4>
                                <p className="text-sm text-white/20 mt-2">
                                    As notificações aparecerão no canto superior direito<br />
                                    e na central de notificações (sino).
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

function StatCard({ title, value, icon: Icon, colorClass, bgClass }: any) {
    return (
        <div className="p-5 rounded-xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-white/40">{title}</p>
                <h3 className={cn("text-2xl font-bold mt-1", colorClass || "text-white")}>{value}</h3>
            </div>
            <div className={cn("p-3 rounded-xl", bgClass || "bg-white/5 text-white")}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    )
}
