"use client";

import { Button, GlassCard, Input, Label, cn } from "@morina/ui";
import { Download, FileText, GitCompare, History, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { notificationCenter } from "@/components/notifications/notification-center";

type AuditLog = {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  performedBy: string;
  performedByEmail?: string | null;
  performedAt: string;
  reason?: string | null;
};

type BranchAuditPanelProps = {
  branchId: string;
  branchName: string;
  onClose: () => void;
};

export function BranchAuditPanel({ branchId, branchName, onClose }: BranchAuditPanelProps) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const params = new URLSearchParams();
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const response = await fetch(`/api/branches/${branchId}/audit?${params.toString()}`, { headers });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.itens || []);
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro ao carregar histórico",
        message: "Não foi possível carregar o histórico de alterações.",
      });
    } finally {
      setLoading(false);
    }
  }, [branchId, dateFrom, dateTo]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.performedByEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.oldValue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.newValue?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesField = fieldFilter === "all" || log.field === fieldFilter;
      return matchesSearch && matchesField;
    });
  }, [logs, searchQuery, fieldFilter]);

  const uniqueFields = Array.from(new Set(logs.map((log) => log.field)));

  const handleExport = () => {
    try {
      if (filteredLogs.length === 0) {
        notificationCenter.add({
          type: "warning",
          title: "Nenhum dado para exportar",
          message: "Não há registros de auditoria para exportar.",
        });
        return;
      }

      const exportData = filteredLogs.map((log) => ({
        Campo: log.field,
        "Valor Anterior": log.oldValue || "",
        "Novo Valor": log.newValue || "",
        "Alterado Por": log.performedByEmail || log.performedBy,
        "Data/Hora": new Date(log.performedAt).toLocaleString("pt-BR"),
        Motivo: log.reason || "",
      }));

      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(","),
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `auditoria_filial_${branchName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notificationCenter.add({
        type: "success",
        title: "Exportação concluída",
        message: `${filteredLogs.length} registro(s) exportado(s) com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro na exportação",
        message: "Não foi possível exportar o histórico de auditoria.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassCard className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-[hsl(var(--primary))]" />
            <div>
              <h3 className="text-xl font-bold text-white">Histórico de Alterações</h3>
              <p className="text-sm text-white/60">{branchName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={filteredLogs.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-white/10">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por campo, usuário, valor..."
                className="pl-10"
              />
            </div>

            <div>
              <Label htmlFor="field-filter">Campo</Label>
              <select
                id="field-filter"
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="all">Todos os campos</option>
                {uniqueFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="date-from">Data Inicial</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="date-to">Data Final</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-12 text-center text-white/50">Carregando histórico...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-white/50">
              {logs.length === 0
                ? "Nenhum registro de auditoria encontrado."
                : "Nenhum registro encontrado com os filtros aplicados."}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  className={cn(
                    "w-full text-left border border-white/10 bg-white/5 p-4 cursor-pointer transition-colors",
                    selectedLog?.id === log.id && "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]",
                  )}
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="h-5 w-5 text-white/40 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-white">{log.field}</span>
                          <span className="text-xs text-white/40">
                            por {log.performedByEmail || log.performedBy} em{" "}
                            {new Date(log.performedAt).toLocaleString("pt-BR")}
                          </span>
                        </div>

                        {selectedLog?.id === log.id && (
                          <div className="mt-3 grid gap-3 md:grid-cols-2 border-t border-white/10 pt-3">
                            <div>
                              <p className="text-xs text-white/50 mb-1">Valor Anterior</p>
                              <div className="bg-red-500/10 border border-red-500/30 p-2 text-sm text-white font-mono">
                                {log.oldValue || "(vazio)"}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-white/50 mb-1">Novo Valor</p>
                              <div className="bg-green-500/10 border border-green-500/30 p-2 text-sm text-white font-mono">
                                {log.newValue || "(vazio)"}
                              </div>
                            </div>
                            {log.reason && (
                              <div className="md:col-span-2">
                                <p className="text-xs text-white/50 mb-1">Motivo</p>
                                <div className="bg-white/5 border border-white/10 p-2 text-sm text-white">
                                  {log.reason}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {(!selectedLog || selectedLog.id !== log.id) && (
                          <div className="flex items-center gap-2 mt-2">
                            <GitCompare className="h-3 w-3 text-white/40" />
                            <span className="text-xs text-white/50">
                              {log.oldValue !== null ? "Alterado" : "Criado"} • Clique para ver detalhes
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}



