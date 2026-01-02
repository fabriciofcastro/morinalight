"use client";

import { Button } from "@morina/ui";
import {
  Settings,
  Plus,
  Search,
  Eye,
  Edit,
  Grid,
  List as ListIcon,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trash2,
  Filter,
  Download,
  Palette,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import {
  type StatusCustomizado,
  statusCustomizadoApi,
  type ListarStatusCustomizadosQuery,
} from "@/lib/api/status-customizado-ficha-custo";
import { notificationCenter } from "@/components/notifications/notification-center";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") return null;
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) return selectedOrgId;
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) return orgs[0].organizationId;
    } catch {
      // Ignorar erro
    }
  }
  return null;
}

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "active" | "inactive";

export function StatusCustomizadosListClient() {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [status, setStatus] = useState<StatusCustomizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [ordenacaoCampo, setOrdenacaoCampo] = useState<"nome" | "cor" | "ordem" | "createdAt">("ordem");
  const [ordenacaoDirecao, setOrdenacaoDirecao] = useState<"asc" | "desc">("asc");

  // Delete confirm state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<{ id: string; nome: string } | null>(null);

  const loadStatus = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const query: ListarStatusCustomizadosQuery = {
        busca: debouncedSearch || undefined,
        pagina,
        tamanhoPagina: 20,
        ordenacaoCampo,
        ordenacaoDirecao,
        ativo: statusFilter === "all" ? undefined : statusFilter === "active",
      };
      const data = await statusCustomizadoApi.listar(orgId, query);
      setStatus(data.status);
      setTotal(data.paginacao.total);
      setTotalPaginas(data.paginacao.totalPaginas);
    } catch (error) {
      console.error("Failed to load status", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao carregar status customizados",
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, debouncedSearch, pagina, ordenacaoCampo, ordenacaoDirecao, statusFilter]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const stats = useMemo(() => {
    return {
      total,
      active: status.filter((s) => s.ativo).length,
      inactive: status.filter((s) => !s.ativo).length,
    };
  }, [status, total]);

  const handleDelete = useCallback((id: string, nome: string) => {
    setStatusToDelete({ id, nome });
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!orgId || !statusToDelete) return;
    setDeleteLoading(true);
    try {
      await statusCustomizadoApi.deletar(orgId, statusToDelete.id);
      notificationCenter.add({
        type: "success",
        title: "Sucesso",
        message: "Status customizado deletado com sucesso",
      });
      await loadStatus();
      setDeleteDialogOpen(false);
      setStatusToDelete(null);
    } catch (error) {
      console.error("Failed to delete status", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: error instanceof Error ? error.message : "Erro ao deletar status customizado",
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [statusToDelete, loadStatus, orgId]);

  const exportarRelatorio = useCallback(() => {
    const csv = [
      ["Nome", "Cor", "Descrição", "Ordem", "Ativo", "Criado em"],
      ...status.map((s) => [
        s.nome,
        s.cor,
        s.descricao || "",
        String(s.ordem),
        s.ativo ? "Sim" : "Não",
        new Date(s.createdAt).toLocaleDateString("pt-BR"),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `status-customizados-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }, [status]);

  return (
    <div className="relative min-h-screen p-6 space-y-8">
      {/* Header Futurista */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />

        <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Settings className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Status Customizados
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Gerenciamento completo de status customizados para fichas de custo
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Palette className="h-5 w-5 text-blue-400" />
                  <span className="text-xs font-medium text-white/60">Total</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-xs font-medium text-white/60">Ativos</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="text-xs font-medium text-white/60">Inativos</span>
                </div>
                <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtros e Ações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl"
      >
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Busca */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300"
              />
            </div>

            {/* Filtro de Status */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === "all"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                  }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === "active"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                  }`}
              >
                Ativos
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === "inactive"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                  }`}
              >
                Inativos
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Ordenação */}
            <select
              value={`${ordenacaoCampo}-${ordenacaoDirecao}`}
              onChange={(e) => {
                const [campo, direcao] = e.target.value.split("-");
                setOrdenacaoCampo(campo as typeof ordenacaoCampo);
                setOrdenacaoDirecao(direcao as typeof ordenacaoDirecao);
              }}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="ordem-asc" className="bg-[#1a1f3a]">Ordem (Crescente)</option>
              <option value="ordem-desc" className="bg-[#1a1f3a]">Ordem (Decrescente)</option>
              <option value="nome-asc" className="bg-[#1a1f3a]">Nome (A-Z)</option>
              <option value="nome-desc" className="bg-[#1a1f3a]">Nome (Z-A)</option>
              <option value="createdAt-desc" className="bg-[#1a1f3a]">Mais Recentes</option>
              <option value="createdAt-asc" className="bg-[#1a1f3a]">Mais Antigos</option>
            </select>

            {/* Exportar */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={exportarRelatorio}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </motion.div>

            {/* Novo Status */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer"
                onClick={() => router.push("/admin/status-customizados-ficha-custo/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Status
              </Button>
            </motion.div>

            {/* Refresh */}
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={() => loadStatus()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Lista/Grid */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-white/40 mx-auto mb-4" />
          <p className="text-white/60">Carregando status customizados...</p>
        </div>
      ) : status.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <Palette className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 mb-2">Nenhum status customizado encontrado</p>
          <Button
            className="mt-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer"
            onClick={() => router.push("/admin/status-customizados-ficha-custo/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Status
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {status.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl hover:border-white/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-xl font-bold shadow-lg"
                    style={{ backgroundColor: s.cor }}
                  >
                    {s.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white/90 text-lg truncate">{s.nome}</h3>
                    {s.descricao && (
                      <p className="text-sm text-white/60 truncate mt-1">{s.descricao}</p>
                    )}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${s.ativo ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                  {s.ativo ? "Ativo" : "Inativo"}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                <span>Ordem: {s.ordem}</span>
                <span>{new Date(s.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer text-sm"
                  onClick={() => router.push(`/admin/status-customizados-ficha-custo/${s.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer"
                  onClick={() => handleDelete(s.id, s.nome)}
                  disabled={false}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Cor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Descrição</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Ordem</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Criado em</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/70">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {status.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white/90">{s.nome}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-white/20"
                        style={{ backgroundColor: s.cor }}
                      />
                      <span className="text-sm text-white/60 font-mono">{s.cor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/70 max-w-xs truncate">{s.descricao || "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/70">{s.ordem}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${s.ativo
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                    >
                      {s.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/60">
                      {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer"
                        onClick={() => router.push(`/admin/status-customizados-ficha-custo/${s.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer"
                        onClick={() => handleDelete(s.id, s.nome)}
                        disabled={false}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >
            Anterior
          </Button>
          <span className="text-white/70 px-4">
            Página {pagina} de {totalPaginas}
          </span>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >
            Próxima
          </Button>
        </div>
      )}



      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setStatusToDelete(null);
        }}
        onConfirm={confirmDelete}
        itemName={statusToDelete?.nome || ""}
        itemType="status customizado"
        isLoading={deleteLoading}
      />
    </div >
  );
}


