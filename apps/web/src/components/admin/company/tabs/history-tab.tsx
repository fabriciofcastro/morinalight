
"use client";

import { useEffect, useState } from "react";
import { FuturisticInput } from "@/components/ui/futuristic-ui";
import { Download, Clock, Search, X, AlertCircle, History, Save, RotateCcw } from "lucide-react";
import { companyAuditAPI } from "@/lib/api/company-audit";
import { companyVersionsAPI, CompanyVersion } from "@/lib/api/company-versions";
import type { CompanyAuditLog } from "@/types/audit";
import { SectionShell } from "../shared/section-shell";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { notificationCenter } from "@/components/notifications/notification-center";
import { SensitiveActionConfirmDialog } from "../compliance/sensitive-action-confirm-dialog";

export function HistoryTab() {
    const [activeView, setActiveView] = useState<"logs" | "versions">("logs");

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveView("logs")}
                    className={`pb-1 px-1 font-medium transition-colors relative ${activeView === "logs" ? "text-white" : "text-white/50 hover:text-white"}`}
                >
                    Logs de Auditoria
                    {activeView === "logs" && <div className="absolute -bottom-[17px] left-0 w-full h-[2px] bg-[hsl(var(--primary))]" />}
                </button>
                <button
                    onClick={() => setActiveView("versions")}
                    className={`pb-1 px-1 font-medium transition-colors relative ${activeView === "versions" ? "text-white" : "text-white/50 hover:text-white"}`}
                >
                    Versões & Backups
                    {activeView === "versions" && <div className="absolute -bottom-[17px] left-0 w-full h-[2px] bg-[hsl(var(--primary))]" />}
                </button>
            </div>

            {activeView === "logs" ? <AuditLogsView /> : <VersionsView />}
        </div>
    );
}

function VersionsView() {
    const [versions, setVersions] = useState<CompanyVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [restoreVersionId, setRestoreVersionId] = useState<string | null>(null);

    useEffect(() => {
        loadVersions();
    }, []);

    async function loadVersions() {
        setLoading(true);
        try {
            const data = await companyVersionsAPI.getVersions();
            setVersions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateSnapshot() {
        setCreating(true);
        try {
            await companyVersionsAPI.createSnapshot();
            notificationCenter.add({
                type: "success",
                title: "Backup Criado",
                message: "Nova versão das configurações salva com sucesso."
            });
            loadVersions();
        } catch (e) {
            notificationCenter.add({
                type: "error",
                title: "Erro",
                message: "Falha ao criar backup."
            });
        } finally {
            setCreating(false);
        }
    }

    async function handleRestore() {
        if (!restoreVersionId) return;

        try {
            await companyVersionsAPI.restoreVersion(restoreVersionId);
            notificationCenter.add({
                type: "success",
                title: "Restaurado com Sucesso",
                message: "As configurações foram revertidas para a versão selecionada."
            });
            setRestoreVersionId(null);
            // Optionally reload page or context to reflect changes
            window.location.reload();
        } catch (e) {
            notificationCenter.add({
                type: "error",
                title: "Erro ao Restaurar",
                message: "Não foi possível restaurar a versão."
            });
        }
    }

    return (
        <div className="space-y-6">
            <SectionShell title="Gerenciar Versões">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-white/60 text-sm max-w-xl">
                        Crie pontos de restauração (snapshots) antes de fazer grandes alterações.
                        Você pode restaurar uma versão anterior a qualquer momento.
                    </p>
                    <button
                        onClick={handleCreateSnapshot}
                        disabled={creating}
                        className="px-6 py-2 rounded-xl bg-[hsl(var(--primary))] text-black font-bold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {creating ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-black border-t-transparent" /> : <Save className="w-4 h-4" />}
                        Criar Backup Agora
                    </button>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-12 text-white/40">Carregando versões...</div>
                    ) : versions.length === 0 ? (
                        <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl border border-white/5 border-dashed">
                            <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Nenhuma versão salva.</p>
                        </div>
                    ) : (
                        versions.map(v => (
                            <div key={v.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] flex items-center justify-center font-bold text-lg">
                                        v{v.version}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{v.name || `Versão Automática`}</h4>
                                        <div className="flex items-center gap-2 text-xs text-white/50">
                                            <span>{formatDistanceToNow(new Date(v.createdAt), { addSuffix: true, locale: ptBR })}</span>
                                            <span>•</span>
                                            <span>por {v.creator.displayName}</span>
                                            {v.restoredAt && (
                                                <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full ml-2">
                                                    Restaurada
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setRestoreVersionId(v.id)}
                                    className="px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm flex items-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Restaurar
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </SectionShell>

            <SensitiveActionConfirmDialog
                open={!!restoreVersionId}
                onOpenChange={(open) => !open && setRestoreVersionId(null)}
                onConfirm={handleRestore}
                title="Confirmar Restauração"
                description="Tem certeza que deseja restaurar esta versão? Todas as configurações atuais serão substituídas pelos dados deste backup. Esta ação também criará um novo log de auditoria."
            />
        </div>
    );
}

function AuditLogsView() {
    const [logs, setLogs] = useState<CompanyAuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [fieldFilter, setFieldFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        loadLogs();
    }, []);

    async function loadLogs() {
        setLoading(true);
        try {
            const filters: any = {};
            if (fieldFilter) filters.fieldName = fieldFilter;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const data = await companyAuditAPI.getLogs(filters);
            setLogs(data.logs);
        } catch (error) {
            console.error("Error loading audit logs:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleExport() {
        setExporting(true);
        try {
            await companyAuditAPI.downloadCSV(`empresa-historico-${Date.now()}.csv`);
        } catch (error) {
            console.error("Error exporting logs:", error);
        } finally {
            setExporting(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <SectionShell title="Filtros de Busca">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FuturisticInput
                        label="Campo Alterado"
                        placeholder="Ex: razaoSocial, cnpj..."
                        value={fieldFilter}
                        onChange={(e) => setFieldFilter(e.target.value)}
                    />

                    <FuturisticInput
                        label="Data Inicial"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <FuturisticInput
                        label="Data Final"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={loadLogs}
                        disabled={loading}
                        className="group relative px-6 py-3 rounded-xl border border-[color-mix(in_oklab,hsl(var(--primary))_40%,transparent_60%)] bg-gradient-to-r from-[hsl(var(--primary)/0.15)] to-[hsl(var(--primary)/0.05)] text-white hover:from-[hsl(var(--primary)/0.25)] hover:to-[hsl(var(--primary)/0.15)] hover:border-[hsl(var(--primary))] transition-all shadow-[0_0_20px_-8px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)] flex items-center gap-2"
                    >
                        <Search className="w-4 h-4" />
                        {loading ? "Buscando..." : "Buscar"}
                    </button>

                    <button
                        onClick={() => {
                            setFieldFilter("");
                            setStartDate("");
                            setEndDate("");
                            loadLogs();
                        }}
                        className="px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Limpar
                    </button>

                    <div className="flex-1" />

                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="group relative px-6 py-3 rounded-xl border border-[color-mix(in_oklab,hsl(var(--accent))_40%,transparent_60%)] bg-gradient-to-r from-[hsl(var(--accent)/0.15)] to-[hsl(var(--accent)/0.05)] text-white hover:from-[hsl(var(--accent)/0.25)] hover:to-[hsl(var(--accent)/0.15)] hover:border-[hsl(var(--accent))] transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        {exporting ? "Exportando..." : "Exportar CSV"}
                    </button>
                </div>
            </SectionShell>

            {/* Lista de Logs */}
            <SectionShell title="Histórico de Alterações">
                <div className="text-sm text-white/40 mb-4">
                    Total: {logs.length} registro{logs.length !== 1 ? "s" : ""}
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-white/40">
                            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                            Carregando histórico...
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-white/20" />
                            <p className="text-white/40">Nenhuma alteração registrada</p>
                            {(fieldFilter || startDate || endDate) && (
                                <p className="text-sm text-white/30 mt-2">
                                    Tente ajustar os filtros de busca
                                </p>
                            )}
                        </div>
                    ) : (
                        logs.map((log) => <AuditLogItem key={log.id} log={log} />)
                    )}
                </div>
            </SectionShell>
        </div>
    );
}

function AuditLogItem({ log }: { log: CompanyAuditLog }) {
    const formatValue = (val: any): string => {
        if (val === null || val === undefined) return "(vazio)";
        if (typeof val === "boolean") return val ? "Sim" : "Não";
        if (typeof val === "object") return JSON.stringify(val, null, 2);
        return String(val);
    };

    const hasChange = log.fieldName && (log.oldValue !== undefined || log.newValue !== undefined);

    return (
        <div className="group relative p-6 rounded-xl border border-[color-mix(in_oklab,hsl(var(--border))_50%,transparent_50%)] bg-[color-mix(in_oklab,hsl(var(--surface))_30%,black_70%)] hover:bg-[color-mix(in_oklab,hsl(var(--surface))_40%,black_60%)] hover:border-[hsl(var(--primary)/0.3)] transition-all overflow-hidden">
            {/* Tech Corners */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/20 group-hover:border-[hsl(var(--primary)/0.6)] transition-colors" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/20 group-hover:border-[hsl(var(--primary)/0.6)] transition-colors" />

            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                        <span className="font-semibold text-white text-lg">
                            {log.fieldLabel || log.fieldName || log.entity}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(var(--primary)/0.2)] to-[hsl(var(--accent)/0.2)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)] capitalize font-medium">
                            {log.action === "create" ? "Criado" : log.action === "update" ? "Atualizado" : log.action === "restore" ? "Restaurado" : log.action}
                        </span>
                    </div>

                    {/* Diff visual */}
                    {hasChange && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="relative">
                                <p className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wider">Antes:</p>
                                <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500/30" />
                                    <p className="text-sm text-red-300/90 line-through break-words font-mono">
                                        {formatValue(log.oldValue)}
                                    </p>
                                </div>
                            </div>
                            <div className="relative">
                                <p className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wider">Depois:</p>
                                <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/30" />
                                    <p className="text-sm text-emerald-300/90 break-words font-mono">
                                        {formatValue(log.newValue)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Justification */}
                    {log.justification && (
                        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs text-blue-300/80">
                                <strong className="font-semibold">Contexto:</strong> {log.justification}
                            </p>
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className="text-right text-xs text-white/40 flex-shrink-0 space-y-1">
                    <p className="font-medium text-white/80 text-sm">{log.actorName || "Sistema"}</p>
                    <p className="text-[hsl(var(--primary))]">
                        {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                        })}
                    </p>
                    <p className="font-mono text-[10px]">
                        {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                    {log.ipAddress && (
                        <p className="font-mono text-[10px] text-white/30">{log.ipAddress}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
