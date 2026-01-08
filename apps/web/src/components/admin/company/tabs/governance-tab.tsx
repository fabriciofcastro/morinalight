
"use client";

import { useEffect, useState } from "react";
import { SectionShell } from "../shared/section-shell";
import { governanceAPI, ApprovalWorkflow, ApprovalRequest } from "@/lib/api/governance";
import { CheckCircle, XCircle, Shield, FileText, Settings, Loader2, AlertTriangle, User } from "lucide-react";
import { format } from "date-fns";
import { notificationCenter } from "@/shared/ui/notification-center";
import { RequestDetailsDialog } from "../governance/request-details-dialog";

export function GovernanceTab() {
    const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

    // Default protected fields config
    const protectedFields = [
        { key: "legalName", label: "Razão Social" },
        { key: "cnpj", label: "CNPJ" },
        { key: "fiscal", label: "Dados Fiscais" },
        { key: "address", label: "Endereço" },
    ];

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [w, r] = await Promise.all([
                governanceAPI.getWorkflows(),
                governanceAPI.getRequests()
            ]);
            setWorkflows(w);
            setRequests(r);
        } catch (e) {
            console.error(e);
            // Fail silently or show generic error
        } finally {
            setLoading(false);
        }
    }

    const currentWorkflow = workflows.find(w => w.module === "COMPANY_SETTINGS");
    const monitoredFields = currentWorkflow?.fields || [];

    async function toggleField(fieldKey: string) {
        const isProtected = monitoredFields.includes(fieldKey);
        const newFields = isProtected
            ? monitoredFields.filter(f => f !== fieldKey)
            : [...monitoredFields, fieldKey];

        try {
            await governanceAPI.updateWorkflow({
                module: "COMPANY_SETTINGS",
                fields: newFields,
                approverRole: "ADMIN" // Default for now
            });
            loadData(); // Reload to sync
            notificationCenter.add({
                type: "success",
                title: "Workflow Atualizado",
                message: `Proteção para ${fieldKey} ${isProtected ? "removida" : "ativada"}.`
            });
        } catch (e) {
            notificationCenter.add({
                type: "error",
                title: "Erro",
                message: "Falha ao atualizar workflow."
            });
        }
    }

    async function handleAction(requestId: string, action: 'approve' | 'reject') {
        try {
            if (action === 'approve') await governanceAPI.approveRequest(requestId);
            else await governanceAPI.rejectRequest(requestId);

            loadData();
            notificationCenter.add({
                type: "success",
                title: action === 'approve' ? "Solicitação Aprovada" : "Solicitação Rejeitada",
                message: `A ação foi processada com sucesso.`
            });
        } catch (e) {
            notificationCenter.add({
                type: "error",
                title: "Erro",
                message: "Falha ao processar solicitação."
            });
        }
    }

    if (loading && workflows.length === 0) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <RequestDetailsDialog
                open={!!selectedRequest}
                onOpenChange={(open) => !open && setSelectedRequest(null)}
                request={selectedRequest}
                onAction={handleAction}
            />

            {/* Configuração */}
            <SectionShell title="Regras de Governança">
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 mb-6">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-indigo-400 mt-1" />
                        <div>
                            <h3 className="font-semibold text-white">Sobre a Governança</h3>
                            <p className="text-sm text-white/60">
                                Campos marcados abaixo exigirão <strong>aprovação de um administrador</strong> antes de serem alterados.
                                Isso garante maior segurança e integridade dos dados corporativos.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {protectedFields.map((field) => {
                        const isProtected = monitoredFields.includes(field.key);
                        return (
                            <div key={field.key} className={`p-4 rounded-lg border flex items-center justify-between transition-all ${isProtected ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                <div className="flex items-center gap-3">
                                    {isProtected ? <Shield className="w-4 h-4 text-indigo-400" /> : <FileText className="w-4 h-4 text-white/40" />}
                                    <span className={isProtected ? "text-white font-medium" : "text-white/70"}>
                                        {field.label}
                                    </span>
                                </div>

                                <button
                                    onClick={() => toggleField(field.key)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${isProtected ? 'bg-indigo-500' : 'bg-white/20'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isProtected ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </SectionShell>

            {/* Solicitações Pendentes */}
            <SectionShell title="Solicitações & Rascunhos">
                {requests.length === 0 ? (
                    <div className="text-center py-12 text-white/30 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhuma solicitação pendente no momento.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(req => (
                            <div key={req.id} className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row gap-6 md:items-center justify-between group hover:border-white/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                        {req.requester.avatarUrl ? (
                                            <img src={req.requester.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-white/50" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-white">{req.requester.displayName}</h4>
                                            {req.status === 'DRAFT' && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase font-bold tracking-wider">
                                                    Rascunho
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-white/50">
                                            <span>{req.requester.email}</span>
                                            <span>•</span>
                                            <span>{format(new Date(req.createdAt), "dd/MM/yyyy HH:mm")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 md:px-8">
                                    <div className="text-sm text-white/70 bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-[300px]">
                                        {JSON.stringify(req.data)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedRequest(req)}
                                        className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Revisar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionShell>
        </div>
    );
}
