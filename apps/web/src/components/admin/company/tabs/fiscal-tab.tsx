"use client";

import { CreditCard, HelpCircle, FileText, Percent, Info } from "lucide-react";
import { FuturisticSelect, FuturisticInput } from "@/components/ui/futuristic-ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@morina/ui";
import { SectionShell } from "../shared/section-shell";

interface FiscalTabProps {
    formData: any;
    setFormData: (data: any) => void;
}

export function FiscalTab({ formData, setFormData }: FiscalTabProps) {
    return (
        <div className="space-y-6">
            <SectionShell active={true} title="Informações Tributárias">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <label className="text-sm font-semibold text-white/90">Regime Tributário</label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3 w-3 text-white/40 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Define a forma de tributação da empresa junto à Receita Federal.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <FuturisticSelect
                            label=""
                            value={formData.fiscal?.taxRegime || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    fiscal: { ...formData.fiscal, taxRegime: e.target.value },
                                })
                            }
                        >
                            <option value="" className="bg-[#09090b]">Selecione...</option>
                            <option value="SIMPLES" className="bg-[#09090b]">Simples Nacional</option>
                            <option value="PRESUMIDO" className="bg-[#09090b]">Lucro Presumido</option>
                            <option value="REAL" className="bg-[#09090b]">Lucro Real</option>
                        </FuturisticSelect>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <label className="text-sm font-semibold text-white/90">Ambiente NFe</label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3 w-3 text-white/40 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Homologação = Testes (sem valor legal). Produção = Validade jurídica.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <FuturisticSelect
                            label=""
                            value={formData.fiscal?.nfeEnvironment || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    fiscal: { ...formData.fiscal, nfeEnvironment: e.target.value },
                                })
                            }
                            disabled={formData.fiscal?.nfeEnvironment === "PRODUCAO" && true /* TODO: Logic to prevent accidental change */}
                        >
                            <option value="" className="bg-[#09090b]">Selecione...</option>
                            <option value="PRODUCAO" className="bg-[#09090b]">Produção (Válido)</option>
                            <option value="HOMOLOGACAO" className="bg-[#09090b]">Homologação (Testes)</option>
                        </FuturisticSelect>
                    </div>
                </div>
            </SectionShell>

            <SectionShell title="Identificação Estadual e Municipal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <FuturisticInput
                            label="Inscrição Estadual (IE)"
                            placeholder="Ex: 123.456.789.123"
                            value={formData.ie || ""}
                            onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                        />
                        {formData.ie && formData.ie.length < 9 && (
                            <p className="text-xs text-yellow-400/80">Inscrição Estadual parece curta</p>
                        )}
                    </div>
                    <FuturisticInput
                        label="Inscrição Municipal (IM)"
                        placeholder="Ex: 1.234.567-8"
                        value={formData.im || ""}
                        onChange={(e) => setFormData({ ...formData, im: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-1">
                        <FuturisticInput
                            label="CNAE Principal"
                            placeholder="Ex: 62.01-5-01"
                            value={formData.cnaeMain || ""}
                            onChange={(e) => setFormData({ ...formData, cnaeMain: e.target.value })}
                        />
                        <p className="text-xs text-white/40">Código Nacional de Atividade Econômica principal</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3 text-sm">
                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <p className="text-blue-200/90">
                            A tributação será calculada automaticamente com base no CNAE e Regime Tributário selecionados.
                        </p>
                    </div>
                </div>
            </SectionShell>

            {formData.fiscal?.taxRegime && formData.fiscal?.taxRegime !== "SIMPLES" && (
                <SectionShell title="Alíquotas Padrão (Estimativa)">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
                            <span className="text-sm text-white/60 block mb-1">PIS</span>
                            <span className="text-xl font-bold text-white">0.65%</span>
                        </div>
                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
                            <span className="text-sm text-white/60 block mb-1">COFINS</span>
                            <span className="text-xl font-bold text-white">3.00%</span>
                        </div>
                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
                            <span className="text-sm text-white/60 block mb-1">ISS</span>
                            <span className="text-xl font-bold text-white">2.00% - 5.00%</span>
                        </div>
                    </div>
                    <p className="text-xs text-white/40 mt-3 text-center">
                        * Valores estimados para Lucro Presumido. Configurações específicas por produto prevalecem.
                    </p>
                </SectionShell>
            )}
        </div>
    );
}
