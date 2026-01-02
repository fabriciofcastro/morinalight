"use client";

import { Building2, Globe, Loader2, HelpCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@morina/ui";
import { notificationCenter } from "@/components/notifications/notification-center";
import { buscarCnpj, formatarCnpj, validarCnpj } from "@/lib/integrations/cnpj";
import { SectionShell } from "../shared/section-shell";
import { SmartUploadZone } from "../intelligence/smart-upload-zone";

interface GeneralTabProps {
    formData: any;
    setFormData: (data: any) => void;
    errors: Record<string, string>;
}

export function GeneralTab({ formData, setFormData, errors }: GeneralTabProps) {
    const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);

    // Buscar CNPJ
    const buscarPorCNPJ = useCallback(async (cnpj: string) => {
        const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
        if (cnpjLimpo.length !== 14 || !validarCnpj(cnpjLimpo)) return;

        setBuscandoCNPJ(true);
        try {
            const resultado = await buscarCnpj(cnpj);
            if (resultado) {
                setFormData((prev: any) => ({
                    ...prev,
                    legalName: resultado.razaoSocial || prev.legalName,
                    name: resultado.nomeFantasia || resultado.razaoSocial || prev.name,
                    address: {
                        ...prev.address,
                        street: resultado.endereco.logradouro || prev.address?.street,
                        number: resultado.endereco.numero || prev.address?.number,
                        complement: resultado.endereco.complemento || prev.address?.complement,
                        neighborhood: resultado.endereco.bairro || prev.address?.neighborhood,
                        city: resultado.endereco.cidade || prev.address?.city,
                        state: resultado.endereco.estado || prev.address?.state,
                        zipCode: resultado.endereco.cep || prev.address?.zipCode,
                    },
                    phone: resultado.telefone || prev.phone,
                }));

                notificationCenter.add({
                    type: "success",
                    title: "Dados importados",
                    message: "Informações da Receita Federal carregadas!",
                });
            }
        } catch (error) {
            console.error("Erro ao buscar CNPJ:", error);
        } finally {
            setBuscandoCNPJ(false);
        }
    }, [setFormData]);

const handleDataExtracted = (extracted: any) => {
    // Simple merge for POC
    setFormData((prev: any) => ({
        ...prev,
        ...extracted,
        // Deep merge address if exists
        address: {
            ...prev.address,
            ...(extracted.address || {})
        }
    }));
};

return (
    <SectionShell active={true}>
        <SmartUploadZone onDataExtracted={handleDataExtracted} />

        <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[hsl(var(--primary))]" />
            Dados Básicos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FuturisticInput
                label="Nome Fantasia"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                errorMessage={errors.name}
                placeholder="Nome da sua empresa"
            />

            <FuturisticInput
                label="Razão Social"
                required
                value={formData.legalName || ""}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                error={!!errors.legalName}
                errorMessage={errors.legalName}
                placeholder="Razão social completa"
            />

            <FuturisticInput
                label="Inscrição Estadual"
                value={formData.ie || ""}
                onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                placeholder="000.000.000.000"
            />

            <FuturisticInput
                label="Website"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://suaempresa.com.br"
                icon={Globe}
            />

            <FuturisticInput
                label="Data de Fundação"
                type="date"
                value={formData.foundedAt || ""}
                onChange={(e) => setFormData({ ...formData, foundedAt: e.target.value })}
            />

            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <label className="text-sm font-semibold text-white/90">CNPJ</label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3 w-3 text-white/40 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Digite apenas números. A busca na Receita é automática.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <FuturisticInput
                            label=""
                            value={formData.cnpj || ""}
                            onChange={(e) => {
                                const formatted = formatarCnpj(e.target.value);
                                setFormData({ ...formData, cnpj: formatted });
                                if (formatted.replace(/[^\d]/g, "").length === 14) {
                                    buscarPorCNPJ(formatted);
                                }
                            }}
                            error={!!errors.cnpj}
                            errorMessage={errors.cnpj}
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                        />
                    </div>
                </div>
                {buscandoCNPJ && <Loader2 className="mb-4 h-6 w-6 animate-spin text-white/50" />}
            </div>

            <FuturisticSelect
                label="Porte da Empresa"
                value={formData.companySize || ""}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
            >
                <option value="" className="bg-[#09090b]">
                    Selecione...
                </option>
                <option value="MEI" className="bg-[#09090b]">
                    MEI
                </option>
                <option value="ME" className="bg-[#09090b]">
                    Microempresa (ME)
                </option>
                <option value="EPP" className="bg-[#09090b]">
                    Empresa de Pequeno Porte (EPP)
                </option>
                <option value="MEDIO" className="bg-[#09090b]">
                    Médio Porte
                </option>
                <option value="GRANDE" className="bg-[#09090b]">
                    Grande Porte
                </option>
            </FuturisticSelect>

            <FuturisticInput
                label="Email Comercial"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!errors.email}
                errorMessage={errors.email}
                placeholder="contato@empresa.com"
            />

            <FuturisticInput
                label="Telefone Principal"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
            />
        </div>
    </SectionShell>
);
}
