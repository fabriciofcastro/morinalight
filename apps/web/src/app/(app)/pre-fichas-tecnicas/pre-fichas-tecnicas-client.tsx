"use client";

import { Button, FormField, FormSelect, GlassCard, Input } from "@morina/ui";
import {
  CheckCircle2,
  FileText,
  Plus,
  Search,
  Send,
  XCircle,
  Eye,
  Check,
  X,
  Package,
  Trash2,
  Calendar,
  ClipboardCheck,
  Upload,
  History,
  Users,
  Ruler,
  Scissors,
  Download,
  Edit,
  GitCompare,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { usePreFichasTecnicas, usePreFichaTecnica } from "@/hooks/use-pre-fichas-tecnicas";
import type {
  PreFichaTecnica,
  StatusPreFichaTecnica,
  TipoTecido,
  TipoInsumoTecnico,
  UnidadeMedida,
  CreateTecidoInput,
  CreateInsumoTecnicoInput,
} from "@/lib/api/pre-fichas-tecnicas";
import { Badge } from "@/components/ui/badge";
import { apiUrl } from "@/lib/env";
import { ComparacaoVersoesModal } from "./comparacao-versoes-modal";

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) {
    return selectedOrgId;
  }
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) {
        return orgs[0].organizationId;
      }
    } catch {
      // Ignorar erro de parsing
    }
  }
  return null;
}

type FiltroStatus = "all" | StatusPreFichaTecnica;

const STATUS_COLORS: Record<StatusPreFichaTecnica, string> = {
  rascunho: "bg-gray-500",
  submetida_para_revisao_tecnica: "bg-blue-500",
  em_revisao_ficha_tecnica: "bg-yellow-500",
  aprovada_tecnicamente: "bg-green-500",
  aguardando_aval_diretoria: "bg-purple-500",
  liberada_para_producao_piloto: "bg-emerald-600",
  reprovada: "bg-red-500",
};

const STATUS_LABELS: Record<StatusPreFichaTecnica, string> = {
  rascunho: "Rascunho",
  submetida_para_revisao_tecnica: "Submetida para Revisão",
  em_revisao_ficha_tecnica: "Em Revisão",
  aprovada_tecnicamente: "Aprovada Tecnicamente",
  aguardando_aval_diretoria: "Aguardando Diretoria",
  liberada_para_producao_piloto: "Liberada para Produção",
  reprovada: "Reprovada",
};

const GRADE_TAMANHOS = ["PP", "P", "M", "G", "GG", "XG"];

export function PreFichasTecnicasClient() {
  const orgId = getCurrentOrgId() || "";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FiltroStatus>("all");
  const [pagina, setPagina] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingPreFicha, setEditingPreFicha] = useState<PreFichaTecnica | null>(null);
  const [selectedPreFicha, setSelectedPreFicha] = useState<PreFichaTecnica | null>(null);
  const [showHistorico, setShowHistorico] = useState(false);
  const [pending, startTransition] = useTransition();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { preFichas, total, totalPaginas, loading, listar } = usePreFichasTecnicas(orgId);
  const {
    buscar,
    criar,
    atualizar,
    submeter,
    aprovarTecnicamente,
    reprovar,
    aprovarDiretoria,
    atualizarChecklist,
    exportarPdf,
    compararVersoes,
    preFicha,
  } = usePreFichaTecnica(orgId);

  // Form data
  const [formData, setFormData] = useState({
    codigoPeca: "",
    nomePecaPiloto: "",
    categoria: "",
    fotoPecaUrl: "",
    fotoPecaStorageKey: "",
    gradeTamanhos: [] as string[],
    observacoesTecnicas: "",
    observacoesOficina: "",
    tecidos: [] as CreateTecidoInput[],
    insumosTecnicos: [] as CreateInsumoTecnicoInput[],
    estilistaId: "",
    estilistaNome: "",
    modelistaId: "",
    modelistaNome: "",
    piloteiroId: "",
    piloteiroNome: "",
    houveAlteracao: false,
    descricaoAlteracao: "",
  });

  // Tecido form
  const [tecidoForm, setTecidoForm] = useState<CreateTecidoInput>({
    tipo: "principal",
    nome: "",
    especificacao: "",
    consumo: 0,
    largura: 0,
    quantidadePartes: 1,
    observacoesTecnicas: "",
  });

  // Insumo técnico form
  const [insumoTecnicoForm, setInsumoTecnicoForm] = useState<CreateInsumoTecnicoInput>({
    descricao: "",
    tipo: "linha",
    quantidadeBase: 1,
    consumoPorTamanho: null,
    unidadeMedida: "unidade",
    observacoesTecnicas: "",
  });

  // Consumo por tamanho (para insumo técnico)
  const [consumoPorTamanho, setConsumoPorTamanho] = useState<{ [key: string]: number }>({});

  const loadPreFichas = useCallback(async () => {
    const filtro: {
      pagina: number;
      tamanhoPagina: number;
      status?: string[];
      busca?: string;
    } = {
      pagina,
      tamanhoPagina: 20,
    };

    if (statusFilter !== "all") {
      filtro.status = [statusFilter];
    }

    if (search.length >= 2) {
      filtro.busca = search;
    }

    await listar(filtro);
  }, [listar, pagina, statusFilter, search]);

  useEffect(() => {
    if (orgId) {
      void loadPreFichas();
    }
  }, [loadPreFichas, orgId]);

  // Carregar detalhes quando selecionar
  useEffect(() => {
    if (selectedPreFicha) {
      void buscar(selectedPreFicha.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPreFicha]);

  // Upload de foto
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Formato não suportado. Use JPEG, PNG ou WebP",
      });
      return;
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Arquivo muito grande. Tamanho máximo: 5MB",
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      // Criar preview imediato
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload para a API
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("orgId", orgId);

      const response = await fetch("/api/pre-fichas-tecnicas/upload-foto", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Erro ao fazer upload" }));
        throw new Error(error.message || "Erro ao fazer upload da foto");
      }

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        fotoPecaUrl: data.url,
        fotoPecaStorageKey: data.storageKey,
      }));

      notificationCenter.add({
        type: "success",
        title: "Foto carregada",
        message: "Foto da peça piloto carregada com sucesso",
      });
    } catch (error: any) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: error?.message || "Erro ao fazer upload da foto",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddTecido = () => {
    if (!tecidoForm.nome || tecidoForm.consumo <= 0 || tecidoForm.largura <= 0) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Preencha todos os campos obrigatórios do tecido",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tecidos: [...prev.tecidos, { ...tecidoForm }],
    }));

    setTecidoForm({
      tipo: "principal",
      nome: "",
      especificacao: "",
      consumo: 0,
      largura: 0,
      quantidadePartes: 1,
      observacoesTecnicas: "",
    });
  };

  const handleRemoveTecido = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tecidos: prev.tecidos.filter((_, i) => i !== index),
    }));
  };

  const handleAddInsumoTecnico = () => {
    if (!insumoTecnicoForm.descricao || insumoTecnicoForm.quantidadeBase <= 0) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Preencha todos os campos obrigatórios do insumo técnico",
      });
      return;
    }

    // Se há grade de tamanhos, usar consumo por tamanho
    const consumoPorTamanhoFinal =
      formData.gradeTamanhos.length > 0 && Object.keys(consumoPorTamanho).length > 0
        ? consumoPorTamanho
        : null;

    setFormData((prev) => ({
      ...prev,
      insumosTecnicos: [
        ...prev.insumosTecnicos,
        { ...insumoTecnicoForm, consumoPorTamanho: consumoPorTamanhoFinal },
      ],
    }));

    setInsumoTecnicoForm({
      descricao: "",
      tipo: "linha",
      quantidadeBase: 1,
      consumoPorTamanho: null,
      unidadeMedida: "unidade",
      observacoesTecnicas: "",
    });
    setConsumoPorTamanho({});
  };

  const handleRemoveInsumoTecnico = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      insumosTecnicos: prev.insumosTecnicos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigoPeca || !formData.nomePecaPiloto || formData.tecidos.length === 0) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Preencha todos os campos obrigatórios (código, nome e pelo menos um tecido)",
      });
      return;
    }

    if (!formData.fotoPecaUrl) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Foto da peça piloto é obrigatória",
      });
      return;
    }

    startTransition(async () => {
      try {
        if (editingPreFicha) {
          // Atualizar
          await atualizar(editingPreFicha.id, {
            ...formData,
            fotoPecaStorageKey: formData.fotoPecaStorageKey || formData.fotoPecaUrl,
            gradeTamanhos: formData.gradeTamanhos.length > 0 ? formData.gradeTamanhos : null,
            observacoesTecnicas: formData.observacoesTecnicas || null,
            observacoesOficina: formData.observacoesOficina || null,
            estilistaId: formData.estilistaId || null,
            estilistaNome: formData.estilistaNome || null,
            modelistaId: formData.modelistaId || null,
            modelistaNome: formData.modelistaNome || null,
            piloteiroId: formData.piloteiroId || null,
            piloteiroNome: formData.piloteiroNome || null,
            tecidos: formData.tecidos,
            insumosTecnicos: formData.insumosTecnicos,
            motivoAlteracao: formData.houveAlteracao ? formData.descricaoAlteracao : undefined,
          });
          notificationCenter.add({
            type: "success",
            title: "Pré-ficha atualizada",
            message: "Pré-ficha técnica atualizada com sucesso",
          });
        } else {
          // Criar
          await criar({
            ...formData,
            fotoPecaStorageKey: formData.fotoPecaStorageKey || formData.fotoPecaUrl,
            gradeTamanhos: formData.gradeTamanhos.length > 0 ? formData.gradeTamanhos : null,
            observacoesTecnicas: formData.observacoesTecnicas || null,
            observacoesOficina: formData.observacoesOficina || null,
            estilistaId: formData.estilistaId || null,
            estilistaNome: formData.estilistaNome || null,
            modelistaId: formData.modelistaId || null,
            modelistaNome: formData.modelistaNome || null,
            piloteiroId: formData.piloteiroId || null,
            piloteiroNome: formData.piloteiroNome || null,
          });
          notificationCenter.add({
            type: "success",
            title: "Pré-ficha criada",
            message: "Pré-ficha técnica criada com sucesso",
          });
        }

        setShowForm(false);
        setEditingPreFicha(null);
        setPhotoPreview(null);
        setFormData({
          codigoPeca: "",
          nomePecaPiloto: "",
          categoria: "",
          fotoPecaUrl: "",
          fotoPecaStorageKey: "",
          gradeTamanhos: [],
          observacoesTecnicas: "",
          observacoesOficina: "",
          tecidos: [],
          insumosTecnicos: [],
          estilistaId: "",
          estilistaNome: "",
          modelistaId: "",
          modelistaNome: "",
          piloteiroId: "",
          piloteiroNome: "",
          houveAlteracao: false,
          descricaoAlteracao: "",
        });
        await loadPreFichas();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: errorMessage || "Erro ao salvar pré-ficha",
        });
      }
    });
  };

  const handleEditar = (preFicha: PreFichaTecnica) => {
    setEditingPreFicha(preFicha);
    setFormData({
      codigoPeca: preFicha.codigoPeca,
      nomePecaPiloto: preFicha.nomePecaPiloto,
      categoria: preFicha.categoria || "",
      fotoPecaUrl: preFicha.fotoPecaUrl || "",
      fotoPecaStorageKey: preFicha.fotoPecaStorageKey || "",
      gradeTamanhos: preFicha.gradeTamanhos || [],
      observacoesTecnicas: preFicha.observacoesTecnicas || "",
      observacoesOficina: preFicha.observacoesOficina || "",
      tecidos: preFicha.tecidos || [],
      insumosTecnicos: preFicha.insumosTecnicos || [],
      estilistaId: preFicha.estilistaId || "",
      estilistaNome: preFicha.estilistaNome || "",
      modelistaId: preFicha.modelistaId || "",
      modelistaNome: preFicha.modelistaNome || "",
      piloteiroId: preFicha.piloteiroId || "",
      piloteiroNome: preFicha.piloteiroNome || "",
      houveAlteracao: false,
      descricaoAlteracao: "",
    });
    setShowForm(true);
  };

  const handleExportarPdf = async (preFicha: PreFichaTecnica) => {
    startTransition(async () => {
      try {
        await exportarPdf(preFicha.id);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: errorMessage || "Erro ao exportar PDF",
        });
      }
    });
  };

  const handleSubmeter = async (preFicha: PreFichaTecnica) => {
    startTransition(async () => {
      try {
        await submeter(preFicha.id);
        notificationCenter.add({
          type: "success",
          title: "Submetida",
          message: "Pré-ficha técnica submetida para revisão",
        });
        await loadPreFichas();
        if (selectedPreFicha?.id === preFicha.id) {
          const updated = await buscar(preFicha.id);
          setSelectedPreFicha(updated);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: errorMessage || "Erro ao submeter pré-ficha",
        });
      }
    });
  };

  const handleAprovarTecnicamente = async (preFicha: PreFichaTecnica) => {
    startTransition(async () => {
      try {
        await aprovarTecnicamente(preFicha.id, "Aprovador Técnico");
        notificationCenter.add({
          type: "success",
          title: "Aprovada",
          message: "Pré-ficha técnica aprovada tecnicamente",
        });
        await loadPreFichas();
        if (selectedPreFicha?.id === preFicha.id) {
          const updated = await buscar(preFicha.id);
          setSelectedPreFicha(updated);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: errorMessage || "Erro ao aprovar pré-ficha",
        });
      }
    });
  };

  const handleReprovar = async (preFicha: PreFichaTecnica, justificativa: string) => {
    if (!justificativa || justificativa.trim().length < 10) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Justificativa deve ter pelo menos 10 caracteres",
      });
      return;
    }

    startTransition(async () => {
      try {
        await reprovar(preFicha.id, justificativa);
        notificationCenter.add({
          type: "success",
          title: "Reprovada",
          message: "Pré-ficha técnica reprovada",
        });
        await loadPreFichas();
        if (selectedPreFicha?.id === preFicha.id) {
          const updated = await buscar(preFicha.id);
          setSelectedPreFicha(updated);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: errorMessage || "Erro ao reprovar pré-ficha",
        });
      }
    });
  };

  const handleAprovarDiretoria = async (preFicha: PreFichaTecnica) => {
    startTransition(async () => {
      try {
        await aprovarDiretoria(preFicha.id, "Diretoria");
        notificationCenter.add({
          type: "success",
          title: "Aprovada",
          message: "Pré-ficha técnica liberada para produção piloto",
        });
        await loadPreFichas();
        if (selectedPreFicha?.id === preFicha.id) {
          const updated = await buscar(preFicha.id);
          setSelectedPreFicha(updated);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: errorMessage || "Erro ao aprovar pela diretoria",
        });
      }
    });
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pré-Fichas Técnicas</h1>
          <p className="text-gray-400 mt-1">Lista de Moldes Liberados</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingPreFicha(null);
            setPhotoPreview(null);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Pré-Ficha
        </Button>
      </div>

      {/* Filtros */}
      <GlassCard className="p-4">
        <div className="flex gap-4 items-end">
          <FormField label="Buscar" className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código, nome ou categoria..."
                className="pl-10"
              />
            </div>
          </FormField>
          <FormField label="Status">
            <FormSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FiltroStatus)}
            >
              <option value="all">Todos</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>
      </GlassCard>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : preFichas.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Nenhuma pré-ficha técnica encontrada</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {preFichas.map((preFicha) => (
            <GlassCard key={preFicha.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {preFicha.fotoPecaUrl && (
                      <img
                        src={preFicha.fotoPecaUrl}
                        alt={preFicha.nomePecaPiloto}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">{preFicha.nomePecaPiloto}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={STATUS_COLORS[preFicha.status]}>
                          {STATUS_LABELS[preFicha.status]}
                        </Badge>
                        <span className="text-sm text-gray-400">#{preFicha.numeroSequencial}</span>
                        <span className="text-sm text-gray-400">v{preFicha.versaoMolde}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-400">Código:</span>
                      <p className="text-white">{preFicha.codigoPeca}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Categoria:</span>
                      <p className="text-white">{preFicha.categoria || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Tecidos:</span>
                      <p className="text-white">{preFicha.tecidos?.length || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Insumos:</span>
                      <p className="text-white">{preFicha.insumosTecnicos?.length || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPreFicha(preFicha);
                    }}
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {preFicha.status === "rascunho" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSubmeter(preFicha)}
                      disabled={pending}
                      title="Submeter para revisão"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                  {preFicha.status === "em_revisao_ficha_tecnica" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAprovarTecnicamente(preFicha)}
                        disabled={pending}
                        className="text-green-500"
                        title="Aprovar tecnicamente"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const justificativa = prompt("Justificativa da reprovação:");
                          if (justificativa) {
                            handleReprovar(preFicha, justificativa);
                          }
                        }}
                        disabled={pending}
                        className="text-red-500"
                        title="Reprovar"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {preFicha.status === "aguardando_aval_diretoria" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAprovarDiretoria(preFicha)}
                      disabled={pending}
                      className="text-emerald-500"
                      title="Aprovar pela diretoria"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-gray-400">
            Página {pagina} de {totalPaginas} ({total} pré-fichas)
          </span>
          <Button
            variant="outline"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Modal de Detalhes Completo */}
      {selectedPreFicha && (
        <PreFichaTecnicaDetailModal
          preFicha={selectedPreFicha}
          onClose={() => {
            setSelectedPreFicha(null);
          }}
          onSubmeter={handleSubmeter}
          onAprovarTecnicamente={handleAprovarTecnicamente}
          onReprovar={handleReprovar}
          onAprovarDiretoria={handleAprovarDiretoria}
          onShowHistorico={() => setShowHistorico(true)}
          onExportarPdf={() => handleExportarPdf(selectedPreFicha)}
          onEditar={() => handleEditar(selectedPreFicha)}
          onAtualizarChecklist={atualizarChecklist}
          onCompararVersoes={compararVersoes}
          onBuscar={async (id: string) => {
            const updated = await buscar(id);
            setSelectedPreFicha(updated);
            return updated;
          }}
          isLoading={pending}
        />
      )}

      {/* Modal de Histórico/Versões */}
      {showHistorico && selectedPreFicha && (
        <HistoricoVersoesModal
          preFichaId={selectedPreFicha.id}
          orgId={orgId}
          onClose={() => setShowHistorico(false)}
        />
      )}

      {/* Formulário Completo */}
      {showForm && (
        <PreFichaTecnicaFormModal
          editingPreFicha={editingPreFicha}
          formData={formData}
          setFormData={setFormData}
          tecidoForm={tecidoForm}
          setTecidoForm={setTecidoForm}
          insumoTecnicoForm={insumoTecnicoForm}
          setInsumoTecnicoForm={setInsumoTecnicoForm}
          consumoPorTamanho={consumoPorTamanho}
          setConsumoPorTamanho={setConsumoPorTamanho}
          photoPreview={photoPreview}
          setPhotoPreview={setPhotoPreview}
          uploadingPhoto={uploadingPhoto}
          onPhotoUpload={handlePhotoUpload}
          onAddTecido={handleAddTecido}
          onRemoveTecido={handleRemoveTecido}
          onAddInsumoTecnico={handleAddInsumoTecnico}
          onRemoveInsumoTecnico={handleRemoveInsumoTecnico}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingPreFicha(null);
            setPhotoPreview(null);
          }}
          pending={pending}
        />
      )}
    </div>
  );
}

// Componente de Modal de Detalhes Completo
function PreFichaTecnicaDetailModal({
  preFicha,
  onClose,
  onSubmeter,
  onAprovarTecnicamente,
  onReprovar,
  onAprovarDiretoria,
  onShowHistorico,
  isLoading,
}: {
  preFicha: PreFichaTecnica;
  onClose: () => void;
  onSubmeter: (preFicha: PreFichaTecnica) => void;
  onAprovarTecnicamente: (preFicha: PreFichaTecnica) => void;
  onReprovar: (preFicha: PreFichaTecnica, justificativa: string) => void;
  onAprovarDiretoria: (preFicha: PreFichaTecnica) => void;
  onShowHistorico: () => void;
  isLoading: boolean;
}) {
  const [showReprovarForm, setShowReprovarForm] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Pré-Ficha #{preFicha.numeroSequencial}
            </h2>
            <p className="text-gray-400">{preFicha.codigoPeca}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onShowHistorico} title="Ver histórico">
              <History className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onExportarPdf} title="Exportar PDF">
              <Download className="w-4 h-4" />
            </Button>
            {preFicha.status === "rascunho" && (
              <Button variant="ghost" size="sm" onClick={onEditar} title="Editar">
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status e Ações */}
          <div className="flex items-center justify-between">
            <Badge className={STATUS_COLORS[preFicha.status]}>
              {STATUS_LABELS[preFicha.status]}
            </Badge>
            <div className="flex gap-2">
              {preFicha.status === "rascunho" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSubmeter(preFicha)}
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submeter para Revisão
                </Button>
              )}
              {preFicha.status === "em_revisao_ficha_tecnica" && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAprovarTecnicamente(preFicha)}
                    disabled={isLoading}
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
                    <X className="w-4 h-4 mr-2" />
                    Reprovar
                  </Button>
                </>
              )}
              {preFicha.status === "aguardando_aval_diretoria" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAprovarDiretoria(preFicha)}
                  disabled={isLoading}
                >
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Aprovar pela Diretoria
                </Button>
              )}
            </div>
          </div>

          {/* Foto Principal */}
          {preFicha.fotoPecaUrl && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Foto da Peça Piloto</h3>
              <img
                src={preFicha.fotoPecaUrl}
                alt={preFicha.nomePecaPiloto}
                className="w-full max-w-md rounded-lg border border-white/10"
              />
            </div>
          )}

          {/* Dados Principais */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Dados da Peça
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Nome da Peça Piloto</p>
                <p className="font-medium text-white">{preFicha.nomePecaPiloto}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Código da Peça</p>
                <p className="font-medium text-white">{preFicha.codigoPeca}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Categoria</p>
                <p className="font-medium text-white">{preFicha.categoria || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Versão do Molde</p>
                <p className="font-medium text-white">{preFicha.versaoMolde}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Criada em</p>
                <p className="font-medium text-white">{formatDate(preFicha.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Atualizada em</p>
                <p className="font-medium text-white">{formatDate(preFicha.updatedAt)}</p>
              </div>
            </div>
          </GlassCard>

          {/* Responsáveis Técnicos */}
          {(preFicha.estilistaNome ||
            preFicha.modelistaNome ||
            preFicha.piloteiroNome ||
            preFicha.liberadoPorNome) && (
            <GlassCard className="p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Responsáveis Técnicos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {preFicha.estilistaNome && (
                  <div>
                    <p className="text-sm text-gray-400">Estilista</p>
                    <p className="font-medium text-white">{preFicha.estilistaNome}</p>
                  </div>
                )}
                {preFicha.modelistaNome && (
                  <div>
                    <p className="text-sm text-gray-400">Modelista</p>
                    <p className="font-medium text-white">{preFicha.modelistaNome}</p>
                  </div>
                )}
                {preFicha.piloteiroNome && (
                  <div>
                    <p className="text-sm text-gray-400">Piloteiro</p>
                    <p className="font-medium text-white">{preFicha.piloteiroNome}</p>
                  </div>
                )}
                {preFicha.liberadoPorNome && (
                  <div>
                    <p className="text-sm text-gray-400">Liberado por</p>
                    <p className="font-medium text-white">{preFicha.liberadoPorNome}</p>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {/* Grade de Tamanhos */}
          {preFicha.gradeTamanhos && preFicha.gradeTamanhos.length > 0 && (
            <GlassCard className="p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Grade de Tamanhos
              </h3>
              <div className="flex gap-2 flex-wrap">
                {preFicha.gradeTamanhos.map((tamanho) => (
                  <Badge key={tamanho} className="bg-blue-500">
                    {tamanho}
                  </Badge>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Tecidos */}
          {preFicha.tecidos && preFicha.tecidos.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Tecidos ({preFicha.tecidos.length})
              </h3>
              <div className="space-y-2">
                {preFicha.tecidos.map((tecido, index) => (
                  <GlassCard key={`tecido-detail-${index}-${tecido.nome}`} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-white">{tecido.nome}</p>
                        <p className="text-sm text-gray-400">
                          Tipo: {tecido.tipo}
                          {tecido.especificacao && ` • ${tecido.especificacao}`}
                        </p>
                        {tecido.observacoesTecnicas && (
                          <p className="text-xs text-gray-500 mt-1">
                            {tecido.observacoesTecnicas}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-400">Consumo</p>
                        <p className="font-semibold text-white">{tecido.consumo} m</p>
                        <p className="text-sm text-gray-400 mt-1">Largura</p>
                        <p className="font-semibold text-white">{tecido.largura} cm</p>
                        {tecido.quantidadePartes && (
                          <>
                            <p className="text-sm text-gray-400 mt-1">Partes</p>
                            <p className="font-semibold text-white">{tecido.quantidadePartes}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Insumos Técnicos */}
          {preFicha.insumosTecnicos && preFicha.insumosTecnicos.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Insumos Técnicos ({preFicha.insumosTecnicos.length})
              </h3>
              <div className="space-y-2">
                {preFicha.insumosTecnicos.map((insumo, index) => (
                  <GlassCard key={`insumo-detail-${index}-${insumo.descricao}`} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-white">{insumo.descricao}</p>
                        <p className="text-sm text-gray-400">
                          Tipo: {insumo.tipo} • Qtd Base: {insumo.quantidadeBase} • Unidade:{" "}
                          {insumo.unidadeMedida}
                        </p>
                        {insumo.consumoPorTamanho && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-400 mb-1">Consumo por Tamanho:</p>
                            <div className="flex gap-2 flex-wrap">
                              {Object.entries(insumo.consumoPorTamanho).map(([tamanho, consumo]) => (
                                <Badge key={tamanho} className="bg-purple-500">
                                  {tamanho}: {consumo}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {insumo.observacoesTecnicas && (
                          <p className="text-xs text-gray-500 mt-1">
                            {insumo.observacoesTecnicas}
                          </p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {(preFicha.observacoesTecnicas || preFicha.observacoesOficina) && (
            <GlassCard className="p-4">
              <h3 className="font-semibold text-white mb-4">Observações</h3>
              {preFicha.observacoesTecnicas && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Observações Técnicas</p>
                  <p className="text-white whitespace-pre-wrap">{preFicha.observacoesTecnicas}</p>
                </div>
              )}
              {preFicha.observacoesOficina && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Observações da Oficina</p>
                  <p className="text-white whitespace-pre-wrap">{preFicha.observacoesOficina}</p>
                </div>
              )}
            </GlassCard>
          )}

          {/* Checklist Técnico */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Checklist Técnico
              </h3>
              {preFicha.status === "em_revisao_ficha_tecnica" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChecklistForm(true)}
                  title="Atualizar checklist"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
            {preFicha.checklistTecnico ? (
              <div className="space-y-2">
                {preFicha.checklistTecnico.moldeVesteCorretamente !== undefined && (
                  <div className="flex items-center gap-2">
                    {preFicha.checklistTecnico.moldeVesteCorretamente ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-white">Molde veste corretamente</span>
                  </div>
                )}
                {preFicha.checklistTecnico.costuraViavel !== undefined && (
                  <div className="flex items-center gap-2">
                    {preFicha.checklistTecnico.costuraViavel ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-white">Costura viável</span>
                  </div>
                )}
                {preFicha.checklistTecnico.insumosCompatíveis !== undefined && (
                  <div className="flex items-center gap-2">
                    {preFicha.checklistTecnico.insumosCompatíveis ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-white">Insumos compatíveis</span>
                  </div>
                )}
                {preFicha.checklistTecnico.pecaPilotoAprovadaVisualmente !== undefined && (
                  <div className="flex items-center gap-2">
                    {preFicha.checklistTecnico.pecaPilotoAprovadaVisualmente ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-white">Peça piloto aprovada visualmente</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Checklist ainda não preenchido</p>
            )}
          </GlassCard>

          {/* Modal de Checklist */}
          {showChecklistForm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
              <GlassCard className="p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-white mb-4">Atualizar Checklist Técnico</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistForm.moldeVesteCorretamente}
                      onChange={(e) =>
                        setChecklistForm({ ...checklistForm, moldeVesteCorretamente: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-white">Molde veste corretamente</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistForm.costuraViavel}
                      onChange={(e) =>
                        setChecklistForm({ ...checklistForm, costuraViavel: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-white">Costura viável</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistForm.insumosCompatíveis}
                      onChange={(e) =>
                        setChecklistForm({ ...checklistForm, insumosCompatíveis: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-white">Insumos compatíveis</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistForm.pecaPilotoAprovadaVisualmente}
                      onChange={(e) =>
                        setChecklistForm({
                          ...checklistForm,
                          pecaPilotoAprovadaVisualmente: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-white">Peça piloto aprovada visualmente</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowChecklistForm(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        await onAtualizarChecklist(preFicha.id, checklistForm);
                        notificationCenter.add({
                          type: "success",
                          title: "Checklist atualizado",
                          message: "Checklist técnico atualizado com sucesso",
                        });
                        setShowChecklistForm(false);
                        // Recarregar dados atualizados
                        await onBuscar(preFicha.id);
                      } catch (error: any) {
                        notificationCenter.add({
                          type: "error",
                          title: "Erro",
                          message: error?.message || "Erro ao atualizar checklist",
                        });
                      }
                    }}
                    disabled={isLoading}
                  >
                    Salvar
                  </Button>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Histórico de Status */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Histórico
            </h3>
            <div className="space-y-2 text-sm">
              {preFicha.dataSubmissao && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Submetida para revisão:</span>
                  <span className="text-white">{formatDate(preFicha.dataSubmissao)}</span>
                </div>
              )}
              {preFicha.dataInicioRevisao && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Início da revisão:</span>
                  <span className="text-white">{formatDate(preFicha.dataInicioRevisao)}</span>
                </div>
              )}
              {preFicha.dataAprovacaoTecnica && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Aprovada tecnicamente:</span>
                  <span className="text-white">{formatDate(preFicha.dataAprovacaoTecnica)}</span>
                </div>
              )}
              {preFicha.dataAprovacaoDiretoria && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Aprovada pela diretoria:</span>
                  <span className="text-white">{formatDate(preFicha.dataAprovacaoDiretoria)}</span>
                </div>
              )}
              {preFicha.dataReprovacao && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Reprovada:</span>
                  <span className="text-white">{formatDate(preFicha.dataReprovacao)}</span>
                </div>
              )}
              {preFicha.justificativaReprovacao && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                  <p className="text-xs text-gray-400 mb-1">Justificativa:</p>
                  <p className="text-white text-sm">{preFicha.justificativaReprovacao}</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Modal de Reprovação */}
        {showReprovarForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <GlassCard className="p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Reprovar Pré-Ficha Técnica</h3>
              <FormField label="Justificativa *">
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  rows={4}
                  placeholder="Descreva o motivo da reprovação (mínimo 10 caracteres)"
                />
              </FormField>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowReprovarForm(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (justificativa.trim().length >= 10) {
                      onReprovar(preFicha, justificativa);
                      setShowReprovarForm(false);
                      setJustificativa("");
                    } else {
                      notificationCenter.add({
                        type: "error",
                        title: "Erro",
                        message: "Justificativa deve ter pelo menos 10 caracteres",
                      });
                    }
                  }}
                  disabled={isLoading || justificativa.trim().length < 10}
                >
                  Reprovar
                </Button>
              </div>
            </GlassCard>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// Componente de Modal de Histórico/Versões
function HistoricoVersoesModal({
  preFichaId,
  orgId,
  onClose,
}: {
  preFichaId: string;
  orgId: string;
  onClose: () => void;
}) {
  const [versoes, setVersoes] = useState<
    Array<{
      id: string;
      versao: number;
      createdAt: string;
      motivoAlteracao?: string | null;
      criadoPor: string;
      dadosSnapshot: any;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersao, setSelectedVersao] = useState<any>(null);
  const [showComparacao, setShowComparacao] = useState(false);
  const [comparacaoData, setComparacaoData] = useState<any>(null);
  const [showComparacao, setShowComparacao] = useState(false);
  const [comparacaoData, setComparacaoData] = useState<any>(null);
  const [showComparacao, setShowComparacao] = useState(false);
  const [comparacaoData, setComparacaoData] = useState<any>(null);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <GlassCard className="p-6 max-w-3xl max-h-[90vh] overflow-y-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Histórico de Versões</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : versoes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Nenhuma versão anterior encontrada</p>
            <p className="text-xs mt-2">Esta é a primeira versão desta pré-ficha técnica</p>
          </div>
        ) : (
          <div className="space-y-4">
            {versoes.map((versao) => (
              <GlassCard key={versao.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-500">Versão {versao.versao}</Badge>
                      <span className="text-xs text-gray-400">
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
                      <p className="text-sm text-gray-300 mt-2">{versao.motivoAlteracao}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Criado por: {versao.criadoPor}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedVersao(versao.dadosSnapshot)}
                      title="Ver detalhes da versão"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const { compararVersoesPreFichaTecnica } = await import(
                            "@/lib/api/pre-fichas-tecnicas"
                          );
                          const comparacao = await compararVersoesPreFichaTecnica(
                            orgId,
                            preFichaId,
                            versao.versao,
                            0, // Versão atual
                          );
                          setShowComparacao(true);
                          setComparacaoData(comparacao);
                        } catch (error) {
                          console.error("Erro ao comparar versões:", error);
                          notificationCenter.add({
                            type: "error",
                            title: "Erro",
                            message: "Erro ao comparar versões",
                          });
                        }
                      }}
                      title="Comparar com versão atual"
                    >
                      <GitCompare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Modal de Detalhes da Versão */}
        {selectedVersao && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
            <GlassCard className="p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Detalhes da Versão</h3>
                <Button variant="ghost" onClick={() => setSelectedVersao(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Código da Peça</p>
                    <p className="text-white">{selectedVersao.codigoPeca}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Nome da Peça Piloto</p>
                    <p className="text-white">{selectedVersao.nomePecaPiloto}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className="text-white">{selectedVersao.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Versão do Molde</p>
                    <p className="text-white">{selectedVersao.versaoMolde}</p>
                  </div>
                </div>
                {selectedVersao.tecidos && selectedVersao.tecidos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Tecidos ({selectedVersao.tecidos.length})</h4>
                    <div className="space-y-2">
                      {selectedVersao.tecidos.map((t: any, i: number) => (
                        <div key={i} className="p-2 bg-gray-800 rounded text-sm">
                          <p className="text-white">{t.nome} ({t.tipo})</p>
                          <p className="text-gray-400">Consumo: {t.consumo}m • Largura: {t.largura}cm</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedVersao.insumosTecnicos && selectedVersao.insumosTecnicos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">
                      Insumos Técnicos ({selectedVersao.insumosTecnicos.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedVersao.insumosTecnicos.map((i: any, idx: number) => (
                        <div key={idx} className="p-2 bg-gray-800 rounded text-sm">
                          <p className="text-white">{i.descricao} ({i.tipo})</p>
                          <p className="text-gray-400">
                            Qtd Base: {i.quantidadeBase} • Unidade: {i.unidadeMedida}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Modal de Comparação de Versões */}
        {showComparacao && comparacaoData && (
          <ComparacaoVersoesModal
            comparacao={comparacaoData}
            onClose={() => {
              setShowComparacao(false);
              setComparacaoData(null);
            }}
          />
        )}
      </GlassCard>
    </div>
  );
}

// Componente de Formulário Completo
function PreFichaTecnicaFormModal({
  editingPreFicha,
  formData,
  setFormData,
  tecidoForm,
  setTecidoForm,
  insumoTecnicoForm,
  setInsumoTecnicoForm,
  consumoPorTamanho,
  setConsumoPorTamanho,
  photoPreview,
  setPhotoPreview,
  uploadingPhoto,
  onPhotoUpload,
  onAddTecido,
  onRemoveTecido,
  onAddInsumoTecnico,
  onRemoveInsumoTecnico,
  onSubmit,
  onClose,
  pending,
}: {
  editingPreFicha: PreFichaTecnica | null;
  formData: any;
  setFormData: (data: any) => void;
  tecidoForm: CreateTecidoInput;
  setTecidoForm: (form: CreateTecidoInput) => void;
  insumoTecnicoForm: CreateInsumoTecnicoInput;
  setInsumoTecnicoForm: (form: CreateInsumoTecnicoInput) => void;
  consumoPorTamanho: { [key: string]: number };
  setConsumoPorTamanho: (consumo: { [key: string]: number }) => void;
  photoPreview: string | null;
  setPhotoPreview: (preview: string | null) => void;
  uploadingPhoto: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTecido: () => void;
  onRemoveTecido: (index: number) => void;
  onAddInsumoTecnico: () => void;
  onRemoveInsumoTecnico: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  pending: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editingPreFicha ? "Editar" : "Nova"} Pré-Ficha Técnica
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Dados Básicos</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Código da Peça *">
                <Input
                  value={formData.codigoPeca}
                  onChange={(e) => setFormData({ ...formData, codigoPeca: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Nome da Peça Piloto *">
                <Input
                  value={formData.nomePecaPiloto}
                  onChange={(e) =>
                    setFormData({ ...formData, nomePecaPiloto: e.target.value })
                  }
                  required
                />
              </FormField>
              <FormField label="Categoria">
                <Input
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                />
              </FormField>
            </div>
          </div>

          {/* Upload de Foto */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Foto da Peça Piloto *</h3>
            <div className="flex gap-4">
              {photoPreview || formData.fotoPecaUrl ? (
                <div className="relative">
                  <img
                    src={photoPreview || formData.fotoPecaUrl}
                    alt="Preview da foto da peça piloto"
                    className="w-48 h-48 object-cover rounded-lg border border-white/10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        fotoPecaUrl: "",
                        fotoPecaStorageKey: "",
                      }));
                      setPhotoPreview(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-48 w-48 cursor-pointer items-center justify-center border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors rounded-lg">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-white/40 mb-2" />
                    <p className="text-sm text-white/60">Upload Foto</p>
                    <p className="text-xs text-white/40">JPG, PNG, WebP</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={onPhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              )}
              <div className="flex-1">
                <FormField label="Ou informe URL da foto">
                  <Input
                    type="url"
                    value={formData.fotoPecaUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, fotoPecaUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </FormField>
                {uploadingPhoto && (
                  <p className="text-sm text-blue-400 mt-2">Fazendo upload...</p>
                )}
              </div>
            </div>
          </div>

          {/* Grade de Tamanhos */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Grade de Tamanhos</h3>
            <div className="flex gap-2 flex-wrap">
              {GRADE_TAMANHOS.map((tamanho) => (
                <label key={tamanho} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.gradeTamanhos.includes(tamanho)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          gradeTamanhos: [...formData.gradeTamanhos, tamanho],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          gradeTamanhos: formData.gradeTamanhos.filter((t) => t !== tamanho),
                        });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-white">{tamanho}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Responsáveis Técnicos */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Responsáveis Técnicos
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Estilista">
                <Input
                  value={formData.estilistaNome}
                  onChange={(e) =>
                    setFormData({ ...formData, estilistaNome: e.target.value })
                  }
                  placeholder="Nome do estilista"
                />
              </FormField>
              <FormField label="Modelista">
                <Input
                  value={formData.modelistaNome}
                  onChange={(e) =>
                    setFormData({ ...formData, modelistaNome: e.target.value })
                  }
                  placeholder="Nome do modelista"
                />
              </FormField>
              <FormField label="Piloteiro">
                <Input
                  value={formData.piloteiroNome}
                  onChange={(e) =>
                    setFormData({ ...formData, piloteiroNome: e.target.value })
                  }
                  placeholder="Nome do piloteiro"
                />
              </FormField>
            </div>
          </div>

          {/* Tecidos */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              Tecidos *
            </h3>
            <GlassCard className="p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField label="Tipo *">
                  <FormSelect
                    value={tecidoForm.tipo}
                    onChange={(e) =>
                      setTecidoForm({ ...tecidoForm, tipo: e.target.value as TipoTecido })
                    }
                  >
                    <option value="principal">Principal</option>
                    <option value="forro">Forro</option>
                    <option value="entretela">Entretela</option>
                    <option value="outros">Outros</option>
                  </FormSelect>
                </FormField>
                <FormField label="Nome *">
                  <Input
                    value={tecidoForm.nome}
                    onChange={(e) => setTecidoForm({ ...tecidoForm, nome: e.target.value })}
                  />
                </FormField>
                <FormField label="Especificação">
                  <Input
                    value={tecidoForm.especificacao || ""}
                    onChange={(e) =>
                      setTecidoForm({ ...tecidoForm, especificacao: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Consumo (m) *">
                  <Input
                    type="number"
                    step="0.01"
                    value={tecidoForm.consumo}
                    onChange={(e) =>
                      setTecidoForm({
                        ...tecidoForm,
                        consumo: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </FormField>
                <FormField label="Largura (cm) *">
                  <Input
                    type="number"
                    step="0.01"
                    value={tecidoForm.largura}
                    onChange={(e) =>
                      setTecidoForm({
                        ...tecidoForm,
                        largura: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </FormField>
                <FormField label="Quantidade de Partes">
                  <Input
                    type="number"
                    value={tecidoForm.quantidadePartes || 1}
                    onChange={(e) =>
                      setTecidoForm({
                        ...tecidoForm,
                        quantidadePartes: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </FormField>
                <FormField label="Observações Técnicas" className="col-span-3">
                  <textarea
                    value={tecidoForm.observacoesTecnicas || ""}
                    onChange={(e) =>
                      setTecidoForm({ ...tecidoForm, observacoesTecnicas: e.target.value })
                    }
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    rows={2}
                  />
                </FormField>
                <div className="col-span-3">
                  <Button type="button" onClick={onAddTecido} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Tecido
                  </Button>
                </div>
              </div>
            </GlassCard>
            {formData.tecidos.length > 0 && (
              <div className="space-y-2">
                {formData.tecidos.map((tecido: CreateTecidoInput, index: number) => (
                  <GlassCard key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">
                          {tecido.nome} ({tecido.tipo})
                        </p>
                        <p className="text-sm text-gray-400">
                          Consumo: {tecido.consumo}m • Largura: {tecido.largura}cm
                          {tecido.quantidadePartes && ` • Partes: ${tecido.quantidadePartes}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveTecido(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Insumos Técnicos */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Insumos Técnicos
            </h3>
            <GlassCard className="p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField label="Descrição *">
                  <Input
                    value={insumoTecnicoForm.descricao}
                    onChange={(e) =>
                      setInsumoTecnicoForm({ ...insumoTecnicoForm, descricao: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Tipo *">
                  <FormSelect
                    value={insumoTecnicoForm.tipo}
                    onChange={(e) =>
                      setInsumoTecnicoForm({
                        ...insumoTecnicoForm,
                        tipo: e.target.value as TipoInsumoTecnico,
                      })
                    }
                  >
                    <option value="linha">Linha</option>
                    <option value="ziper">Ziper</option>
                    <option value="botao">Botão</option>
                    <option value="etiqueta">Etiqueta</option>
                    <option value="outros">Outros</option>
                  </FormSelect>
                </FormField>
                <FormField label="Quantidade Base *">
                  <Input
                    type="number"
                    step="0.01"
                    value={insumoTecnicoForm.quantidadeBase}
                    onChange={(e) =>
                      setInsumoTecnicoForm({
                        ...insumoTecnicoForm,
                        quantidadeBase: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </FormField>
                <FormField label="Unidade de Medida *">
                  <FormSelect
                    value={insumoTecnicoForm.unidadeMedida}
                    onChange={(e) =>
                      setInsumoTecnicoForm({
                        ...insumoTecnicoForm,
                        unidadeMedida: e.target.value as UnidadeMedida,
                      })
                    }
                  >
                    <option value="cm">Centímetros (cm)</option>
                    <option value="unidade">Unidade</option>
                    <option value="metro">Metro</option>
                    <option value="kg">Quilograma (kg)</option>
                    <option value="litro">Litro</option>
                  </FormSelect>
                </FormField>
                {formData.gradeTamanhos.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400 mb-2">Consumo por Tamanho (opcional)</p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.gradeTamanhos.map((tamanho: string) => (
                        <FormField key={tamanho} label={tamanho}>
                          <Input
                            type="number"
                            step="0.01"
                            value={consumoPorTamanho[tamanho] || ""}
                            onChange={(e) =>
                              setConsumoPorTamanho({
                                ...consumoPorTamanho,
                                [tamanho]: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                          />
                        </FormField>
                      ))}
                    </div>
                  </div>
                )}
                <FormField label="Observações Técnicas" className="col-span-3">
                  <textarea
                    value={insumoTecnicoForm.observacoesTecnicas || ""}
                    onChange={(e) =>
                      setInsumoTecnicoForm({
                        ...insumoTecnicoForm,
                        observacoesTecnicas: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    rows={2}
                  />
                </FormField>
                <div className="col-span-3">
                  <Button type="button" onClick={onAddInsumoTecnico} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Insumo Técnico
                  </Button>
                </div>
              </div>
            </GlassCard>
            {formData.insumosTecnicos.length > 0 && (
              <div className="space-y-2">
                {formData.insumosTecnicos.map(
                  (insumo: CreateInsumoTecnicoInput, index: number) => (
                    <GlassCard key={index} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {insumo.descricao} ({insumo.tipo})
                          </p>
                          <p className="text-sm text-gray-400">
                            Qtd Base: {insumo.quantidadeBase} • Unidade: {insumo.unidadeMedida}
                            {insumo.consumoPorTamanho &&
                              Object.keys(insumo.consumoPorTamanho).length > 0 && (
                                <>
                                  {" • "}
                                  {Object.entries(insumo.consumoPorTamanho).map(
                                    ([tamanho, consumo]) => `${tamanho}:${consumo}`,
                                  ).join(", ")}
                                </>
                              )}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveInsumoTecnico(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </GlassCard>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Observações</h3>
            <div className="space-y-4">
              <FormField label="Observações Técnicas">
                <textarea
                  value={formData.observacoesTecnicas}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoesTecnicas: e.target.value })
                  }
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  rows={4}
                  placeholder="Observações técnicas sobre o molde..."
                />
              </FormField>
              <FormField label="Observações da Oficina">
                <textarea
                  value={formData.observacoesOficina}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoesOficina: e.target.value })
                  }
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  rows={3}
                  placeholder="Observações sobre costura, encaixe e viabilidade prática..."
                />
              </FormField>
            </div>
          </div>

          {/* Alteração Técnica */}
          {editingPreFicha && (
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Alteração Técnica</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.houveAlteracao}
                    onChange={(e) =>
                      setFormData({ ...formData, houveAlteracao: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-white">Houve alteração em relação à versão anterior?</span>
                </label>
                {formData.houveAlteracao && (
                  <FormField label="O que mudou? *">
                    <textarea
                      value={formData.descricaoAlteracao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricaoAlteracao: e.target.value })
                      }
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      rows={3}
                      placeholder="Descreva as alterações realizadas..."
                      required
                    />
                  </FormField>
                )}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : editingPreFicha ? "Atualizar" : "Criar"} Pré-Ficha
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}












