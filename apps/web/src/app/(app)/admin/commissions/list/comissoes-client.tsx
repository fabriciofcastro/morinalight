"use client";

import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import {
    Badge,
    BulkActionsBar,
    Button,
    cn,
    DataTable,
    GlassCard,
    ListPageLayout,
    StatCard,
    StatsGroup,
    ViewToggle,
} from "@morina/ui";
import { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import {
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    FileSignature,
    Percent,
    User,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

type Comissao = {
  comissaoId: string;
  orgId: string;
  representanteId: string;
  clienteId: string;
  vendaId: string;
  valorComissao: number;
  percentualAplicado: number;
  dataVenda: string;
  dataCalculo: string;
  dataPagamento: string | null;
  status: "pendente" | "calculada" | "paga" | "cancelada";
  observacoes: string | null;
  assinadoEm: string | null;
  assinadoPor: string | null;
  numeroPagamento: string | null;
  comprovantePagamento: string | null;
  createdAt: string;
  updatedAt: string;
};

type Representante = {
  representanteId: string;
  nome: string;
};

type ComissoesResponse = {
  itens: Comissao[];
  proximoCursor?: string | null;
};

type RepresentantesResponse = {
  itens: Representante[];
};

export function ComissoesClient() {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRepresentantes, setLoadingRepresentantes] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [representanteFilter, setRepresentanteFilter] = useState<string>("all");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedComissoes, setSelectedComissoes] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const loadRepresentantes = useCallback(async () => {
    setLoadingRepresentantes(true);
    try {
      const response = await fetch(`/api/representantes`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: RepresentantesResponse = await response.json();
        setRepresentantes(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar representantes:", error);
    } finally {
      setLoadingRepresentantes(false);
    }
  }, []);

  const loadComissoes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (representanteFilter !== "all") {
        params.append("representanteId", representanteFilter);
      }
      if (dataInicio) {
        params.append("dataInicio", dataInicio);
      }
      if (dataFim) {
        params.append("dataFim", dataFim);
      }

      const response = await fetch(`/api/comissoes?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: ComissoesResponse = await response.json();
        setComissoes(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar comissões:", error);
    } finally {
      setLoading(false);
    }
  }, [dataFim, dataInicio, representanteFilter, statusFilter]);

  useEffect(() => {
    void loadRepresentantes();
    void loadComissoes();
  }, [loadComissoes, loadRepresentantes]);

  async function handleAssinarComissao(comissaoId: string) {
    if (!confirm("Tem certeza que deseja assinar esta comissão?")) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/comissoes/${comissaoId}/assinar`, {
          method: "POST",
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          await loadComissoes();
          alert("Comissão assinada com sucesso!");
        } else {
          const error = await response.json();
          alert(error.message || "Erro ao assinar comissão");
        }
      } catch (error) {
        console.error("Erro ao assinar comissão:", error);
        alert("Erro ao assinar comissão");
      }
    });
  }

  async function handlePagarComissao(comissaoId: string) {
    const numeroPagamento = prompt("Número do pagamento (opcional):");
    const comprovantePagamento = prompt("Comprovante de pagamento (opcional):");

    if (!confirm("Confirmar pagamento da comissão?")) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/comissoes/${comissaoId}/pagar`, {
          method: "POST",
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            numeroPagamento: numeroPagamento || undefined,
            comprovantePagamento: comprovantePagamento || undefined,
          }),
        });

        if (response.ok) {
          await loadComissoes();
          alert("Comissão marcada como paga!");
        } else {
          const error = await response.json();
          alert(error.message || "Erro ao pagar comissão");
        }
      } catch (error) {
        console.error("Erro ao pagar comissão:", error);
        alert("Erro ao pagar comissão");
      }
    });
  }

  function handleToggleSelect(id: string) {
    setSelectedComissoes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleBulkExport() {
    if (selectedComissoes.size === 0) return;
    alert(`Exportando ${selectedComissoes.size} comissões...`);
  }

  function getRepresentanteNome(representanteId: string) {
    const representante = representantes.find((r) => r.representanteId === representanteId);
    return representante?.nome || "Representante não encontrado";
  }

  const columns: ColumnDef<Comissao>[] = [
    {
      id: "selection",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500"
        />
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const comissao = row.original;
        const statusMap = {
          paga: { label: "Paga", icon: CheckCircle2, variant: "success" },
          calculada: { label: "Assinada", icon: FileSignature, variant: "info" },
          pendente: { label: "Pendente", icon: Clock, variant: "warning" },
          cancelada: { label: "Cancelada", icon: XCircle, variant: "danger" },
        } as const;
        const config = statusMap[comissao.status];
        return (
          <Badge variant={config.variant} icon={<config.icon className="h-3 w-3" />} size="sm">
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "valorComissao",
      header: "Valor",
      cell: ({ row }) => (
        <span className="font-bold text-white">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(row.original.valorComissao)}
        </span>
      ),
    },
    {
      id: "representante",
      header: "Representante",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-white/40" />
          <span>{getRepresentanteNome(row.original.representanteId)}</span>
        </div>
      ),
    },
    {
      accessorKey: "percentualAplicado",
      header: "%",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-blue-400 font-medium">
          <Percent className="h-3 w-3" />
          {row.original.percentualAplicado.toFixed(2)}%
        </div>
      ),
    },
    {
      accessorKey: "dataVenda",
      header: "Data Venda",
      cell: ({ row }) => new Date(row.original.dataVenda).toLocaleDateString("pt-BR"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const comissao = row.original;
        return (
          <div className="flex justify-end gap-2">
            {comissao.status === "pendente" && (
              <Button size="sm" variant="outline" onClick={() => handleAssinarComissao(comissao.comissaoId)} disabled={pending}>
                Assinar
              </Button>
            )}
            {comissao.status === "calculada" && (
              <Button size="sm" onClick={() => handlePagarComissao(comissao.comissaoId)} disabled={pending}>
                Pagar
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Ver Detalhes">
              <CreditCard className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const totalComissoes = comissoes.reduce((sum, c) => sum + c.valorComissao, 0);
  const totalPagas = comissoes.filter((c) => c.status === "paga").reduce((sum, c) => sum + c.valorComissao, 0);
  const totalPendentes = comissoes.filter((c) => c.status === "pendente" || c.status === "calculada").reduce((sum, c) => sum + c.valorComissao, 0);

  const filteredComissoes = comissoes.filter((comissao) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const representanteNome = getRepresentanteNome(comissao.representanteId).toLowerCase();
      return representanteNome.includes(searchLower);
    }
    return true;
  });

  return (
    <ListPageLayout
      header={{
        title: "Comissões",
        description: "Controle de pagamentos e assinaturas de representantes",
        icon: DollarSign,
        breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Comissões" }],
        stats: (
          <StatsGroup layout="horizontal" showSeparators>
            <StatCard label="Total" value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalComissoes)} icon={DollarSign} variant="primary" />
            <StatCard label="Pagas" value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPagas)} icon={CheckCircle2} variant="success" />
            <StatCard label="Pendentes" value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPendentes)} icon={Clock} variant="warning" />
          </StatsGroup>
        )
      }}
      controls={{
        searchValue: search,
        onSearchChange: setSearch,
        filterButton: (
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-1 text-sm text-white outline-hidden hover:border-white/20 transition-colors"
            >
              <option value="all" className="bg-gray-900">Todos os status</option>
              <option value="pendente" className="bg-gray-900">Pendente</option>
              <option value="calculada" className="bg-gray-900">Assinada</option>
              <option value="paga" className="bg-gray-900">Paga</option>
              <option value="cancelada" className="bg-gray-900">Cancelada</option>
            </select>
            <select
              value={representanteFilter}
              onChange={(e) => setRepresentanteFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-1 text-sm text-white outline-hidden hover:border-white/20 transition-colors"
              disabled={loadingRepresentantes}
            >
              <option value="all" className="bg-gray-900">Todos os representantes</option>
              {representantes.map((rep) => (
                <option key={rep.representanteId} value={rep.representanteId} className="bg-gray-900">
                  {rep.nome}
                </option>
              ))}
            </select>
          </div>
        ),
        viewToggle: <ViewToggle value={viewMode} onChange={setViewMode} />,
        bulkActions: (
          <BulkActionsBar
            selectedCount={selectedComissoes.size}
            onCancel={() => setSelectedComissoes(new Set())}
            actions={[
              {
                label: "Exportar PDF",
                icon: <Download className="h-4 w-4" />,
                onClick: handleBulkExport,
                variant: "outline",
              },
              {
                label: "Assinar Lote",
                onClick: () => alert("Assinar em lote..."),
                variant: "default",
              }
            ]}
          />
        ),
        hasSelection: selectedComissoes.size > 0,
      }}
    >
      <AnimatePresence mode="popLayout">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComissoes.map((comissao, index) => {
              const statusMap = {
                paga: { label: "Paga", icon: CheckCircle2, variant: "success" },
                calculada: { label: "Assinada", icon: FileSignature, variant: "info" },
                pendente: { label: "Pendente", icon: Clock, variant: "warning" },
                cancelada: { label: "Cancelada", icon: XCircle, variant: "danger" },
              } as const;
              const config = statusMap[comissao.status];
              const Icon = config.icon;

              return (
                <motion.div
                  key={comissao.comissaoId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  onClick={() => handleToggleSelect(comissao.comissaoId)}
                >
                  <GlassCard
                    className={cn(
                      "p-6 h-full flex flex-col group relative overflow-hidden transition-all duration-300 hover:border-primary/30 cursor-pointer",
                      selectedComissoes.has(comissao.comissaoId) && "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                          <DollarSign className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(comissao.valorComissao)}
                          </h3>
                          <p className="text-xs text-white/40">Comissão de Venda</p>
                        </div>
                      </div>
                      <Badge variant={config.variant as any} icon={<Icon className="h-3 w-3" />} size="sm">
                        {config.label}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <User className="h-4 w-4 text-white/30" />
                        <span>{getRepresentanteNome(comissao.representanteId)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Percent className="h-4 w-4 text-white/30" />
                        <span>{comissao.percentualAplicado.toFixed(2)}% do valor total</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="h-4 w-4 text-white/30" />
                        <span>Venda em {new Date(comissao.dataVenda).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                      {comissao.status === "pendente" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssinarComissao(comissao.comissaoId);
                          }}
                          disabled={pending}
                        >
                          Assinar
                        </Button>
                      )}
                      {comissao.status === "calculada" && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePagarComissao(comissao.comissaoId);
                          }}
                          disabled={pending}
                        >
                          Pagar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="px-3" onClick={(e) => e.stopPropagation()}>
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredComissoes}
            loading={loading}
            enableRowSelection
            state={{
              rowSelection: Object.fromEntries(
                Array.from(selectedComissoes).map((id) => [
                  filteredComissoes.findIndex((c) => c.comissaoId === id),
                  true
                ]).filter(([index]) => index !== -1)
              )
            }}
            onRowSelectionChange={(updater) => {
              if (typeof updater === "function") {
                const newState = updater({});
                const newSelected = new Set<string>();
                Object.keys(newState).forEach((key) => {
                  const index = parseInt(key);
                  if (filteredComissoes[index]) newSelected.add(filteredComissoes[index].comissaoId);
                });
                setSelectedComissoes(newSelected);
              }
            }}
          />
        )}
      </AnimatePresence>
    </ListPageLayout>
  );
}
