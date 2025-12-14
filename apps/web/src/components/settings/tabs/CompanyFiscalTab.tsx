"use client";

import { Button, GlassCard, Input, Label } from "@morina/ui";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";

interface CompanyFiscalForm {
  regimeTributarioDetalhado: string;
  aliquotaSimples: string;
  icmsConfig: {
    aliquota: string;
    st: boolean;
  };
  ipiConfig: {
    aliquota: string;
    enquadramento: string;
  };
  pisCofinsConfig: {
    aliquotaPis: string;
    aliquotaCofins: string;
  };
  certificadoDigital: File | null;
  nfeConfig: {
    serie: string;
    ambiente: "homologacao" | "producao";
  };
}

export function CompanyFiscalTab() {
  const form = useForm<CompanyFiscalForm>({
    defaultValues: {
      regimeTributarioDetalhado: "",
      aliquotaSimples: "",
      icmsConfig: {
        aliquota: "",
        st: false,
      },
      ipiConfig: {
        aliquota: "",
        enquadramento: "",
      },
      pisCofinsConfig: {
        aliquotaPis: "",
        aliquotaCofins: "",
      },
      certificadoDigital: null,
      nfeConfig: {
        serie: "",
        ambiente: "producao",
      },
    },
  });

  const onSubmit = async (data: CompanyFiscalForm) => {
    // TODO: Salvar dados fiscais via API
    console.log("Salvando dados fiscais:", data);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Regime Tributário */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Regime Tributário</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="regimeTributarioDetalhado">Regime Tributário Detalhado</Label>
              <select
                id="regimeTributarioDetalhado"
                {...form.register("regimeTributarioDetalhado")}
                className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="">Selecione...</option>
                <option value="simples-nacional">Simples Nacional</option>
                <option value="lucro-presumido">Lucro Presumido</option>
                <option value="lucro-real">Lucro Real</option>
              </select>
            </div>

            <div>
              <Label htmlFor="aliquotaSimples">Alíquota Simples Nacional (%)</Label>
              <Input
                id="aliquotaSimples"
                type="number"
                step="0.01"
                {...form.register("aliquotaSimples")}
                placeholder="0.00"
              />
            </div>
          </div>
        </GlassCard>

        {/* ICMS */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Configurações de ICMS</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="icmsAliquota">Alíquota ICMS (%)</Label>
              <Input
                id="icmsAliquota"
                type="number"
                step="0.01"
                {...form.register("icmsConfig.aliquota")}
                placeholder="18.00"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="icmsSt"
                {...form.register("icmsConfig.st")}
                className="h-4 w-4"
              />
              <Label htmlFor="icmsSt" className="mb-0">
                Utiliza Substituição Tributária (ST)
              </Label>
            </div>
          </div>
        </GlassCard>

        {/* IPI */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Configurações de IPI</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="ipiAliquota">Alíquota IPI (%)</Label>
              <Input
                id="ipiAliquota"
                type="number"
                step="0.01"
                {...form.register("ipiConfig.aliquota")}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="ipiEnquadramento">Enquadramento IPI</Label>
              <Input
                id="ipiEnquadramento"
                {...form.register("ipiConfig.enquadramento")}
                placeholder="Ex: 50.01.00"
              />
            </div>
          </div>
        </GlassCard>

        {/* PIS/COFINS */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Configurações de PIS/COFINS</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="pisAliquota">Alíquota PIS (%)</Label>
              <Input
                id="pisAliquota"
                type="number"
                step="0.01"
                {...form.register("pisCofinsConfig.aliquotaPis")}
                placeholder="1.65"
              />
            </div>

            <div>
              <Label htmlFor="cofinsAliquota">Alíquota COFINS (%)</Label>
              <Input
                id="cofinsAliquota"
                type="number"
                step="0.01"
                {...form.register("pisCofinsConfig.aliquotaCofins")}
                placeholder="7.60"
              />
            </div>
          </div>
        </GlassCard>

        {/* Certificado Digital */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Certificado Digital</h3>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Upload de Certificado Digital (.pfx ou .p12)</Label>
              <label className="mt-2 flex h-20 cursor-pointer items-center justify-center gap-2 border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                <Upload className="h-5 w-5 text-white/40" />
                <span className="text-sm text-white/60">Clique para fazer upload</span>
                <input
                  type="file"
                  accept=".pfx,.p12"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      form.setValue("certificadoDigital", file);
                    }
                  }}
                />
              </label>
              <p className="mt-1 text-xs text-white/40">
                Certificado digital A1 ou A3 para emissão de NF-e/NFC-e
              </p>
            </div>
          </div>
        </GlassCard>

        {/* NF-e/NFC-e */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Configurações de NF-e/NFC-e</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="nfeSerie">Série da NF-e</Label>
              <Input
                id="nfeSerie"
                {...form.register("nfeConfig.serie")}
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="nfeAmbiente">Ambiente</Label>
              <select
                id="nfeAmbiente"
                {...form.register("nfeConfig.ambiente")}
                className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="homologacao">Homologação</option>
                <option value="producao">Produção</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Descartar Alterações
          </Button>
          <Button type="submit">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}

