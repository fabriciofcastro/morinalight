"use client";

import { useState, useMemo } from "react";
import {
    Shield,
    Clock,
    Lock,
    Search,
    Plus,
    Filter,
    Activity,
    AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Button,
    GlassCard,
    GlassInput,
    GlassTabs,
    StandardPageLayout
} from "@/components/ui/futuristic";
import { SecurityPolicy, TimeWindow, ObjectAccessEntry } from "@morina/shared-kernel";

// Import modules
import { PoliciesList } from "./policy-list";
import { PolicyForm } from "./policy-form";
import { TimeWindowsList } from "./time-window-list";
import { TimeWindowForm } from "./time-window-form";
import { AclList } from "./acl-list";
import { AclForm } from "./acl-form";

/**
 * Advanced Security Manager (Security Command Center)
 */
export function AdvancedSecurityManager() {
    const [activeTab, setActiveTab] = useState("policies");
    const [searchQuery, setSearchQuery] = useState("");

    // UI States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

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
        { id: "audit", label: "Auditoria", icon: <Activity className="h-4 w-4" /> },
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

    return (
        <StandardPageLayout
            title="Segurança Avançada"
            subtitle="Configuração de modelos PBAC, TBAC e ACLs para Zero Trust."
            icon={<Shield className="h-8 w-8 text-[hsl(var(--primary))]" />}
            headerActions={
                <Button variant="primary" size="lg" onClick={handleAdd} className="shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Regra
                </Button>
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

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard label="Policies" value={policies.length} trend="PBAC Ativo" icon={<Shield className="text-blue-400" />} />
                    <StatCard label="Janelas" value={timeWindows.length} trend="TBAC Ativo" icon={<Clock className="text-amber-400" />} />
                    <StatCard label="ACLs" value={acls.length} trend="Granular" icon={<Lock className="text-emerald-400" />} />
                    <StatCard label="Alertas" value="0" trend="Security Healthy" icon={<AlertTriangle className="text-emerald-400" />} />
                </div>

                {/* Main Nav */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-white/5">
                    <GlassTabs tabs={tabs} activeTab={activeTab} onChange={(id) => { setActiveTab(id); setIsFormOpen(false); }} />
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
                            {activeTab === "audit" && <AuditLogsPlaceholder />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
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

function AuditLogsPlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
            <Activity className="h-12 w-12 text-white/10 mb-4" />
            <h4 className="text-white/60 font-medium">Fluxo de Triagem de Auditoria</h4>
            <p className="text-white/20 text-sm mt-1">Os logs de decisão em tempo real aparecerão aqui.</p>
        </div>
    );
}
