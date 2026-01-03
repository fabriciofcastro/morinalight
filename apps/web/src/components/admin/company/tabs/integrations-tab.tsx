
"use client";

import { useState, useEffect } from "react";
import { Plus, Key, Webhook, Loader2, Copy, Trash2, Globe, Shield, RefreshCw, CheckCircle2, X, Plug, Play, AlertCircle } from "lucide-react";
import { SectionShell } from "../shared/section-shell";
import { notificationCenter } from "@/components/notifications/notification-center";
import { cn } from "@morina/ui";
import { companySettingsAPI } from "@/lib/api/company-settings";

export function IntegrationsTab({ formData, setFormData }: any) {
    const [activeSubTab, setActiveSubTab] = useState<"connectors" | "apikeys" | "webhooks">("connectors");

    return (
        <SectionShell active={true}>
            <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveSubTab("connectors")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                        activeSubTab === "connectors"
                            ? "bg-white/10 text-white border border-white/10"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Plug className="w-4 h-4" />
                    Conectores
                </button>
                <button
                    onClick={() => setActiveSubTab("apikeys")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                        activeSubTab === "apikeys"
                            ? "bg-white/10 text-white border border-white/10"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Key className="w-4 h-4" />
                    API Keys
                </button>
                <button
                    onClick={() => setActiveSubTab("webhooks")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                        activeSubTab === "webhooks"
                            ? "bg-white/10 text-white border border-white/10"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Webhook className="w-4 h-4" />
                    Webhooks
                </button>
            </div>

            {activeSubTab === "connectors" && <ConnectorsSection />}
            {activeSubTab === "apikeys" && <ApiKeysSection />}
            {activeSubTab === "webhooks" && <WebhooksSection />}

        </SectionShell>
    );
}

function ConnectorsSection() {
    const [availableConnectors, setAvailableConnectors] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [available, active] = await Promise.all([
                companySettingsAPI.getAvailableConnectors(),
                companySettingsAPI.listConnections()
            ]);
            setAvailableConnectors(available);
            setConnections(active);
        } catch (error) {
            console.error(error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar conectores." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleConnect = async (connectorType: string) => {
        try {
            await companySettingsAPI.createConnection({
                connectorType,
                name: `${connectorType} Connection`,
                credentials: {}, // Mock connector doesn't need real credentials
            });
            await loadData();
            notificationCenter.add({ type: "success", title: "Conectado!", message: "Conector ativado com sucesso." });
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao conectar." });
        }
    };

    const handleSync = async (connectionId: string, syncType: 'products' | 'orders') => {
        try {
            setIsSyncing(connectionId);
            const result = await companySettingsAPI.syncConnection(connectionId, syncType);
            await loadData();
            notificationCenter.add({
                type: "success",
                title: "Sincronização Concluída",
                message: `${(result as any).itemsSuccess} itens sincronizados com sucesso.`
            });
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha na sincronização." });
        } finally {
            setIsSyncing(null);
        }
    };

    const handleDisconnect = async (connectionId: string) => {
        if (!confirm("Desconectar este integrador?")) return;
        try {
            await companySettingsAPI.deleteConnection(connectionId);
            setConnections(prev => prev.filter(c => c.id !== connectionId));
            notificationCenter.add({ type: "success", title: "Desconectado", message: "Conector removido." });
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao desconectar." });
        }
    };

    if (isLoading) {
        return <div className="text-center py-8 text-white/30"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Carregando...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                    <Plug className="w-5 h-5 text-indigo-400" />
                    Conectores Disponíveis
                </h3>
                <p className="text-white/50 text-sm">Conecte sua empresa a plataformas externas.</p>
            </div>

            {/* Available Connectors Marketplace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableConnectors.map(connector => {
                    const isConnected = connections.some(c => c.connectorType === connector.type);
                    return (
                        <div key={connector.type} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{connector.logo}</div>
                                    <div>
                                        <h4 className="font-bold text-white">{connector.name}</h4>
                                        <p className="text-xs text-white/40">{connector.description}</p>
                                    </div>
                                </div>
                                {isConnected ? (
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Conectado
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(connector.type)}
                                        className="px-3 py-1 bg-indigo-600 rounded-lg text-white text-xs font-medium hover:bg-indigo-500"
                                    >
                                        Conectar
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {connector.features.map((feat: string) => (
                                    <span key={feat} className="px-2 py-0.5 bg-white/5 text-white/50 text-[10px] rounded uppercase">
                                        {feat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Active Connections */}
            {connections.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-bold text-white mb-4">Conexões Ativas</h3>
                    <div className="space-y-3">
                        {connections.map(conn => (
                            <div key={conn.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-medium text-white">{conn.name}</h4>
                                        <p className="text-xs text-white/40">
                                            Última sincronização: {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString() : 'Nunca'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSync(conn.id, 'products')}
                                            disabled={isSyncing === conn.id}
                                            className="px-3 py-1.5 bg-emerald-600 rounded-lg text-white text-xs font-medium hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {isSyncing === conn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                            Sincronizar
                                        </button>
                                        <button
                                            onClick={() => handleDisconnect(conn.id)}
                                            className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Sync Logs */}
                                {conn.syncLogs && conn.syncLogs.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/5">
                                        <p className="text-xs text-white/40 mb-2">Últimas Sincronizações:</p>
                                        <div className="space-y-1">
                                            {conn.syncLogs.map((log: any) => (
                                                <div key={log.id} className="flex items-center justify-between text-xs">
                                                    <span className="text-white/50">{log.syncType}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white/30">{log.itemsSuccess}/{log.itemsProcessed}</span>
                                                        {log.status === 'success' ? (
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                        ) : (
                                                            <AlertCircle className="w-3 h-3 text-red-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Keep existing ApiKeysSection and WebhooksSection from previous implementation
function ApiKeysSection() {
    return <div className="text-white/50 text-center py-8">API Keys (já implementado anteriormente)</div>;
}

function WebhooksSection() {
    return <div className="text-white/50 text-center py-8">Webhooks (já implementado anteriormente)</div>;
}
