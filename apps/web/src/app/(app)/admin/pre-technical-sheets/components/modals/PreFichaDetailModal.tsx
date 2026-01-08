"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import { Badge } from "@/components/ui/badge";
import { PreFichaTecnica } from "@/lib/api/pre-fichas-tecnicas";
import { Button, FormField, GlassCard } from "@morina/ui";
import {
    Check,
    CheckCircle2,
    ClipboardCheck,
    Edit,
    FileText,
    History,
    Ruler, Scissors,
    Send,
    Users,
    X,
    XCircle
} from "lucide-react";
import { useState } from "react";
import { STATUS_COLORS, STATUS_LABELS } from "../../../constants";
import { formatDate } from "../../../utils";

interface ChecklistTecnico {
    moldeVesteCorretamente?: boolean;
    costuraViavel?: boolean;
    insumosCompatíveis?: boolean;
    pecaPilotoAprovadaVisualmente?: boolean;
}

interface PreFichaDetailModalProps {
    preFicha: PreFichaTecnica;
    onClose: () => void;
    onSubmeter: (preFicha: PreFichaTecnica) => void;
    onAprovarTecnicamente: (preFicha: PreFichaTecnica) => void;
    onReprovar: (preFicha: PreFichaTecnica, justificativa: string) => void;
    onAprovarDiretoria: (preFicha: PreFichaTecnica) => void;
    onShowHistorico: () => void;
    onAtualizarChecklist: (id: string, checklist: Partial<ChecklistTecnico>) => Promise<unknown>;
    onBuscar: (id: string) => Promise<unknown>;
    onShowPdf?: (preFicha: PreFichaTecnica) => void;
    isLoading: boolean;
}

export function PreFichaDetailModal({
    preFicha,
    onClose,
    onSubmeter,
    onAprovarTecnicamente,
    onReprovar,
    onAprovarDiretoria,
    onShowHistorico,
    onAtualizarChecklist,
    onBuscar,
    onShowPdf,
    isLoading,
}: PreFichaDetailModalProps) {
    const [showReprovarForm, setShowReprovarForm] = useState(false);
    const [justificativa, setJustificativa] = useState("");
    const [showChecklistForm, setShowChecklistForm] = useState(false);
    const [checklistForm, setChecklistForm] = useState({
        moldeVesteCorretamente: preFicha.checklistTecnico?.moldeVesteCorretamente ?? false,
        costuraViavel: preFicha.checklistTecnico?.costuraViavel ?? false,
        insumosCompatíveis: preFicha.checklistTecnico?.insumosCompatíveis ?? false,
        pecaPilotoAprovadaVisualmente:
            preFicha.checklistTecnico?.pecaPilotoAprovadaVisualmente ?? false,
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <GlassCard className="w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 z-10 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Pré-Ficha #{preFicha.numeroSequencial}
                        </h2>
                        <p className="text-sm text-white/60 font-mono">{preFicha.codigoPeca}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onShowPdf?.(preFicha)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            title="Visualizar Documento"
                        >
                            <FileText className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onShowHistorico}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            title="Ver histórico"
                        >
                            <History className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Header Status/Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white/40">Status:</span>
                            <Badge className={`${STATUS_COLORS[preFicha.status]} text-white border-none px-3 py-1`}>
                                {STATUS_LABELS[preFicha.status]}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {preFicha.status === "rascunho" && (
                                <Button
                                    size="sm"
                                    onClick={() => onSubmeter(preFicha)}
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Submeter para Revisão
                                </Button>
                            )}
                            {preFicha.status === "em_revisao_ficha_tecnica" && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={() => onAprovarTecnicamente(preFicha)}
                                        disabled={isLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Aprovar Tecnicamente
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => setShowReprovarForm(true)}
                                        disabled={isLoading}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reprovar
                                    </Button>
                                </>
                            )}
                            {preFicha.status === "aguardando_aval_diretoria" && (
                                <Button
                                    size="sm"
                                    onClick={() => onAprovarDiretoria(preFicha)}
                                    disabled={isLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    <ClipboardCheck className="w-4 h-4 mr-2" />
                                    Aprovar pela Diretoria
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column - Visuals & Primary Data */}
                        <div className="lg:col-span-4 space-y-6">
                            {preFicha.fotoPecaUrl ? (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Peça Piloto</h3>
                                    <div className="relative group overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                                        <img
                                            src={preFicha.fotoPecaUrl}
                                            alt={preFicha.nomePecaPiloto}
                                            className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-white/20">
                                    <FileText className="w-12 h-12 mb-2" />
                                    <p>Sem Foto</p>
                                </div>
                            )}

                            {/* Checklist */}
                            <GlassCard className="p-4 border-white/10 bg-white/[0.02]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                        <ClipboardCheck className="w-4 h-4" />
                                        Checklist Técnico
                                    </h3>
                                    {preFicha.status === "em_revisao_ficha_tecnica" && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-400 hover:bg-blue-400/10"
                                            onClick={() => setShowChecklistForm(true)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                {preFicha.checklistTecnico ? (
                                    <div className="space-y-3">
                                        <CheckItem label="Molde veste corretamente" checked={preFicha.checklistTecnico.moldeVesteCorretamente} />
                                        <CheckItem label="Costura viável" checked={preFicha.checklistTecnico.costuraViavel} />
                                        <CheckItem label="Insumos compatíveis" checked={preFicha.checklistTecnico.insumosCompatíveis} />
                                        <CheckItem label="Peça piloto aprovada visualmente" checked={preFicha.checklistTecnico.pecaPilotoAprovadaVisualmente} />
                                    </div>
                                ) : (
                                    <p className="text-xs text-white/40 italic">Checklist ainda não preenchido.</p>
                                )}
                            </GlassCard>
                        </div>

                        {/* Right Column - Detailed Specs */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Technical Data Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <DataField label="Nome da Peça" value={preFicha.nomePecaPiloto} />
                                <DataField label="Código" value={preFicha.codigoPeca} className="font-mono" />
                                <DataField label="Categoria" value={preFicha.categoria} />
                                <DataField label="Versão do Molde" value={String(preFicha.versaoMolde)} />
                                <DataField label="Criada em" value={formatDate(preFicha.createdAt)} />
                                <DataField label="Atualizada em" value={formatDate(preFicha.updatedAt)} />
                            </div>

                            {/* Responsáveis */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Corpo Técnico
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <DataField label="Estilista" value={preFicha.estilistaNome} />
                                    <DataField label="Modelista" value={preFicha.modelistaNome} />
                                    <DataField label="Piloteiro" value={preFicha.piloteiroNome} />
                                    <DataField label="Liberado por" value={preFicha.liberadoPorNome} />
                                </div>
                            </div>

                            {/* Grade */}
                            {preFicha.gradeTamanhos && preFicha.gradeTamanhos.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                        <Ruler className="w-4 h-4" />
                                        Grade Operacional
                                    </h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {preFicha.gradeTamanhos.map((t) => (
                                            <Badge key={t} className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Materials */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                    <Scissors className="w-4 h-4" />
                                    Especificações de Materiais
                                </h3>

                                {/* Tecidos Table */}
                                <div className="rounded-xl border border-white/10 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white/5 text-white/40 text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3">Tecido / Material</th>
                                                <th className="px-4 py-3">Consumo</th>
                                                <th className="px-4 py-3 text-right">Largura</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {preFicha.tecidos.map((t, i) => (
                                                <tr key={i} className="hover:bg-white/[0.02]">
                                                    <td className="px-4 py-3">
                                                        <span className="text-blue-400 text-xs block uppercase mb-0.5">{t.tipo}</span>
                                                        <span className="text-white font-medium">{t.nome}</span>
                                                        {t.especificacao && <span className="text-white/40 text-xs block">{t.especificacao}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-white">{t.consumo}m</td>
                                                    <td className="px-4 py-3 text-right font-mono text-white">{t.largura}cm</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Insumos Table */}
                                {preFicha.insumosTecnicos.length > 0 && (
                                    <div className="rounded-xl border border-white/10 overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-white/5 text-white/40 text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">Insumo Técnico</th>
                                                    <th className="px-4 py-3">Qtd Base</th>
                                                    <th className="px-4 py-3 text-right">Unid.</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {preFicha.insumosTecnicos.map((ins, i) => (
                                                    <tr key={i} className="hover:bg-white/[0.02]">
                                                        <td className="px-4 py-3">
                                                            <span className="text-purple-400 text-xs block uppercase mb-0.5">{ins.tipo}</span>
                                                            <span className="text-white font-medium">{ins.descricao}</span>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono text-white">{ins.quantidadeBase}</td>
                                                        <td className="px-4 py-3 text-right text-white/60">{ins.unidadeMedida}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Observations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {preFicha.observacoesTecnicas && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold text-white/40 uppercase">Observações Técnicas</h4>
                                        <p className="text-sm text-white/80 p-3 rounded-lg bg-white/5 border border-white/5 whitespace-pre-wrap">
                                            {preFicha.observacoesTecnicas}
                                        </p>
                                    </div>
                                )}
                                {preFicha.observacoesOficina && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold text-white/40 uppercase">Orientação para Oficina</h4>
                                        <p className="text-sm text-white/80 p-3 rounded-lg bg-white/5 border border-white/5 whitespace-pre-wrap">
                                            {preFicha.observacoesOficina}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Internal Modals (Checklist & Reprovação) */}
            {showChecklistForm && (
                <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4">
                    <GlassCard className="p-8 max-w-md w-full border-blue-500/20">
                        <h3 className="text-xl font-bold text-white mb-6">Validar Conformidade Técnica</h3>
                        <div className="space-y-4">
                            <CheckToggle label="Molde veste corretamente?" value={checklistForm.moldeVesteCorretamente} onChange={(v) => setChecklistForm({ ...checklistForm, moldeVesteCorretamente: v })} />
                            <CheckToggle label="Produção é viável na costura?" value={checklistForm.costuraViavel} onChange={(v) => setChecklistForm({ ...checklistForm, costuraViavel: v })} />
                            <CheckToggle label="Insumos são compatíveis?" value={checklistForm.insumosCompatíveis} onChange={(v) => setChecklistForm({ ...checklistForm, insumosCompatíveis: v })} />
                            <CheckToggle label="Aprovado visualmente?" value={checklistForm.pecaPilotoAprovadaVisualmente} onChange={(v) => setChecklistForm({ ...checklistForm, pecaPilotoAprovadaVisualmente: v })} />
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <Button variant="ghost" onClick={() => setShowChecklistForm(false)}>Cancelar</Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={async () => {
                                    try {
                                        await onAtualizarChecklist(preFicha.id, checklistForm);
                                        notificationCenter.add({ type: "success", title: "Checklist atualizado", message: "Conformidade salva com sucesso." });
                                        setShowChecklistForm(false);
                                        await onBuscar(preFicha.id);
                                    } catch (error: unknown) {
                                        notificationCenter.add({ type: "error", title: "Erro", message: (error instanceof Error ? error.message : "Erro ao salvar checklist.") });
                                    }
                                }}
                            >
                                Salvar Checklist
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {showReprovarForm && (
                <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4">
                    <GlassCard className="p-8 max-w-md w-full border-red-500/20">
                        <h3 className="text-xl font-bold text-white mb-2">Reprovar Pré-Ficha</h3>
                        <p className="text-sm text-white/40 mb-6">Informe o motivo técnico da reprovação. O estilista será notificado.</p>
                        <FormField label="Justificativa Técnica *">
                            <textarea
                                value={justificativa}
                                onChange={(e) => setJustificativa(e.target.value)}
                                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-red-500 min-h-[120px]"
                                placeholder="Ex: Falha no encaixe do molde ou insumo indisponível..."
                            />
                        </FormField>
                        <div className="flex justify-end gap-3 mt-8">
                            <Button variant="ghost" onClick={() => setShowReprovarForm(false)}>Cancelar</Button>
                            <Button
                                variant="danger"
                                disabled={justificativa.length < 10 || isLoading}
                                onClick={() => onReprovar(preFicha, justificativa)}
                            >
                                Confirmar Reprovação
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}

// Helpers
function DataField({ label, value, className }: { label: string; value?: string | null; className?: string }) {
    return (
        <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-tight mb-1">{label}</p>
            <div className={`text-sm text-white/80 font-medium truncate ${className}`}>{value || "-"}</div>
        </div>
    );
}

function CheckItem({ label, checked }: { label: string; checked?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            {checked ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
            <span className={`text-sm ${checked ? 'text-white/80' : 'text-white/40'}`}>{label}</span>
        </div>
    );
}

function CheckToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <span className="text-sm text-white/80 font-medium">{label}</span>
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="w-5 h-5 rounded border-blue-500/40 bg-blue-500/10 text-blue-500"
            />
        </label>
    );
}
