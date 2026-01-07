"use client";

import { Badge } from "@/components/ui/badge";
import {
    Button,
    GlassCard,
    GlassInput,
} from "@/components/ui/futuristic";
import { Can } from "@/lib/auth/CaslContext";
import { ObjectAccessEntry, SecurityPolicy, TimeWindow } from "@morina/shared-kernel";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity,
    AlertTriangle,
    Ban,
    Clock,
    FileText,
    Info,
    Lock,
    Plus,
    RefreshCw,
    Search,
    Shield
} from "lucide-react";
import { useMemo, useState } from "react";

// Local implementations for missing components
const GlassTabs = ({ tabs, activeTab, onChange }: { tabs: { id: string; label: string; icon?: React.ReactNode }[]; activeTab: string; onChange: (id: string) => void }) => (
    <div className="flex space-x-2 border-b border-white/10">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === tab.id ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" : "border-transparent text-white/60 hover:text-white"
                    }`}
            >
                {tab.icon}
                {tab.label}
            </button>
        ))}
    </div>
);

const StandardPageLayout = ({ title, subtitle, icon, headerActions, children }: { title: string; subtitle: string; icon: React.ReactNode; headerActions?: React.ReactNode; children: React.ReactNode }) => (
    <div className="min-h-screen p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[hsl(var(--primary))/0.1] border border-[hsl(var(--primary))/0.2]">
                    {icon}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                    <p className="text-white/60">{subtitle}</p>
                </div>
            </div>
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
        {children}
    </div>
);

import { useEffect } from "react";
import { AclForm } from "./acl-form";
import { AclList } from "./acl-list";
import { AiSecurityAnalyst } from "./ai-security-analyst";
import { BlockedIPsList } from "./blocked-ips-list";
import { ComplianceReportView } from "./compliance-report-view";
import { PolicyForm } from "./policy-form";
import { PoliciesList } from "./policy-list";
import { SecurityAlertsList } from "./security-alerts-list";
import { ThreatGlobe, type Threat } from "./threat-globe";
import { TimeWindowForm } from "./time-window-form";
import { TimeWindowsList } from "./time-window-list";

/**
 * Advanced Security Manager (Security Command Center)
 */
export function AdvancedSecurityManager() {
    const [activeTab, setActiveTab] = useState("policies");
    const [searchQuery, setSearchQuery] = useState("");

    // UI States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [alertsLoading, setAlertsLoading] = useState(false);
    const [threats, setThreats] = useState<Threat[]>([]);
    const [blockedIps, setBlockedIps] = useState<any[]>([]);
    const [blockedIpsLoading, setBlockedIpsLoading] = useState(false);

    useEffect(() => {
        // 1. Fetch initial batch
        const fetchInitial = async () => {
            try {
                const res = await fetch('/api/security/threat-map');
                const data = await res.json();
                if (data.threats) {
                    setThreats(data.threats);
                }
            } catch (e) {
                console.error("Failed to fetch initial threats", e);
            }
        };
        fetchInitial();

        // 2. Connect to SSE Stream
        const eventSource = new EventSource('/api/security/threat-map/stream');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.threats) {
                setThreats(prev => {
                    const newThreats = [...data.threats, ...prev];
                    return newThreats.slice(0, 50); // Keep last 50
                });
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE Connection failed", err);
            eventSource.close();
        };

        return () => eventSource.close();
    }, []);

    const topCountries = useMemo(() => {
        const counts: Record<string, number> = {};
        threats.forEach(t => {
            const country = t.source.country || "Unknown";
            counts[country] = (counts[country] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [threats]);

    // Fetch alerts when Audit tab is active
    useEffect(() => {
        if (activeTab === "audit") {
            fetchAlerts();
        }
    }, [activeTab]);

    const fetchAlerts = async () => {
        try {
            setAlertsLoading(true);
            const response = await fetch('/api/security/alerts?limit=50');
            if (response.ok) {
                const data = await response.json();
                setAlerts(data.alerts);
            }
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        } finally {
            setAlertsLoading(false);
        }
    };

    const handleAcknowledgeAlert = async (alertId: string) => {
        try {
            const response = await fetch(`/api/security/alerts/${alertId}/acknowledge`, {
                method: 'POST'
            });
            if (response.ok) {
                setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
            }
        } catch (error) {
            console.error("Failed to acknowledge alert:", error);
        }
    };

    const fetchBlockedIps = async () => {
        try {
            setBlockedIpsLoading(true);
            const response = await fetch('/api/security/blocked-ips');
            if (response.ok) {
                const data = await response.json();
                setBlockedIps(data);
            }
        } catch (error) {
            console.error("Failed to fetch blocked IPs:", error);
        } finally {
            setBlockedIpsLoading(false);
        }
    };

    const handleUnblockIp = async (ip: string) => {
        try {
            const response = await fetch(`/api/security/blocked-ips?ip=${ip}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setBlockedIps(prev => prev.filter(b => b.ip !== ip));
            }
        } catch (error) {
            console.error("Failed to unblock IP:", error);
        }
    };

    useEffect(() => {
        if (activeTab === "firewall") {
            fetchBlockedIps();
        }
    }, [activeTab]);

    // Mock Data (Simulando persistência até Phase 5)
    const [policies, setPolicies] = useState<SecurityPolicy[]>([
        {
            id: "pol-1",
            orgId: "org-1",
            name: "Acesso Noturno Restrito",
            description: "Bloqueia acesso a dados sensíveis fora do horário comercial.",
            effect: "DENY",
            action: ["delete", "export"],
            subject: "all",
            priority: 100,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);

    const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([
        {
            id: "tw-1",
            orgId: "org-1",
            name: "Horário de Brasília",
            startTime: "08:00",
            endTime: "19:00",
            daysOfWeek: [1, 2, 3, 4, 5],
            timezone: "America/Sao_Paulo",
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);

    const [acls, setAcls] = useState<ObjectAccessEntry[]>([
        {
            id: "acl-1",
            subject: "Product",
            subjectId: "550e8400-e29b-41d4-a716-446655440000",
            action: "manage",
            userId: "user-super-admin-01"
        }
    ]);

    const tabs = [
        { id: "policies", label: "Políticas PBAC", icon: <Shield className="h-4 w-4" /> },
        { id: "time", label: "Controle Temporal", icon: <Clock className="h-4 w-4" /> },
        { id: "acl", label: "Listas ACL", icon: <Lock className="h-4 w-4" /> },
        { id: "compliance", label: "Conformidade", icon: <FileText className="h-4 w-4" /> },
        { id: "audit", label: "Auditoria", icon: <Activity className="h-4 w-4" /> },
        { id: "firewall", label: "Firewall", icon: <Ban className="h-4 w-4" /> },
        { id: "docs", label: "Mapeamento", icon: <Info className="h-4 w-4" /> },
    ];

    // Handlers
    const handleAdd = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleSave = (data: any) => {
        // Mock save logic
        if (activeTab === "policies") {
            if (editingItem) setPolicies(policies.map(p => p.id === editingItem.id ? { ...p, ...data } : p));
            else setPolicies([{ ...data, id: `new-${Date.now()}`, active: true } as SecurityPolicy, ...policies]);
        } else if (activeTab === "time") {
            if (editingItem) setTimeWindows(timeWindows.map(tw => tw.id === editingItem.id ? { ...tw, ...data } : tw));
            else setTimeWindows([{ ...data, id: `new-${Date.now()}`, active: true } as TimeWindow, ...timeWindows]);
        } else if (activeTab === "acl") {
            if (editingItem) setAcls(acls.map(a => a.id === editingItem.id ? { ...a, ...data } : a));
            else setAcls([{ ...data, id: `new-${Date.now()}` } as ObjectAccessEntry, ...acls]);
        }
        setIsFormOpen(false);
    };

    const handleDelete = (id: string) => {
        if (activeTab === "policies") setPolicies(policies.filter(p => p.id !== id));
        else if (activeTab === "time") setTimeWindows(timeWindows.filter(tw => tw.id !== id));
        else if (activeTab === "acl") setAcls(acls.filter(a => a.id !== id));
    };

    const handleToggle = (id: string) => {
        if (activeTab === "policies") setPolicies(policies.map(p => p.id === id ? { ...p, active: !p.active } : p));
        else if (activeTab === "time") setTimeWindows(timeWindows.map(tw => tw.id === id ? { ...tw, active: !tw.active } : tw));
    };

    const currentSubject = useMemo(() => {
        switch (activeTab) {
            case "policies": return "SecurityPolicy";
            case "time": return "TimeWindow";
            case "acl": return "ObjectAccessEntry";
            case "compliance": return "ComplianceReport";
            case "audit": return "SecurityAlert";
            case "firewall": return "BlockedIP";
            default: return "all";
        }
    }, [activeTab]);

    return (
        <StandardPageLayout
            title="Segurança Avançada"
            subtitle="Configuração de modelos PBAC, TBAC e ACLs para Zero Trust."
            icon={<Shield className="h-8 w-8 text-[hsl(var(--primary))]" />}
            headerActions={
                <Can I="create" a={currentSubject as any}>
                    <Button variant="default" size="lg" onClick={handleAdd} className="shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Regra
                    </Button>
                </Can>
            }
        >
            <div className="space-y-6">
                {/* Modal de Formulário */}
                <AnimatePresence>
                    {isFormOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                            >
                                {activeTab === "policies" && (
                                    <PolicyForm
                                        initialData={editingItem}
                                        onSave={handleSave}
                                        onCancel={() => setIsFormOpen(false)}
                                    />
                                )}
                                {activeTab === "time" && (
                                    <TimeWindowForm
                                        initialData={editingItem}
                                        onSave={handleSave}
                                        onCancel={() => setIsFormOpen(false)}
                                    />
                                )}
                                {activeTab === "acl" && (
                                    <AclForm
                                        initialData={editingItem}
                                        onSave={handleSave}
                                        onCancel={() => setIsFormOpen(false)}
                                    />
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Security War Room Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live Threat Map */}
                    <div className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="h-5 w-5 text-red-500 animate-pulse" />
                                Monitoramento Global de Ameaças
                            </h3>
                            <Badge variant="outline" className="text-xs border-red-500/30 text-red-400 bg-red-500/10">
                                LIVE
                            </Badge>
                        </div>
                        <ThreatGlobe threats={threats} />
                    </div>

                    {/* Quick Stats & Alerts */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                            <GlassCard className="p-4 border-white/5 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-3">
                                    <Activity className="h-4 w-4 text-red-500" />
                                    <h4 className="text-sm font-semibold text-white">Top Origens de Ataque</h4>
                                </div>
                                <div className="space-y-2">
                                    {topCountries.map(([country, count], i) => (
                                        <div key={country} className="flex items-center justify-between text-xs">
                                            <span className="text-white/70 flex items-center gap-2">
                                                <span className="w-4 text-white/30 font-mono">{i + 1}.</span>
                                                {country}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-red-500/50"
                                                        style={{ width: `${(count / Math.max(1, topCountries[0]![1])) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono text-white/50 w-6 text-right">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {topCountries.length === 0 && (
                                        <div className="text-center text-white/20 py-4 text-xs">Nenhum dado</div>
                                    )}
                                </div>
                            </GlassCard>

                            <StatCard
                                label="Alertas Ativos"
                                value={alerts.filter(a => !a.acknowledged).length}
                                trend={alerts.length > 0 ? `${alerts.filter(a => a.severity === 'critical').length} Críticos` : "Security Healthy"}
                                icon={<AlertTriangle className={alerts.filter(a => !a.acknowledged).length > 0 ? "text-red-400" : "text-emerald-400"} />}
                            />
                            <StatCard label="Policies Ativas" value={policies.length} trend="PBAC Enforced" icon={<Shield className="text-blue-400" />} />
                            <StatCard label="Janelas Temporais" value={timeWindows.length} trend="TBAC Active" icon={<Clock className="text-amber-400" />} />
                            <StatCard label="Regras ACL" value={acls.length} trend="Granular Control" icon={<Lock className="text-emerald-400" />} />
                        </div>
                    </div>
                </div>

                {/* Main Nav */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-white/5">
                    <GlassTabs tabs={tabs} activeTab={activeTab} onChange={(id: string) => { setActiveTab(id); setIsFormOpen(false); }} />
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                            <GlassInput placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                        </div>
                    </div>
                </div>

                {/* Views */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {activeTab === "policies" && (
                                <PoliciesList
                                    policies={policies}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggle={handleToggle}
                                />
                            )}
                            {activeTab === "time" && (
                                <TimeWindowsList
                                    windows={timeWindows}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggle={handleToggle}
                                />
                            )}
                            {activeTab === "acl" && (
                                <AclList
                                    entries={acls}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            )}
                            {activeTab === "compliance" && <ComplianceReportView />}
                            {activeTab === "audit" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-bold text-lg">Alertas de Segurança Recentes</h3>
                                        <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={alertsLoading}>
                                            <RefreshCw className={`h-4 w-4 mr-2 ${alertsLoading ? 'animate-spin' : ''}`} />
                                            Atualizar
                                        </Button>
                                    </div>
                                    <SecurityAlertsList
                                        alerts={alerts}
                                        onAcknowledge={handleAcknowledgeAlert}
                                        loading={alertsLoading}
                                    />
                                </div>
                            )}

                            {activeTab === "firewall" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-bold text-lg">Firewall: IPs Bloqueados</h3>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={fetchBlockedIps} disabled={blockedIpsLoading}>
                                                <RefreshCw className={`h-4 w-4 mr-2 ${blockedIpsLoading ? 'animate-spin' : ''}`} />
                                                Atualizar
                                            </Button>
                                        </div>
                                    </div>
                                    <BlockedIPsList
                                        blockedIPs={blockedIps.map(b => ({
                                            ...b,
                                            permanent: !b.expiresAt
                                        }))}
                                        onUnblock={handleUnblockIp}
                                        loading={blockedIpsLoading}
                                    />
                                </div>
                            )}

                            {activeTab === "docs" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <GlassCard className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-primary" />
                                            Mapeamento de Permissões
                                        </h3>
                                        <div className="space-y-4">
                                            <DocItem
                                                key_name="all:manage"
                                                description="Acesso total ao sistema. Reservado para Owners."
                                            />
                                            <DocItem
                                                key_name="*:view"
                                                description="Permissão genérica de visualização (Read)."
                                            />
                                            <DocItem
                                                key_name="products:edit:own"
                                                description="ABAC: Edição restrita a objetos criados pelo próprio usuário."
                                            />
                                            <DocItem
                                                key_name="*:create:business_hours"
                                                description="TBAC: Criação restrita ao horário comercial configurado."
                                            />
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Lock className="h-5 w-5 text-emerald-400" />
                                            Heurísticas de Zero Trust
                                        </h3>
                                        <p className="text-sm text-white/50 leading-relaxed italic">
                                            O Morina utiliza um motor de autorização unificado que avalia 4 camadas:
                                        </p>
                                        <ol className="list-decimal list-inside mt-4 space-y-2 text-sm text-white/70">
                                            <li><strong>RBAC:</strong> Funções básicas do usuário.</li>
                                            <li><strong>PBAC:</strong> Políticas globais (Time, IP, MFA).</li>
                                            <li><strong>ACL:</strong> Permissões granulares por objeto.</li>
                                            <li><strong>ABAC:</strong> Atributos dinâmicos e propriedade.</li>
                                        </ol>
                                    </GlassCard>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <AiSecurityAnalyst />
        </StandardPageLayout>
    );
}

function StatCard({ label, value, trend, icon }: any) {
    return (
        <GlassCard className="p-4 border-white/5 hover:border-[hsl(var(--primary)/0.2)] transition-colors group">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
                <div className="p-2 rounded-lg bg-black/20 group-hover:scale-110 transition-transform">{icon}</div>
            </div>
            <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold text-white">{value}</h3>
                <Badge variant="outline" className="text-[9px] border-white/5 opacity-60">{trend}</Badge>
            </div>
        </GlassCard>
    );
}

function DocItem({ key_name, description }: { key_name: string, description: string }) {
    return (
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <span className="text-[10px] font-mono text-[hsl(var(--primary))] font-bold">{key_name}</span>
            <p className="text-xs text-white/50">{description}</p>
        </div>
    );
}


