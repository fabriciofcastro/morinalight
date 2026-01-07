"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import { Badge } from "@/components/ui/badge";
import { usePreFichasTecnicas, usePreFichaTecnica } from "@/hooks/use-pre-fichas-tecnicas";
import type {
    CreateInsumoTecnicoInput,
    CreateTecidoInput,
    PreFichaTecnica,
    TipoInsumoTecnico,
    TipoTecido,
    UnidadeMedida,
} from "@/lib/api/pre-fichas-tecnicas";
import { apiUrl } from "@/lib/env";
import { Button, GlassCard, Input } from "@morina/ui";
import {
    AlertCircle,
    Download,
    Eye,
    FileText,
    Plus,
    Search,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { HistoricoVersoesModal } from "./components/modals/HistoricoVersoesModal";
import { PreFichaDetailModal } from "./components/modals/PreFichaDetailModal";
import { PreFichaFormModal } from "./components/modals/PreFichaFormModal";
import { PreFichaPdfPreviewModal } from "./components/modals/PreFichaPdfPreviewModal";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";
import { FiltroStatus, PreFichaFormData } from "./types";

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") return null;
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) return selectedOrgId;
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) return orgs[0]!.organizationId;
    } catch { /* Ignorar */ }
  }
  return null;
}

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
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedForPdf, setSelectedForPdf] = useState<PreFichaTecnica | null>(null);

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
  } = usePreFichaTecnica(orgId);

  // Form states
  const [formData, setFormData] = useState<PreFichaFormData>({
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

  const [tecidoForm, setTecidoForm] = useState<CreateTecidoInput>({
    nome: "",
    tipo: "principal" as TipoTecido,
    consumo: 0,
    largura: 0,
    especificacao: "",
  });

  const [insumoTecnicoForm, setInsumoTecnicoForm] = useState<CreateInsumoTecnicoInput>({
    descricao: "",
    tipo: "outros" as TipoInsumoTecnico,
    quantidadeBase: 0,
    unidadeMedida: "unidade" as UnidadeMedida,
  });

  const [consumoPorTamanho, setConsumoPorTamanho] = useState<{ [key: string]: number }>({});

  const loadPreFichas = useCallback(() => {
    listar({
      pagina,
      tamanhoPagina: 10,
      busca: search || undefined,
      status: statusFilter === "all" ? undefined : [statusFilter],
    });
  }, [listar, pagina, search, statusFilter]);

  useEffect(() => {
    loadPreFichas();
  }, [loadPreFichas]);

  // Actions
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch(`${apiUrl}/storage/upload`, {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) throw new Error("Erro no upload");

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        fotoPecaUrl: data.url,
        fotoPecaStorageKey: data.key,
      }));
      notificationCenter.add({ type: "success", title: "Sucesso", message: "Foto enviada!" });
    } catch (err) {
      notificationCenter.add({ type: "error", title: "Erro", message: "Falha no upload da foto." });
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddTecido = () => {
    if (!tecidoForm.nome || !tecidoForm.consumo) {
      notificationCenter.add({ type: "error", title: "Erro", message: "Preencha os campos obrigatórios do tecido." });
      return;
    }
    setFormData((prev) => ({ ...prev, tecidos: [...prev.tecidos, tecidoForm] }));
    setTecidoForm({ nome: "", tipo: "principal", consumo: 0, largura: 0, especificacao: "" });
  };

  const handleAddInsumoTecnico = () => {
    if (!insumoTecnicoForm.descricao || !insumoTecnicoForm.quantidadeBase) {
      notificationCenter.add({ type: "error", title: "Erro", message: "Preencha a descrição e quantidade do insumo." });
      return;
    }
    const novoInsumo = { ...insumoTecnicoForm, consumoPorTamanho: { ...consumoPorTamanho } };
    setFormData((prev) => ({ ...prev, insumosTecnicos: [...prev.insumosTecnicos, novoInsumo] }));
    setInsumoTecnicoForm({ descricao: "", tipo: "outros", quantidadeBase: 0, unidadeMedida: "unidade" });
    setConsumoPorTamanho({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigoPeca || !formData.nomePecaPiloto || !formData.categoria || formData.tecidos.length === 0) {
      notificationCenter.add({
        type: "error",
        title: "Ficha Incompleta",
        message: "Para salvar, é obrigatório preencher Código, Nome, Categoria e ao menos um Tecido Principal.",
      });
      return;
    }

    startTransition(async () => {
      try {
        if (editingPreFicha) {
          await atualizar(editingPreFicha.id, {
            ...formData,
            motivoAlteracao: formData.houveAlteracao ? formData.descricaoAlteracao : undefined,
          });
        } else {
          await criar({ ...formData });
        }
        setShowForm(false);
        resetForm();
        loadPreFichas();
        notificationCenter.add({ type: "success", title: "Sucesso", message: "Pré-ficha salva com sucesso!" });
      } catch (err: any) {
        notificationCenter.add({ type: "error", title: "Erro", message: err.message || "Erro ao salvar." });
      }
    });
  };

  const resetForm = () => {
    setEditingPreFicha(null);
    setPhotoPreview(null);
    setFormData({
      codigoPeca: "", nomePecaPiloto: "", categoria: "", fotoPecaUrl: "", fotoPecaStorageKey: "",
      gradeTamanhos: [], observacoesTecnicas: "", observacoesOficina: "", tecidos: [], insumosTecnicos: [],
      estilistaId: "", estilistaNome: "", modelistaId: "", modelistaNome: "", piloteiroId: "", piloteiroNome: "",
      houveAlteracao: false, descricaoAlteracao: "",
    });
  };

  const handleEdit = (pf: PreFichaTecnica) => {
    setEditingPreFicha(pf);
    setFormData({
      codigoPeca: pf.codigoPeca,
      nomePecaPiloto: pf.nomePecaPiloto,
      categoria: pf.categoria || "",
      fotoPecaUrl: pf.fotoPecaUrl || "",
      fotoPecaStorageKey: pf.fotoPecaStorageKey || "",
      gradeTamanhos: pf.gradeTamanhos || [],
      observacoesTecnicas: pf.observacoesTecnicas || "",
      observacoesOficina: pf.observacoesOficina || "",
      tecidos: pf.tecidos as CreateTecidoInput[],
      insumosTecnicos: pf.insumosTecnicos as CreateInsumoTecnicoInput[],
      estilistaId: pf.estilistaId || "",
      estilistaNome: pf.estilistaNome || "",
      modelistaId: pf.modelistaId || "",
      modelistaNome: pf.modelistaNome || "",
      piloteiroId: pf.piloteiroId || "",
      piloteiroNome: pf.piloteiroNome || "",
      houveAlteracao: false,
      descricaoAlteracao: "",
    });
    setShowForm(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pré-Fichas Técnicas</h1>
          <p className="text-white/40 mt-1">Gestão do ciclo de vida técnico e prototipagem</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Pré-Ficha
        </Button>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center border-white/5 bg-white/[0.02]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Buscar por código ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(["all", "rascunho", "em_revisao_ficha_tecnica", "aprovada_tecnicamente", "reprovada"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={`whitespace-nowrap ${statusFilter === status ? 'bg-blue-600 text-white' : 'text-white/60'}`}
            >
              {status === "all" ? "Todos" : STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
            </Button>
          ))}
        </div>
      </GlassCard>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : preFichas.length === 0 ? (
        <GlassCard className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-white/5 p-6 rounded-full">
            <FileText className="w-12 h-12 text-white/10" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Nenhuma ficha encontrada</h3>
            <p className="text-white/40">Inicie um novo projeto ou ajuste seus filtros.</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {preFichas.map((pf) => {
            const isIncomplete = !pf.categoria || !pf.tecidos || pf.tecidos.length === 0;
            return (
              <GlassCard key={pf.id} className={`group overflow-hidden border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all duration-300 ${isIncomplete ? 'border-yellow-500/20' : ''}`}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  {pf.fotoPecaUrl ? (
                    <img src={pf.fotoPecaUrl} alt={pf.nomePecaPiloto} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center"><FileText className="w-12 h-12 text-white/10" /></div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <Badge className={`${STATUS_COLORS[pf.status]} border-none shadow-lg`}>
                      {STATUS_LABELS[pf.status]}
                    </Badge>
                    {isIncomplete && (
                      <Badge className="bg-yellow-500/80 text-black border-none shadow-lg flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Incompleta
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">{pf.nomePecaPiloto}</h3>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="font-mono text-white/40">{pf.codigoPeca}</span>
                      <span className="text-white/20">v{pf.versaoAtual}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 bg-white/5 hover:bg-blue-600 hover:text-white" onClick={() => setSelectedPreFicha(pf)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Abrir
                    </Button>
                    <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10" onClick={() => handleEdit(pf)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 bg-white/5 hover:bg-blue-600 hover:text-white"
                      onClick={() => { setSelectedForPdf(pf); setShowPdfPreview(true); }}
                      title="Visualizar Documento"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/5 hover:bg-white/10" onClick={() => exportarPdf(pf.id)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Modals Orchestration */}
      {showForm && (
        <PreFichaFormModal
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
          onPhotoUpload={handlePhotoUpload}
          uploadingPhoto={uploadingPhoto}
          onAddTecido={handleAddTecido}
          onRemoveTecido={(idx) => setFormData(p => ({ ...p, tecidos: p.tecidos.filter((_, i) => i !== idx) }))}
          onAddInsumoTecnico={handleAddInsumoTecnico}
          onRemoveInsumoTecnico={(idx) => setFormData(p => ({ ...p, insumosTecnicos: p.insumosTecnicos.filter((_, i) => i !== idx) }))}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          pending={pending}
        />
      )}

      {selectedPreFicha && (
        <PreFichaDetailModal
          preFicha={selectedPreFicha}
          onClose={() => setSelectedPreFicha(null)}
          onSubmeter={async (pf) => {
            if (!pf.categoria || !pf.tecidos || pf.tecidos.length === 0) {
              notificationCenter.add({
                type: "error",
                title: "Submissão Bloqueada",
                message: "A Pré-Ficha deve conter Categoria e ao menos um Tecido para ser submetida.",
              });
              return;
            }
            await submeter(pf.id);
            loadPreFichas();
            setSelectedPreFicha(null);
          }}
          onAprovarTecnicamente={async (pf) => { await aprovarTecnicamente(pf.id, "Usuário Atual"); loadPreFichas(); setSelectedPreFicha(null); }}
          onReprovar={async (pf, justification) => { await reprovar(pf.id, justification); loadPreFichas(); setSelectedPreFicha(null); }}
          onAprovarDiretoria={async (pf) => { await aprovarDiretoria(pf.id, "Diretoria"); loadPreFichas(); setSelectedPreFicha(null); }}
          onShowHistorico={() => setShowHistorico(true)}
          onShowPdf={(pf) => { setSelectedForPdf(pf); setShowPdfPreview(true); }}
          onAtualizarChecklist={async (id, checklistForm) => { await atualizarChecklist(id, checklistForm); }}
          onBuscar={buscar}
          isLoading={pending}
        />
      )}

      {showHistorico && selectedPreFicha && (
        <HistoricoVersoesModal
          preFichaId={selectedPreFicha.id}
          orgId={orgId}
          onClose={() => setShowHistorico(false)}
        />
      )}

      {showPdfPreview && selectedForPdf && (
        <PreFichaPdfPreviewModal
          preFicha={selectedForPdf}
          onClose={() => { setShowPdfPreview(false); setSelectedForPdf(null); }}
          onDownload={() => exportarPdf(selectedForPdf.id)}
        />
      )}

      {/* Pagination */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={pagina === p ? "default" : "ghost"}
              size="sm"
              onClick={() => setPagina(p)}
              className={pagina === p ? "bg-blue-600" : "text-white/40"}
            >
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
