"use client";

import { PreFichaTecnica } from "@/lib/api/pre-fichas-tecnicas";
import { Button, GlassCard } from "@morina/ui";
import { X, Download, Printer, FileText, CheckCircle2 } from "lucide-react";
import { formatDate } from "../../utils";
import { STATUS_LABELS } from "../../constants";

interface PreFichaPdfPreviewModalProps {
    preFicha: PreFichaTecnica;
    onClose: () => void;
    onDownload: () => void;
}

export function PreFichaPdfPreviewModal({
    preFicha,
    onClose,
    onDownload,
}: PreFichaPdfPreviewModalProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
            <div className="w-full max-w-5xl h-full flex flex-col print:h-auto">
                {/* Toolbar - Hidden on print */}
                <div className="flex items-center justify-between mb-4 bg-white/5 p-4 rounded-xl border border-white/10 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600/20 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Visualização de Documento</h3>
                            <p className="text-xs text-white/40">Ref: {preFicha.codigoPeca} - v{preFicha.versaoAtual}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handlePrint} className="text-white/60 hover:text-white">
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onDownload} className="text-white/60 hover:text-white">
                            <Download className="w-4 h-4 mr-2" />
                            Baixar PDF
                        </Button>
                        <div className="w-px h-6 bg-white/10 mx-2" />
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Paper Layout */}
                <div className="flex-1 bg-[#1a1a1b] p-8 overflow-y-auto flex justify-center print:bg-white print:p-0 print:overflow-visible">
                    <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] text-black font-serif relative print:shadow-none print:w-full">

                        {/* Watermark for draft */}
                        {preFicha.status === "rascunho" && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.03]">
                                <span className="text-[120px] font-bold -rotate-45 uppercase select-none">Rascunho</span>
                            </div>
                        )}

                        {/* Document Header */}
                        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter">MORINA</h1>
                                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Industrial & Technical Division</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold uppercase">Pré-Ficha Técnica</h2>
                                <div className="mt-1 space-y-0.5">
                                    <p className="text-sm font-bold">Nº CONTROLE: <span className="bg-black text-white px-2 py-0.5">{String(preFicha.numeroSequencial).padStart(5, '0')}</span></p>
                                    <p className="text-[10px] text-gray-500 uppercase">Emitido em: {formatDate(new Date().toISOString())}</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Info Grid */}
                        <div className="grid grid-cols-3 gap-6 mb-8 bg-gray-50 p-4 border border-gray-200">
                            <div className="col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <DocField label="Referência / Código" value={preFicha.codigoPeca} />
                                    <DocField label="Nome da Peça" value={preFicha.nomePecaPiloto} />
                                    <DocField label="Categoria" value={preFicha.categoria || "N/A"} />
                                    <DocField label="Status" value={STATUS_LABELS[preFicha.status]} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                                    <DocField label="Estilista" value={preFicha.estilistaNome} />
                                    <DocField label="Modelista" value={preFicha.modelistaNome} />
                                </div>
                            </div>
                            <div className="col-span-1 border-l border-gray-200 pl-6">
                                <DocField label="Versão Atual" value={`v${preFicha.versaoAtual}`} />
                                <DocField label="Versão Molde" value={preFicha.versaoMolde.toString()} />
                                <DocField label="Grade" value={preFicha.gradeTamanhos?.join(" / ") || "-"} />
                            </div>
                        </div>

                        {/* Photo Section */}
                        <div className="grid grid-cols-12 gap-8 mb-8">
                            <div className="col-span-5 h-[80mm] border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                                {preFicha.fotoPecaUrl ? (
                                    <img src={preFicha.fotoPecaUrl} className="w-full h-full object-contain" alt="Peça Piloto" />
                                ) : (
                                    <div className="text-gray-300 flex flex-col items-center">
                                        <FileText className="w-12 h-12" />
                                        <span className="text-xs mt-2 uppercase font-bold text-gray-400">Sem Imagem</span>
                                    </div>
                                )}
                            </div>
                            <div className="col-span-7 space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold uppercase border-b border-black mb-2 pb-1">Análise de Medidas Críticas</h3>
                                    <div className="text-sm min-h-[30mm] text-gray-600 italic">
                                        {preFicha.medidasCriticas || "Nenhuma medida crítica registrada para esta versão."}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase border-b border-black mb-2 pb-1">Conformidade Técnica (Checklist)</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        <DocCheck label="Molde veste corretamente" checked={preFicha.checklistTecnico?.moldeVesteCorretamente} />
                                        <DocCheck label="Produção viável (Costura)" checked={preFicha.checklistTecnico?.costuraViavel} />
                                        <DocCheck label="Insumos compatíveis" checked={preFicha.checklistTecnico?.insumosCompatíveis} />
                                        <DocCheck label="Protótipo aprovado visualmente" checked={preFicha.checklistTecnico?.pecaPilotoAprovadaVisualmente} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Materials Tables */}
                        <div className="space-y-8 mb-8">
                            <div>
                                <h3 className="text-xs font-bold uppercase bg-black text-white px-3 py-1 mb-3">01. Composição de Tecidos e Forros</h3>
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-black">
                                            <th className="text-left py-2 font-bold uppercase">Tipo</th>
                                            <th className="text-left py-2 font-bold uppercase">Descrição do Material</th>
                                            <th className="text-right py-2 font-bold uppercase">Consumo (m)</th>
                                            <th className="text-right py-2 font-bold uppercase">Largura (cm)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {preFicha.tecidos.map((t, i) => (
                                            <tr key={i}>
                                                <td className="py-2 uppercase font-bold text-gray-500">{t.tipo}</td>
                                                <td className="py-2">{t.nome} {t.especificacao && <span className="text-gray-400 ml-1">({t.especificacao})</span>}</td>
                                                <td className="py-2 text-right font-bold">{t.consumo.toFixed(2)}</td>
                                                <td className="py-2 text-right">{t.largura}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {preFicha.insumosTecnicos.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase bg-black text-white px-3 py-1 mb-3">02. Complementos e Insumos Técnicos</h3>
                                    <table className="w-full text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-black">
                                                <th className="text-left py-2 font-bold uppercase">Insumo</th>
                                                <th className="text-left py-2 font-bold uppercase">Tipo</th>
                                                <th className="text-right py-2 font-bold uppercase">Qtd Base</th>
                                                <th className="text-right py-2 font-bold uppercase">Unidade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {preFicha.insumosTecnicos.map((ins, i) => (
                                                <tr key={i}>
                                                    <td className="py-2 font-bold">{ins.descricao}</td>
                                                    <td className="py-2 uppercase text-gray-500">{ins.tipo}</td>
                                                    <td className="py-2 text-right font-bold">{ins.quantidadeBase}</td>
                                                    <td className="py-2 text-right uppercase">{ins.unidadeMedida}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Observations */}
                        <div className="grid grid-cols-2 gap-8 mb-12 border-t border-black pt-6">
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-1">Notas da Engenharia</h4>
                                <p className="text-xs text-justify">{preFicha.observacoesTecnicas || "Nenhuma observação técnica adicional."}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-1">Instruções de Oficina</h4>
                                <p className="text-xs text-justify">{preFicha.observacoesOficina || "Seguir padrões de costura Morina."}</p>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="mt-auto grid grid-cols-3 gap-8 pt-12">
                            <SignatureLine label="Estilo / Criação" date={preFicha.createdAt} />
                            <SignatureLine label="Modelagem / Técnica" date={preFicha.dataAprovacaoTecnica} />
                            <SignatureLine label="Diretoria / Corte" date={preFicha.dataAprovacaoDiretoria} />
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-8 left-[20mm] right-[20mm] flex justify-between items-center text-[8px] text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-2">
                            <span>Morina ERP Integration - Technical Sheet Prototype</span>
                            <span>Página 01 / 01</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DocField({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-[9px] font-bold uppercase text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-bold uppercase tracking-tight">{value || "---"}</p>
        </div>
    );
}

function DocCheck({ label, checked }: { label: string; checked?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-4 h-4 border border-black flex items-center justify-center ${checked ? 'bg-black' : ''}`}>
                {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <span className="text-xs font-bold uppercase">{label}</span>
        </div>
    );
}

function SignatureLine({ label, date }: { label: string; date?: string | null }) {
    return (
        <div className="text-center">
            <div className="border-b border-black mb-1 w-full h-8" />
            <p className="text-[9px] font-bold uppercase">{label}</p>
            <p className="text-[8px] text-gray-400">{date ? formatDate(date) : "___/___/___"}</p>
        </div>
    );
}
