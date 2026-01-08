"use client";

import { Globe, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@morina/ui";
import { FuturisticSelect } from "@/shared/ui/base/futuristic-ui";
import { SectionShell } from "../shared/section-shell";

interface SettingsTabProps {
    formData: any;
    setFormData: (data: any) => void;
}

export function SettingsTab({ formData, setFormData }: SettingsTabProps) {
    return (
        <SectionShell active={true}>
            <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
                <Settings className="h-6 w-6 text-[hsl(var(--primary))]" />
                Configurações Gerais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <label className="text-sm font-semibold text-white/90">
                                Fuso Horário (Timezone)
                            </label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Settings className="h-3 w-3 text-white/40 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Define o horário padrão para registros e logs.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <FuturisticSelect
                            label=""
                            value={formData.general?.timezone || "America/Sao_Paulo"}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    general: { ...formData.general, timezone: e.target.value },
                                })
                            }
                        >
                            <option value="America/Sao_Paulo" className="bg-[#09090b]">
                                (GMT-3) São Paulo, Brasília
                            </option>
                            <option value="America/Manaus" className="bg-[#09090b]">
                                (GMT-4) Manaus
                            </option>
                            <option value="America/Noronha" className="bg-[#09090b]">
                                (GMT-2) Fernando de Noronha
                            </option>
                        </FuturisticSelect>
                        <p className="text-xs text-white/50">
                            Horário atual do sistema: {new Date().toLocaleTimeString("pt-BR")}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <label className="text-sm font-semibold text-white/90">Idioma Padrão</label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Globe className="h-3 w-3 text-white/40 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Idioma da interface e relatórios.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <FuturisticSelect
                            label=""
                            value={formData.general?.language || "pt-BR"}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    general: { ...formData.general, language: e.target.value },
                                })
                            }
                        >
                            <option value="pt-BR" className="bg-[#09090b]">
                                🇧🇷 Português (Brasil)
                            </option>
                            <option value="en-US" className="bg-[#09090b]">
                                🇺🇸 English (US)
                            </option>
                            <option value="es-ES" className="bg-[#09090b]">
                                🇪🇸 Español
                            </option>
                        </FuturisticSelect>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <label className="text-sm font-semibold text-white/90">Moeda Padrão</label>
                        </div>
                        <FuturisticSelect
                            label=""
                            value={formData.general?.currency || "BRL"}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    general: { ...formData.general, currency: e.target.value },
                                })
                            }
                        >
                            <option value="BRL" className="bg-[#09090b]">
                                R$ Real (BRL)
                            </option>
                            <option value="USD" className="bg-[#09090b]">
                                $ Dólar (USD)
                            </option>
                            <option value="EUR" className="bg-[#09090b]">
                                € Euro (EUR)
                            </option>
                        </FuturisticSelect>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <label className="text-sm font-semibold text-white/90">Formato de Data</label>
                        </div>
                        <FuturisticSelect
                            label=""
                            value={formData.general?.dateFormat || "DD/MM/YYYY"}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    general: { ...formData.general, dateFormat: e.target.value },
                                })
                            }
                        >
                            <option value="DD/MM/YYYY" className="bg-[#09090b]">
                                DD/MM/YYYY (31/12/2024)
                            </option>
                            <option value="MM/DD/YYYY" className="bg-[#09090b]">
                                MM/DD/YYYY (12/31/2024)
                            </option>
                            <option value="YYYY-MM-DD" className="bg-[#09090b]">
                                YYYY-MM-DD (2024-12-31)
                            </option>
                        </FuturisticSelect>
                    </div>
                </div>
            </div>
        </SectionShell>
    );
}
