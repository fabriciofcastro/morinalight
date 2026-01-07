"use client";

import { Button, GlassCard, Input, Label } from "@morina/ui";
import { Search, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PersonalizationPanel } from "../PersonalizationPanel";

interface CompanyGeneralForm {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  cnaePrincipal: string;
  cnaesSecundarios: string[];
  regimeTributario: string;
  dataFundacao: string;
  siteOficial: string;
  logoUrl: string;
  videoUrl: string;
}

export function CompanyGeneralTab() {
  const [searchingCnpj, setSearchingCnpj] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const form = useForm<CompanyGeneralForm>({
    defaultValues: {
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
      inscricaoEstadual: "",
      inscricaoMunicipal: "",
      cnaePrincipal: "",
      cnaesSecundarios: [],
      regimeTributario: "",
      dataFundacao: "",
      siteOficial: "",
      logoUrl: "",
      videoUrl: "",
    },
  });

  const handleSearchCnpj = async () => {
    const cnpj = form.getValues("cnpj");
    const cleanCnpj = cnpj.replace(/\D/g, "");
    
    if (!cnpj || cleanCnpj.length !== 14) {
      form.setError("cnpj", { message: "CNPJ inválido" });
      return;
    }

    setSearchingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);

      if (!response.ok) {
        form.setError("cnpj", { message: "CNPJ não encontrado na Receita Federal" });
        return;
      }

      const data = await response.json();

      // Preencher campos automaticamente
      if (data.razao_social) {
        form.setValue("razaoSocial", data.razao_social);
      }
      if (data.nome_fantasia) {
        form.setValue("nomeFantasia", data.nome_fantasia);
      }
      if (data.inscricao_estadual) {
        form.setValue("inscricaoEstadual", data.inscricao_estadual);
      }
      if (data.inscricao_municipal) {
        form.setValue("inscricaoMunicipal", data.inscricao_municipal);
      }
      if (data.cnae_fiscal_principal?.codigo) {
        form.setValue("cnaePrincipal", data.cnae_fiscal_principal.codigo);
      }
      if (data.cnaes_secundarios && Array.isArray(data.cnaes_secundarios)) {
        const cnaesSecundarios = data.cnaes_secundarios.map((cnae: { codigo: string }) => cnae.codigo);
        form.setValue("cnaesSecundarios", cnaesSecundarios);
      }
      if (data.data_inicio_atividade) {
        form.setValue("dataFundacao", data.data_inicio_atividade);
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      form.setError("cnpj", { message: "Erro ao buscar dados do CNPJ. Tente novamente." });
    } finally {
      setSearchingCnpj(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        form.setValue("logoUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUrlChange = (url: string) => {
    form.setValue("videoUrl", url);
    setVideoPreview(url);
  };

  const onSubmit = async (data: CompanyGeneralForm) => {
    // TODO: Salvar dados via API
    console.log("Salvando dados gerais:", data);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Dados Cadastrais */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Dados Cadastrais</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="razaoSocial">Razão Social *</Label>
              <Input
                id="razaoSocial"
                {...form.register("razaoSocial", { required: "Razão social é obrigatória" })}
                placeholder="MORINA TÊXTIL LTDA"
              />
              {form.formState.errors.razaoSocial && (
                <p className="mt-1 text-xs text-red-400">
                  {form.formState.errors.razaoSocial.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
                id="nomeFantasia"
                {...form.register("nomeFantasia")}
                placeholder="MORINA"
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ *</Label>
              <div className="flex gap-2">
                <Input
                  id="cnpj"
                  {...form.register("cnpj", {
                    required: "CNPJ é obrigatório",
                    pattern: {
                      value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                      message: "CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)",
                    },
                  })}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                <Button
                  type="button"
                  onClick={() => void handleSearchCnpj()}
                  disabled={searchingCnpj}
                  className="shrink-0"
                >
                  <Search className="h-4 w-4" />
                  {searchingCnpj ? "Buscando..." : "Buscar"}
                </Button>
              </div>
              {form.formState.errors.cnpj && (
                <p className="mt-1 text-xs text-red-400">
                  {form.formState.errors.cnpj.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
              <Input
                id="inscricaoEstadual"
                {...form.register("inscricaoEstadual")}
                placeholder="000.000.000.000"
              />
            </div>

            <div>
              <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
              <Input
                id="inscricaoMunicipal"
                {...form.register("inscricaoMunicipal")}
                placeholder="00000000"
              />
            </div>

            <div>
              <Label htmlFor="cnaePrincipal">CNAE Principal</Label>
              <Input
                id="cnaePrincipal"
                {...form.register("cnaePrincipal")}
                placeholder="1412-6/00"
                readOnly
              />
              <p className="mt-1 text-xs text-white/40">
                Preenchido automaticamente via busca de CNPJ
              </p>
            </div>

            <div>
              <Label htmlFor="regimeTributario">Regime Tributário</Label>
              <select
                id="regimeTributario"
                {...form.register("regimeTributario")}
                className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="">Selecione...</option>
                <option value="simples-nacional">Simples Nacional</option>
                <option value="lucro-presumido">Lucro Presumido</option>
                <option value="lucro-real">Lucro Real</option>
              </select>
            </div>

            <div>
              <Label htmlFor="dataFundacao">Data de Fundação</Label>
              <Input
                id="dataFundacao"
                type="date"
                {...form.register("dataFundacao")}
              />
            </div>

            <div>
              <Label htmlFor="siteOficial">Site Oficial</Label>
              <Input
                id="siteOficial"
                type="url"
                {...form.register("siteOficial")}
                placeholder="https://www.morina.com.br"
              />
            </div>
          </div>
        </GlassCard>

        {/* Identidade Visual */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Identidade Visual</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Logo Upload */}
            <div>
              <Label htmlFor="logoUpload">Logo da Empresa</Label>
              <div className="mt-2 flex flex-col gap-3">
                {logoPreview ? (
                  <div className="relative">
                    {/* biome-ignore lint/a11y/useAltText: imagem de preview com alt já presente */}
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-32 w-32 object-contain border border-white/10 bg-white/5 p-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        form.setValue("logoUrl", "");
                      }}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-red-500 text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex h-32 w-32 cursor-pointer items-center justify-center border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                    <Upload className="h-6 w-6 text-white/40" />
                    <input
                      id="logoUpload"
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs text-white/40">
                  PNG, JPG ou SVG. Máximo 2MB. Fundo transparente recomendado.
                </p>
              </div>
            </div>

            {/* Vídeo Institucional */}
            <div>
              <Label htmlFor="videoUrl">Vídeo Institucional</Label>
              <div className="mt-2 flex flex-col gap-3">
                <Input
                  id="videoUrl"
                  {...form.register("videoUrl", {
                    onChange: (e) => {
                      setVideoPreview(e.target.value);
                    },
                  })}
                  placeholder="URL do YouTube ou Vimeo"
                />
                {videoPreview && (
                  <div className="relative aspect-video border border-white/10 bg-black/20">
                    <iframe
                      src={videoPreview}
                      className="h-full w-full"
                      title="Vídeo institucional"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <p className="text-xs text-white/40">
                  Cole a URL do YouTube ou Vimeo. Vídeos curtos (até 8s) recomendados.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Personalização (Tema) - Reutiliza componente existente */}
        <PersonalizationPanel />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Descartar Alterações
          </Button>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  );
}

