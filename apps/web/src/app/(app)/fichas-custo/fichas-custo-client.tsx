"use client";

import { Button, FormField, FormSelect, GlassCard, Input } from "@morina/ui";
import {
  CheckCircle2,
  FileText,
  Image,
  Plus,
  Search,
  Send,
  XCircle,
  Eye,
  Edit,
  Check,
  X,
  DollarSign,
  Package,
  CreditCard,
  Receipt,
  Trash2,
  Calendar,
  Sparkles,
  Layers,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { useFichasCusto, useFichaCusto } from "@/hooks/use-fichas-custo";
import type { FichaCusto, StatusFichaCusto, TipoInsumo, Insumo, CreateInsumoInput, BoletoFichaCusto, CreateBoletoInput, StatusBoleto } from "@/lib/api/fichas-custo";
import { motion, AnimatePresence } from "framer-motion";
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
import { Badge } from "@/components/ui/badge";

type FiltroStatus = "all" | StatusFichaCusto;

// Helper para criar inputs futuristas
const FuturisticInput = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="group">
    <label className="block text-sm font-semibold text-white/90 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] rounded-lg opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
      <input
        {...props}
        className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(var(--primary))] focus:bg-white/10 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300"
      />
    </div>
  </div>
);

const FuturisticSelect = ({ label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="group">
    <label className="block text-sm font-semibold text-white/90 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] rounded-lg opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
      <select
        {...props}
        className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-[hsl(var(--primary))] focus:bg-white/10 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300 appearance-none cursor-pointer"
      >
        {children}
      </select>
    </div>
  </div>
);

export function FichasCustoClient() {
  const orgId = getCurrentOrgId() || "";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FiltroStatus>("all");
  const [pagina, setPagina] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingFicha, setEditingFicha] = useState<FichaCusto | null>(null);
  const [selectedFicha, setSelectedFicha] = useState<FichaCusto | null>(null);
  const [pending, startTransition] = useTransition();

  const { fichas, total, totalPaginas, loading, listar } = useFichasCusto(orgId);
  const { buscar, criar, atualizar, enviarParaConferencia, aprovar, reprovar, anexarBoleto, pagarBoleto, removerBoleto } = useFichaCusto(orgId);

  // Form data
  const [formData, setFormData] = useState({
    referenciaPeca: "",
    nomePeca: "",
    categoria: "",
    fotoPecaUrl: "",
    insumos: [] as CreateInsumoInput[],
  });

  // Insumo form
  const [insumoForm, setInsumoForm] = useState<CreateInsumoInput>({
    descricao: "",
    tipo: "aviamento",
    quantidade: 0,
    unidadeMedida: "UN",
    custoUnitario: 0,
    fornecedorNome: "",
    notaFiscalNumero: "",
    notaFiscalData: "",
    notaFiscalValor: 0,
  });

  const loadFichas = useCallback(async () => {
    const filtro: any = {
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
      void loadFichas();
    }
  }, [loadFichas, orgId]);

  const handleAddInsumo = () => {
    if (!insumoForm.descricao || insumoForm.quantidade <= 0 || insumoForm.custoUnitario < 0) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Preencha todos os campos obrigatórios do insumo",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      insumos: [...prev.insumos, { ...insumoForm }],
    }));

    setInsumoForm({
      descricao: "",
      tipo: "aviamento",
      quantidade: 0,
      unidadeMedida: "UN",
      custoUnitario: 0,
      fornecedorNome: "",
      notaFiscalNumero: "",
      notaFiscalData: "",
      notaFiscalValor: 0,
    });
  };

  const handleRemoveInsumo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      insumos: prev.insumos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.referenciaPeca || !formData.nomePeca || formData.insumos.length === 0) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    startTransition(async () => {
      try {
        if (editingFicha) {
          await atualizar(editingFicha.id, formData);
          notificationCenter.add({
            type: "success",
            title: "Ficha atualizada",
            message: "Ficha de custo atualizada com sucesso",
          });
        } else {
          await criar(formData);
          notificationCenter.add({
            type: "success",
            title: "Ficha criada",
            message: "Ficha de custo criada com sucesso",
          });
        }

        setShowForm(false);
        setEditingFicha(null);
        setFormData({
          referenciaPeca: "",
          nomePeca: "",
          categoria: "",
          fotoPecaUrl: "",
          insumos: [],
        });
        await loadFichas();
      } catch (error: any) {
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error?.message || "Erro ao salvar ficha",
        });
      }
    });
  };

  const handleEnviarConferencia = async (ficha: FichaCusto) => {
    startTransition(async () => {
      try {
        await enviarParaConferencia(ficha.id);
        notificationCenter.add({
          type: "success",
          title: "Enviada para conferência",
          message: "Ficha enviada para aprovação",
        });
        await loadFichas();
      } catch (error: any) {
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error?.message || "Erro ao enviar ficha",
        });
      }
    });
  };

  const handleAprovar = async (ficha: FichaCusto) => {
    startTransition(async () => {
      try {
        await aprovar(ficha.id);
        notificationCenter.add({
          type: "success",
          title: "Ficha aprovada",
          message: "Ficha de custo aprovada com sucesso",
        });
        await loadFichas();
        if (selectedFicha?.id === ficha.id) {
          const updated = await buscar(ficha.id);
          setSelectedFicha(updated);
        }
      } catch (error: any) {
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error?.message || "Erro ao aprovar ficha",
        });
      }
    });
  };

  const handleReprovar = async (ficha: FichaCusto, justificativa: string) => {
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
        await reprovar(ficha.id, justificativa);
        notificationCenter.add({
          type: "success",
          title: "Ficha reprovada",
          message: "Ficha de custo reprovada",
        });
        await loadFichas();
        if (selectedFicha?.id === ficha.id) {
          const updated = await buscar(ficha.id);
          setSelectedFicha(updated);
        }
      } catch (error: any) {
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error?.message || "Erro ao reprovar ficha",
        });
      }
    });
  };

  const handleEdit = (ficha: FichaCusto) => {
    setEditingFicha(ficha);
    setFormData({
      referenciaPeca: ficha.referenciaPeca,
      nomePeca: ficha.nomePeca,
      categoria: ficha.categoria || "",
      fotoPecaUrl: ficha.fotoPecaUrl || "",
      insumos: ficha.insumos.map((insumo) => ({
        descricao: insumo.descricao,
        tipo: insumo.tipo,
        quantidade: insumo.quantidade,
        unidadeMedida: insumo.unidadeMedida,
        custoUnitario: insumo.custoUnitario,
        fornecedorNome: insumo.fornecedorNome || "",
        notaFiscalNumero: insumo.notaFiscalNumero || "",
        notaFiscalData: insumo.notaFiscalData || "",
        notaFiscalValor: insumo.notaFiscalValor || 0,
      })),
    });
    setShowForm(true);
  };

  const getStatusBadgeStyle = (status: StatusFichaCusto) => {
    switch (status) {
      case "aprovada":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
      case "reprovada":
        return "bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
      case "enviada_para_conferencia":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="relative min-h-screen p-6 space-y-8">
      {/* Header Futurista Ultra Avançado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Glow effect atrás do header */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />
        
        <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl">
          {/* Tech corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[hsl(var(--primary)/0.3)] blur-xl rounded-full" />
                <Layers className="h-8 w-8 text-[hsl(var(--primary))] relative z-10" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Fichas de Custo
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--accent))] opacity-70" />
                  <p className="text-sm text-white/60 font-medium">
                    Sistema Avançado de Gestão e Controle de Custos
                  </p>
                </div>
              </div>
            </div>
            {/* Stats bar */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span className="text-sm font-medium text-white/80">{total} fichas</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Zap className="h-4 w-4 text-[hsl(var(--accent))]" />
                <span className="text-sm font-medium text-white/80">Sistema Ativo</span>
              </div>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10"
          >
            <Button
              className="relative overflow-hidden bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] transition-all duration-300"
              onClick={() => {
                setEditingFicha(null);
                setFormData({
                  referenciaPeca: "",
                  nomePeca: "",
                  categoria: "",
                  fotoPecaUrl: "",
                  insumos: [],
                });
                setShowForm(true);
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <Plus className="h-4 w-4 relative z-10" />
              <span className="relative z-10 ml-2 font-semibold">Nova Ficha</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Filtros e Busca Futuristas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.05)] via-transparent to-[hsl(var(--accent)/0.05)] rounded-2xl opacity-50" />
          
          <div className="relative z-10 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-[hsl(var(--primary))]" />
                Buscar
              </label>
              <div className="relative group">
                {/* Input glow effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] rounded-lg opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
                <input
                  type="text"
                  placeholder="Referência, nome da peça..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(var(--primary))] focus:bg-white/10 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300"
                />
              </div>
            </div>
            <div className="w-56">
              <label className="block text-sm font-semibold text-white/90 mb-2">Status</label>
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] rounded-lg opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FiltroStatus)}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-[hsl(var(--primary))] focus:bg-white/10 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-[#1a1f3a]">Todos</option>
                  <option value="rascunho" className="bg-[#1a1f3a]">Rascunho</option>
                  <option value="enviada_para_conferencia" className="bg-[#1a1f3a]">Enviada para Conferência</option>
                  <option value="aprovada" className="bg-[#1a1f3a]">Aprovada</option>
                  <option value="reprovada" className="bg-[#1a1f3a]">Reprovada</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lista de Fichas Futuristas */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="h-12 w-12 rounded-full border-4 border-[hsl(var(--primary)/0.2)] border-t-[hsl(var(--primary))] shadow-[0_0_30px_hsl(var(--primary)/0.4)]" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-r-[hsl(var(--accent))] opacity-50" />
          </motion.div>
        </div>
      )}

      {!loading && fichas.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative p-16 text-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <FileText className="h-16 w-16 mx-auto text-white/30" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white/90 mb-3">Nenhuma ficha encontrada</h3>
          <p className="text-white/60">
            {search || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece criando sua primeira ficha de custo"}
          </p>
        </motion.div>
      )}

      {!loading && fichas.length > 0 && (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {fichas.map((ficha, index) => (
              <motion.div
                key={ficha.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative group"
              >
                <div className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-[hsl(var(--primary)/0.3)] transition-all duration-300 overflow-hidden">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.1)] via-transparent to-[hsl(var(--accent)/0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Tech corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[hsl(var(--primary)/0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[hsl(var(--primary)/0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[hsl(var(--primary)/0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[hsl(var(--primary)/0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    {ficha.fotoPecaUrl && (
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        className="relative overflow-hidden rounded-xl border-2 border-white/20 shadow-lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                          src={ficha.fotoPecaUrl}
                          alt={ficha.nomePeca}
                          className="w-28 h-28 object-cover relative z-10"
                        />
                      </motion.div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                          #{ficha.numeroSequencial}
                        </h3>
                        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold border backdrop-blur-sm ${getStatusBadgeStyle(ficha.status)}`}>
                          {ficha.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <h4 className="text-xl font-semibold text-white/95 mb-1">{ficha.nomePeca}</h4>
                      <p className="text-sm text-white/60 font-medium">
                        Ref: <span className="text-white/80">{ficha.referenciaPeca}</span>
                        {ficha.categoria && (
                          <>
                            {" • "}
                            <span className="text-white/70">{ficha.categoria}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                      <p className="text-xs text-white/60 mb-2 font-medium uppercase tracking-wider">Total de Custos</p>
                      <p className="text-xl font-bold text-[hsl(var(--primary))] flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        {formatCurrency(ficha.totalCustos)}
                      </p>
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                      <p className="text-xs text-white/60 mb-2 font-medium uppercase tracking-wider">Insumos</p>
                      <p className="text-xl font-bold text-white/90 flex items-center gap-2">
                        <Package className="h-5 w-5 text-[hsl(var(--accent))]" />
                        {ficha.insumos.length}
                      </p>
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                      <p className="text-xs text-white/60 mb-2 font-medium uppercase tracking-wider">Criada em</p>
                      <p className="text-sm font-semibold text-white/80">{formatDate(ficha.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
                      size="sm"
                      onClick={() => {
                        buscar(ficha.id).then((f) => setSelectedFicha(f));
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </motion.div>
                  {ficha.status === "rascunho" && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
                        size="sm"
                        onClick={() => handleEdit(ficha)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </motion.div>
                  )}
                  {ficha.status === "rascunho" && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)]"
                        size="sm"
                        onClick={() => handleEnviarConferencia(ficha)}
                        isLoading={pending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Paginação Futurista */}
      {!loading && totalPaginas > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4 p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm disabled:opacity-30"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >
              Anterior
            </Button>
          </motion.div>
          <div className="px-6 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm font-semibold text-white/90">
              Página <span className="text-[hsl(var(--primary))]">{pagina}</span> de <span className="text-white/70">{totalPaginas}</span>
            </span>
            <span className="text-xs text-white/60 ml-2">({total} fichas)</span>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm disabled:opacity-30"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
            >
              Próxima
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Form Modal Futurista */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-transparent backdrop-blur-2xl shadow-2xl"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] opacity-50" />
              
              {/* Tech corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
              
              <div className="relative z-10 overflow-y-auto max-h-[90vh] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                      {editingFicha ? "Editar Ficha de Custo" : "Nova Ficha de Custo"}
                    </h2>
                    <p className="text-sm text-white/60 mt-1">Preencha os dados da ficha de custo</p>
                  </div>
                  <motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      className="bg-white/10 hover:bg-red-500/20 border border-white/20 text-white backdrop-blur-sm"
                      size="sm"
                      onClick={() => setShowForm(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Básicos */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
                  Dados Básicos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-white/90 mb-2">Referência da Peça *</label>
                    <div className="relative">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] rounded-lg opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
                      <input
                        type="text"
                        value={formData.referenciaPeca}
                        onChange={(e) => setFormData((prev) => ({ ...prev, referenciaPeca: e.target.value }))}
                        required
                        className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(var(--primary))] focus:bg-white/10 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300"
                        placeholder="Ex: REF-001"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-white/90 mb-2">Nome da Peça *</label>
                    <div className="relative">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] rounded-lg opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
                      <input
                        type="text"
                        value={formData.nomePeca}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nomePeca: e.target.value }))}
                        required
                        className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(var(--primary))] focus:bg-white/10 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300"
                        placeholder="Nome da peça"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-white/90 mb-2">Categoria</label>
                    <div className="relative">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] rounded-lg opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
                      <input
                        type="text"
                        value={formData.categoria}
                        onChange={(e) => setFormData((prev) => ({ ...prev, categoria: e.target.value }))}
                        className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(var(--primary))] focus:bg-white/10 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300"
                        placeholder="Categoria (opcional)"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-white/90 mb-2">URL da Foto da Peça *</label>
                    <div className="relative">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent)/0.3)] rounded-lg opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
                      <input
                        type="url"
                        value={formData.fotoPecaUrl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fotoPecaUrl: e.target.value }))}
                        required
                        className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(var(--primary))] focus:bg-white/10 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Insumos */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white/90 mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[hsl(var(--accent))]" />
                  Insumos
                </h3>

                {/* Form de Insumo */}
                <div className="p-6 mb-6 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <FuturisticInput
                      label="Descrição *"
                      value={insumoForm.descricao}
                      onChange={(e) => setInsumoForm((prev) => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição do insumo"
                    />
                    <FuturisticSelect
                      label="Tipo *"
                      value={insumoForm.tipo}
                      onChange={(e) => setInsumoForm((prev) => ({ ...prev, tipo: e.target.value as TipoInsumo }))}
                    >
                      <option value="aviamento" className="bg-[#1a1f3a]">Aviamento</option>
                      <option value="servico" className="bg-[#1a1f3a]">Serviço</option>
                      <option value="terceirizacao" className="bg-[#1a1f3a]">Terceirização</option>
                      <option value="outros" className="bg-[#1a1f3a]">Outros</option>
                    </FuturisticSelect>
                    <FuturisticInput
                      label="Quantidade *"
                      type="number"
                      step="0.0001"
                      value={insumoForm.quantidade}
                      onChange={(e) => setInsumoForm((prev) => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.0000"
                    />
                    <FuturisticInput
                      label="Unidade de Medida *"
                      value={insumoForm.unidadeMedida}
                      onChange={(e) => setInsumoForm((prev) => ({ ...prev, unidadeMedida: e.target.value }))}
                      placeholder="UN, KG, M, etc"
                    />
                    <FuturisticInput
                      label="Custo Unitário *"
                      type="number"
                      step="0.01"
                      value={insumoForm.custoUnitario}
                      onChange={(e) => setInsumoForm((prev) => ({ ...prev, custoUnitario: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                    <FuturisticInput
                      label="Fornecedor"
                      value={insumoForm.fornecedorNome || ""}
                      onChange={(e) => setInsumoForm((prev) => ({ ...prev, fornecedorNome: e.target.value }))}
                      placeholder="Nome do fornecedor (opcional)"
                    />
                    <FuturisticInput
                      label="Número da Nota Fiscal"
                      value={insumoForm.notaFiscalNumero || ""}
                      onChange={(e) => setInsumoForm((prev) => ({ ...prev, notaFiscalNumero: e.target.value }))}
                      placeholder="Número da NF (opcional)"
                    />
                    <FuturisticInput
                      label="Data da Nota Fiscal"
                      type="date"
                      value={insumoForm.notaFiscalData || ""}
                      onChange={(e) => setInsumoForm((prev) => ({ ...prev, notaFiscalData: e.target.value }))}
                    />
                    <FuturisticInput
                      label="Valor da Nota Fiscal"
                      type="number"
                      step="0.01"
                      value={insumoForm.notaFiscalValor || 0}
                      onChange={(e) => setInsumoForm((prev) => ({ ...prev, notaFiscalValor: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
                    <Button
                      type="button"
                      className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)]"
                      onClick={handleAddInsumo}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Insumo
                    </Button>
                  </motion.div>
                </div>

                {/* Lista de Insumos */}
                {formData.insumos.length > 0 && (
                  <div className="space-y-3">
                    {formData.insumos.map((insumo, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="relative p-4 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-white/95 mb-1">{insumo.descricao}</p>
                            <p className="text-sm text-white/70">
                              {insumo.quantidade} {insumo.unidadeMedida} ×{" "}
                              <span className="text-[hsl(var(--primary))] font-semibold">{formatCurrency(insumo.custoUnitario)}</span> ={" "}
                              <span className="text-[hsl(var(--accent))] font-bold">{formatCurrency(insumo.quantidade * insumo.custoUnitario)}</span>
                            </p>
                          </div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              type="button"
                              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm"
                              size="sm"
                              onClick={() => handleRemoveInsumo(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              {formData.insumos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl border-2 border-[hsl(var(--primary)/0.3)] bg-gradient-to-br from-[hsl(var(--primary)/0.15)] to-[hsl(var(--accent)/0.15)] backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70 mb-1">Total de Custos</p>
                      <p className="text-3xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-[hsl(var(--accent))]" />
                        {formatCurrency(
                          formData.insumos.reduce(
                            (sum, insumo) => sum + insumo.quantidade * insumo.custoUnitario,
                            0,
                          ),
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/70 mb-1">Insumos</p>
                      <p className="text-2xl font-bold text-white">{formData.insumos.length}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)]"
                    isLoading={pending}
                  >
                    {editingFicha ? "Atualizar Ficha" : "Criar Ficha"}
                  </Button>
                </motion.div>
              </div>
            </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      {selectedFicha && (
        <FichaCustoDetailModal
          ficha={selectedFicha}
          onClose={() => setSelectedFicha(null)}
          onAprovar={() => handleAprovar(selectedFicha)}
          onReprovar={(justificativa) => handleReprovar(selectedFicha, justificativa)}
          onRefresh={async () => {
            const updated = await buscar(selectedFicha.id);
            setSelectedFicha(updated);
            await loadFichas();
          }}
          onAnexarBoleto={async (input) => {
            await anexarBoleto(selectedFicha.id, input);
            const updated = await buscar(selectedFicha.id);
            setSelectedFicha(updated);
          }}
          onPagarBoleto={async (boletoId) => {
            await pagarBoleto(selectedFicha.id, boletoId);
            const updated = await buscar(selectedFicha.id);
            setSelectedFicha(updated);
          }}
          onRemoverBoleto={async (boletoId) => {
            await removerBoleto(selectedFicha.id, boletoId);
            const updated = await buscar(selectedFicha.id);
            setSelectedFicha(updated);
          }}
          isLoading={pending}
        />
      )}
    </div>
  );
}

// Componente de Detalhes
function FichaCustoDetailModal({
  ficha,
  onClose,
  onAprovar,
  onReprovar,
  onRefresh,
  onAnexarBoleto,
  onPagarBoleto,
  onRemoverBoleto,
  isLoading,
}: {
  ficha: FichaCusto;
  onClose: () => void;
  onAprovar: () => void;
  onReprovar: (justificativa: string) => void;
  onRefresh: () => Promise<void>;
  onAnexarBoleto: (input: CreateBoletoInput) => Promise<void>;
  onPagarBoleto: (boletoId: string) => Promise<void>;
  onRemoverBoleto: (boletoId: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [showReprovarForm, setShowReprovarForm] = useState(false);
  const [showBoletoForm, setShowBoletoForm] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [boletoForm, setBoletoForm] = useState<CreateBoletoInput>({
    valorBoleto: 0,
    dataVencimento: "",
    fornecedorNome: "",
    observacoes: "",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-transparent backdrop-blur-2xl shadow-2xl"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] opacity-50" />
        
        {/* Tech corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
        
        <div className="relative z-10 overflow-y-auto max-h-[90vh] p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Ficha #{ficha.numeroSequencial}
              </h2>
              <p className="text-sm text-white/60 mt-1 font-medium">{ficha.referenciaPeca}</p>
            </div>
            <motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
              <Button
                className="bg-white/10 hover:bg-red-500/20 border border-white/20 text-white backdrop-blur-sm"
                size="sm"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>

        <div className="space-y-6">
          {/* Status e Ações */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusBadgeStyle(ficha.status)}`}>
              {ficha.status.replace(/_/g, " ")}
            </span>
            {ficha.status === "enviada_para_conferencia" && (
              <div className="flex gap-2">
                <Button variant="primary" leftIcon={<Check className="h-4 w-4" />} onClick={onAprovar} isLoading={isLoading}>
                  Aprovar
                </Button>
                <Button
                  variant="danger"
                  leftIcon={<X className="h-4 w-4" />}
                  onClick={() => setShowReprovarForm(true)}
                  isLoading={isLoading}
                >
                  Reprovar
                </Button>
              </div>
            )}
          </div>

          {/* Foto */}
          {ficha.fotoPecaUrl && (
            <div>
              <img src={ficha.fotoPecaUrl} alt={ficha.nomePeca} className="w-full max-w-md rounded border" />
            </div>
          )}

          {/* Dados Principais */}
          <GlassCard className="p-4">
            <h3 className="font-semibold mb-4">Dados da Peça</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{ficha.nomePeca}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">{ficha.categoria || "-"}</p>
              </div>
            </div>
          </GlassCard>

          {/* Insumos */}
          <div>
            <h3 className="font-semibold mb-4">Insumos ({ficha.insumos.length})</h3>
            <div className="space-y-2">
              {ficha.insumos.map((insumo, index) => (
                <GlassCard key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{insumo.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {insumo.tipo} • {insumo.fornecedorNome || "Sem fornecedor"}
                      </p>
                      {insumo.notaFiscalNumero && (
                        <p className="text-xs text-muted-foreground mt-1">
                          NF: {insumo.notaFiscalNumero}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {insumo.quantidade} {insumo.unidadeMedida} × {formatCurrency(insumo.custoUnitario)}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(insumo.custoTotal)}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Totais */}
          <GlassCard className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total de Custos:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(ficha.totalCustos)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="text-lg font-semibold">Custo Final da Peça:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(ficha.custoFinalPeca)}
              </span>
            </div>
          </GlassCard>

          {/* Boletos - Apenas para fichas aprovadas */}
          {ficha.status === "aprovada" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Boletos ({ficha.boletos?.length || 0})
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setShowBoletoForm(true)}
                >
                  Anexar Boleto
                </Button>
              </div>
              {ficha.boletos && ficha.boletos.length > 0 ? (
                <div className="space-y-2">
                  {ficha.boletos.map((boleto) => (
                    <BoletoCard
                      key={boleto.id}
                      boleto={boleto}
                      custoFinalPeca={ficha.custoFinalPeca}
                      onPagar={() => onPagarBoleto(boleto.id)}
                      onRemover={() => onRemoverBoleto(boleto.id)}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              ) : (
                <GlassCard className="p-4 text-center text-muted-foreground">
                  Nenhum boleto anexado ainda
                </GlassCard>
              )}
            </div>
          )}

          {/* Form de Boleto */}
          {showBoletoForm && (
            <GlassCard className="p-4 mt-4 border-blue-500/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Anexar Boleto
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Valor do Boleto *"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={ficha.custoFinalPeca}
                    value={boletoForm.valorBoleto.toString()}
                    onChange={(e) =>
                      setBoletoForm((prev) => ({
                        ...prev,
                        valorBoleto: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                  <FormField
                    label="Data de Vencimento *"
                    type="date"
                    value={boletoForm.dataVencimento}
                    onChange={(e) =>
                      setBoletoForm((prev) => ({
                        ...prev,
                        dataVencimento: e.target.value,
                      }))
                    }
                    required
                  />
                  <FormField
                    label="Fornecedor"
                    value={boletoForm.fornecedorNome || ""}
                    onChange={(e) =>
                      setBoletoForm((prev) => ({
                        ...prev,
                        fornecedorNome: e.target.value || null,
                      }))
                    }
                  />
                  <FormField
                    label="Código de Barras"
                    value={boletoForm.codigoBarras || ""}
                    onChange={(e) =>
                      setBoletoForm((prev) => ({
                        ...prev,
                        codigoBarras: e.target.value || null,
                      }))
                    }
                  />
                  <FormField
                    label="Linha Digitável"
                    value={boletoForm.linhaDigitavel || ""}
                    onChange={(e) =>
                      setBoletoForm((prev) => ({
                        ...prev,
                        linhaDigitavel: e.target.value || null,
                      }))
                    }
                  />
                  <FormField
                    label="URL do Arquivo"
                    type="url"
                    value={boletoForm.arquivoUrl || ""}
                    onChange={(e) =>
                      setBoletoForm((prev) => ({
                        ...prev,
                        arquivoUrl: e.target.value || null,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Observações</label>
                  <textarea
                    className="w-full p-3 border rounded-none bg-background"
                    rows={3}
                    value={boletoForm.observacoes || ""}
                    onChange={(e) =>
                      setBoletoForm((prev) => ({
                        ...prev,
                        observacoes: e.target.value || null,
                      }))
                    }
                    placeholder="Observações sobre o boleto..."
                  />
                </div>
                {boletoForm.valorBoleto > ficha.custoFinalPeca && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-600 text-sm">
                    ⚠️ O valor do boleto ({formatCurrency(boletoForm.valorBoleto)}) excede o custo final da peça ({formatCurrency(ficha.custoFinalPeca)})
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => {
                    setShowBoletoForm(false);
                    setBoletoForm({
                      valorBoleto: 0,
                      dataVencimento: "",
                      fornecedorNome: "",
                      observacoes: "",
                    });
                  }}>
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (boletoForm.valorBoleto > 0 && boletoForm.dataVencimento) {
                        try {
                          await onAnexarBoleto({
                            ...boletoForm,
                            dataVencimento: new Date(boletoForm.dataVencimento).toISOString(),
                          });
                          setShowBoletoForm(false);
                          setBoletoForm({
                            valorBoleto: 0,
                            dataVencimento: "",
                            fornecedorNome: "",
                            observacoes: "",
                          });
                          await onRefresh();
                        } catch (error: any) {
                          notificationCenter.add({
                            type: "error",
                            title: "Erro ao anexar boleto",
                            message: error.message || "Erro desconhecido",
                          });
                        }
                      }
                    }}
                    disabled={
                      boletoForm.valorBoleto <= 0 ||
                      !boletoForm.dataVencimento ||
                      boletoForm.valorBoleto > ficha.custoFinalPeca
                    }
                    isLoading={isLoading}
                  >
                    Anexar Boleto
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Informações Adicionais */}
          <GlassCard className="p-4">
            <h3 className="font-semibold mb-4">Informações</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Criado em</p>
                <p className="font-medium">{formatDate(ficha.createdAt)}</p>
              </div>
              {ficha.dataEnvioConferencia && (
                <div>
                  <p className="text-muted-foreground">Enviada para conferência em</p>
                  <p className="font-medium">{formatDate(ficha.dataEnvioConferencia)}</p>
                </div>
              )}
              {ficha.dataAprovacao && (
                <div>
                  <p className="text-muted-foreground">Aprovada em</p>
                  <p className="font-medium">{formatDate(ficha.dataAprovacao)}</p>
                </div>
              )}
              {ficha.dataReprovacao && (
                <div>
                  <p className="text-muted-foreground">Reprovada em</p>
                  <p className="font-medium">{formatDate(ficha.dataReprovacao)}</p>
                </div>
              )}
              {ficha.justificativaReprovacao && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Justificativa de Reprovação</p>
                  <p className="font-medium">{ficha.justificativaReprovacao}</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Form de Reprovação */}
        {showReprovarForm && (
          <GlassCard className="p-4 mt-4 border-red-500/20">
            <h3 className="font-semibold mb-4 text-red-600">Reprovar Ficha</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Justificativa * (mínimo 10 caracteres)
                </label>
                <textarea
                  className="w-full p-3 border rounded-none bg-background"
                  rows={4}
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Descreva o motivo da reprovação..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowReprovarForm(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    onReprovar(justificativa);
                    setShowReprovarForm(false);
                    setJustificativa("");
                  }}
                  disabled={justificativa.trim().length < 10}
                  isLoading={isLoading}
                >
                  Reprovar
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

        </div>
          </div>
        </motion.div>
      </motion.div>
  );
}
