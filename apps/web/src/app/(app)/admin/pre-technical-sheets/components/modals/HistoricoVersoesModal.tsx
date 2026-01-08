"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import { Badge } from "@/components/ui/badge";
import { ComparacaoVersoes, PreFichaTecnica, Tecido } from "@/lib/api/pre-fichas-tecnicas";
import { Button, GlassCard } from "@morina/ui";
import { Eye, GitCompare, History, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ComparacaoVersoesModal } from "../../../comparacao-versoes-modal";

interface HistoricoVersoesModalProps {
    preFichaId: string;
    orgId: string;
    onClose: () => void;
}

export function HistoricoVersoesModal({
    preFichaId,
    orgId,
    onClose,
}: HistoricoVersoesModalProps) {
    const [versoes, setVersoes] = useState<
        Array<{
            id: string;
            versao: number;
            createdAt: string;
            motivoAlteracao?: string | null;
            criadoPor: string;
            dadosSnapshot: PreFichaTecnica;
        }>
    >([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersao, setSelectedVersao] = useState<PreFichaTecnica | null>(null);
    const [showComparacao, setShowComparacao] = useState(false);
    const [comparacaoData, setComparacaoData] = useState<ComparacaoVersoes | null>(null);

    useEffect(() => {
        const loadVersoes = async () => {
            setLoading(true);
            try {
                const { listarVersoesPreFichaTecnica } = await import("@/lib/api/pre-fichas-tecnicas");
                const resultado = await listarVersoesPreFichaTecnica(orgId, preFichaId);
                setVersoes(resultado.itens);
            } catch (error) {
                console.error("Erro ao carregar versões:", error);
                notificationCenter.add({
                    type: "error",
                    title: "Erro",
                    message: "Erro ao carregar histórico de versões",
                });
            } finally {
                setLoading(false);
            }
        };

        if (preFichaId && orgId) {
            void loadVersoes();
        }
    }, [preFichaId, orgId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <GlassCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 z-10 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Histórico de Versões</h2>
                        <p className="text-sm text-white/60">Acompanhe a evolução técnica da peça</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-white/40">Carregando histórico...</p>
                        </div>
                    ) : versoes.length === 0 ? (
                        <div className="text-center py-12 text-white/40">
                            <History className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p>Nenhuma versão anterior encontrada</p>
                            <p className="text-xs mt-2">Esta é a primeira versão desta pré-ficha técnica.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {versoes.map((versao) => (
                                <GlassCard key={versao.id} className="p-5 border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 font-mono">
                                                    v{versao.versao}
                                                </Badge>
                                                <span className="text-xs text-white/40">
                                                    {new Date(versao.createdAt).toLocaleDateString("pt-BR", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                            {versao.motivoAlteracao && (
                                                <p className="text-sm text-white/80 leading-relaxed italic">"{versao.motivoAlteracao}"</p>
                                            )}
                                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Autor: {versao.criadoPor}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedVersao(versao.dadosSnapshot as unknown as PreFichaTecnica)}
                                                className="text-blue-400 hover:bg-blue-400/10"
                                                title="Ver detalhes"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={async () => {
                                                    try {
                                                        const { compararVersoesPreFichaTecnica } = await import("@/lib/api/pre-fichas-tecnicas");
                                                        const comparacao = await compararVersoesPreFichaTecnica(orgId, preFichaId, versao.versao, 0);
                                                        setComparacaoData(comparacao);
                                                        setShowComparacao(true);
                                                    } catch (error) {
                                                        notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao comparar versões" });
                                                    }
                                                }}
                                                className="text-purple-400 hover:bg-purple-400/10"
                                                title="Comparar com atual"
                                            >
                                                <GitCompare className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Detail Popup inside History */}
            {selectedVersao && (
                <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4">
                    <GlassCard className="max-w-4xl w-full max-h-[85vh] overflow-y-auto p-8 border-white/20">
                        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-blue-400" />
                                Dossiê da Versão
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedVersao(null)} className="text-white/60 hover:text-white">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
                            <VersionDataField label="Código" value={selectedVersao.codigoPeca as string} />
                            <VersionDataField label="Nome" value={selectedVersao.nomePecaPiloto as string} />
                            <VersionDataField label="Status" value={selectedVersao.status as string} />
                            <VersionDataField label="Molde" value={String(selectedVersao.versaoMolde)} />
                        </div>

                        {(selectedVersao.tecidos || []).length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-xs font-semibold text-white/40 uppercase mb-3 px-1">Materiais</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(selectedVersao.tecidos || []).map((t: Tecido, i: number) => (
                                        <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                                            <p className="text-blue-300 text-xs font-medium mb-1 capitalize">{t.tipo}</p>
                                            <p className="text-white font-medium">{t.nome}</p>
                                            <p className="text-xs text-white/40">Consumo: {t.consumo}m • Largura: {t.largura}cm</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>
            )}

            {showComparacao && comparacaoData && (
                <ComparacaoVersoesModal
                    comparacao={comparacaoData}
                    onClose={() => {
                        setShowComparacao(false);
                        setComparacaoData(null);
                    }}
                />
            )}
        </div>
    );
}

function VersionDataField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-white font-medium truncate">{value || "-"}</p>
        </div>
    );
}
