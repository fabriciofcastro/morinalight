"use client";

import { Button } from "@morina/ui";
import {
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  ArrowLeft,
  X,
  GripVertical,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { statusCustomizadoApi } from "@/lib/api/status-customizado-ficha-custo";
import type { StatusCustomizado, CreateStatusCustomizadoInput, UpdateStatusCustomizadoInput } from "@/lib/api/status-customizado-ficha-custo";
import { notificationCenter } from "@/components/notifications/notification-center";
import { PageLoader } from "@/components/ui/PageLoader";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";

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

export function StatusCustomizadosClient() {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusList, setStatusList] = useState<StatusCustomizado[]>([]);
  const [search, setSearch] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [criandoNovo, setCriandoNovo] = useState(false);
  const [statusParaExcluir, setStatusParaExcluir] = useState<StatusCustomizado | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateStatusCustomizadoInput>({
    nome: "",
    cor: "#3b82f6",
    descricao: "",
    ordem: 0,
    ativo: true,
  });

  // Carregar status
  const carregarStatus = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      // Não filtrar por ativo aqui, mostrar todos e filtrar no frontend se necessário
      const response = await statusCustomizadoApi.listar(orgId, { tamanhoPagina: 100 });
      setStatusList(response.status);
    } catch (error) {
      console.error("Erro ao carregar status:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao carregar status customizados",
      });
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void carregarStatus();
  }, [carregarStatus]);

  // Filtrar status
  const statusFiltrados = statusList.filter((status) => {
    if (!search.trim()) return true;
    const busca = search.toLowerCase();
    return (
      status.nome.toLowerCase().includes(busca) ||
      status.descricao?.toLowerCase().includes(busca) ||
      status.cor.toLowerCase().includes(busca)
    );
  });

  // Iniciar criação
  const iniciarCriacao = () => {
    setCriandoNovo(true);
    setEditandoId(null);
    setFormData({
      nome: "",
      cor: "#3b82f6",
      descricao: "",
      ordem: statusList.length,
      ativo: true,
    });
  };

  // Iniciar edição
  const iniciarEdicao = (status: StatusCustomizado) => {
    setEditandoId(status.id);
    setCriandoNovo(false);
    setFormData({
      nome: status.nome,
      cor: status.cor,
      descricao: status.descricao || "",
      ordem: status.ordem,
      ativo: status.ativo,
    });
  };

  // Cancelar edição/criação
  const cancelar = () => {
    setEditandoId(null);
    setCriandoNovo(false);
    setFormData({
      nome: "",
      cor: "#3b82f6",
      descricao: "",
      ordem: 0,
      ativo: true,
    });
  };

  // Salvar (criar ou atualizar)
  const salvar = async () => {
    if (!orgId) return;

    // Validações
    if (!formData.nome.trim()) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Nome é obrigatório",
      });
      return;
    }

    if (!formData.cor || !/^#[0-9A-Fa-f]{6}$/.test(formData.cor)) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Cor deve ser um código hexadecimal válido (ex: #3b82f6)",
      });
      return;
    }

    try {
      setSaving(true);

      if (editandoId) {
        // Atualizar
        const input: UpdateStatusCustomizadoInput = {
          nome: formData.nome.trim(),
          cor: formData.cor,
          descricao: formData.descricao?.trim() || null,
          ordem: formData.ordem,
          ativo: formData.ativo,
        };
        await statusCustomizadoApi.atualizar(orgId, editandoId, input);
        notificationCenter.add({
          type: "success",
          title: "Status atualizado",
          message: `Status "${formData.nome}" foi atualizado com sucesso.`,
        });
      } else {
        // Criar
        await statusCustomizadoApi.criar(orgId, {
          nome: formData.nome.trim(),
          cor: formData.cor,
          descricao: formData.descricao?.trim() || null,
          ordem: formData.ordem,
          ativo: formData.ativo,
        });
        notificationCenter.add({
          type: "success",
          title: "Status criado",
          message: `Status "${formData.nome}" foi criado com sucesso.`,
        });
      }

      cancelar();
      void carregarStatus();
    } catch (error) {
      console.error("Erro ao salvar status:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: error instanceof Error ? error.message : "Erro ao salvar status customizado",
      });
    } finally {
      setSaving(false);
    }
  };

  // Excluir
  const handleExcluir = async () => {
    if (!orgId || !statusParaExcluir) return;

    try {
      notificationCenter.add({
        type: "success",
        title: "Status excluído",
        message: `Status "${statusParaExcluir.nome}" foi excluído com sucesso.`,
      });
      setStatusParaExcluir(null);
      void carregarStatus();
    } catch (error) {
      console.error("Erro ao excluir status:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: error instanceof Error ? error.message : "Erro ao excluir status customizado",
      });
    }
  };

  if (loading) {
    return <PageLoader message="Carregando status customizados..." />;
  }

  return (
    <div className="relative min-h-screen p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />

        <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <Settings className="h-8 w-8 text-[hsl(var(--primary))]" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                Status Customizados
              </h1>
              <p className="text-sm text-white/60 font-medium mt-1">
                Gerencie os status personalizados para fichas de custo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={() => router.push("/fichas-custo/list")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </motion.div>
            {!criandoNovo && !editandoId && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer"
                  onClick={iniciarCriacao}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Status
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Busca */}
      {!criandoNovo && !editandoId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300"
            />
          </div>
        </motion.div>
      )}

      {/* Formulário de Criação/Edição */}
      {(criandoNovo || editandoId) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
        >
          <h2 className="text-xl font-bold text-white/90 mb-6">
            {editandoId ? "Editar Status" : "Novo Status"}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="group relative">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Nome <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 h-[48px]"
                  placeholder="Nome do status"
                />
              </div>
            </div>

            <div className="group relative">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Cor <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <div className="relative flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cor: e.target.value }))}
                    className="w-12 h-12 rounded border border-white/20 cursor-pointer flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        setFormData((prev) => ({ ...prev, cor: value }));
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 h-[48px]"
                    placeholder="#3b82f6"
                    maxLength={7}
                  />
                  <div
                    className="w-8 h-8 rounded border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: formData.cor || "#3b82f6" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-white/90 mb-2">Descrição</label>
            <div className="relative">
              <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
              <input
                type="text"
                value={formData.descricao ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 h-[48px]"
                placeholder="Descrição do status (opcional)"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ativo: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="ativo" className="text-sm text-white/80">
                  Status ativo
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={cancelar}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer"
                onClick={salvar}
                disabled={saving}
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editandoId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lista de Status */}
      {!criandoNovo && !editandoId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          {statusFiltrados.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-white/10 bg-white/[0.03]">
              <Settings className="h-12 w-12 mx-auto text-white/30 mb-4" />
              <p className="text-white/60 mb-2">
                {search ? "Nenhum status encontrado com a busca" : "Nenhum status customizado criado ainda"}
              </p>
              {!search && (
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer mt-4"
                  onClick={iniciarCriacao}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Status
                </Button>
              )}
            </div>
          ) : (
            statusFiltrados.map((status) => (
              <div
                key={status.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 border border-white/20"
                      style={{ backgroundColor: status.cor }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white/90 truncate">{status.nome}</p>
                      {status.descricao && (
                        <p className="text-xs text-white/60 truncate">{status.descricao}</p>
                      )}
                    </div>
                    {!status.ativo && (
                      <span className="px-2 py-1 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[40px] w-[40px] p-0 flex items-center justify-center"
                        onClick={() => iniciarEdicao(status)}
                        title={`Editar status "${status.nome}"`}
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[40px] w-[40px] p-0 flex items-center justify-center"
                        onClick={() => setStatusParaExcluir(status)}
                        title={`Excluir status "${status.nome}"`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      <DeleteConfirmDialog
        open={!!statusParaExcluir}
        onOpenChange={(open) => !open && setStatusParaExcluir(null)}
        onConfirm={handleExcluir}
        itemName={statusParaExcluir?.nome || ""}
        itemType="status"
        isLoading={saving}
      />
    </div>
  );
}

