"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileSignature,
  Percent,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

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

  function getRepresentanteNome(representanteId: string) {
    const representante = representantes.find((r) => r.representanteId === representanteId);
    return representante?.nome || "Representante não encontrado";
  }

  function getStatusIcon(status: Comissao["status"]) {
    switch (status) {
      case "paga":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "calculada":
        return <FileSignature className="h-4 w-4 text-blue-500" />;
      case "pendente":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "cancelada":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  }

  function getStatusLabel(status: Comissao["status"]) {
    switch (status) {
      case "paga":
        return "Paga";
      case "calculada":
        return "Assinada";
      case "pendente":
        return "Pendente";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  }

  const totalComissoes = comissoes.reduce((sum, c) => sum + c.valorComissao, 0);
  const totalPagas = comissoes
    .filter((c) => c.status === "paga")
    .reduce((sum, c) => sum + c.valorComissao, 0);
  const totalPendentes = comissoes
    .filter((c) => c.status === "pendente" || c.status === "calculada")
    .reduce((sum, c) => sum + c.valorComissao, 0);

  const filteredComissoes = comissoes.filter((comissao) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const representanteNome = getRepresentanteNome(comissao.representanteId).toLowerCase();
      if (!representanteNome.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                Total de Comissões
              </p>
              <p className="mt-1 text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalComissoes)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-[var(--primary)]" />
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                Pagas
              </p>
              <p className="mt-1 text-2xl font-bold text-green-500">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalPagas)}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                Pendentes
              </p>
              <p className="mt-1 text-2xl font-bold text-yellow-500">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalPendentes)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </GlassCard>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]" />
            <Input
              type="search"
              placeholder="Buscar por representante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="calculada">Assinada</option>
            <option value="paga">Paga</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <select
            value={representanteFilter}
            onChange={(e) => setRepresentanteFilter(e.target.value)}
            className="rounded-md border border-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] bg-[var(--bg)] px-3 py-2 text-sm"
            disabled={loadingRepresentantes}
          >
            <option value="all">Todos os representantes</option>
            {representantes.map((rep) => (
              <option key={rep.representanteId} value={rep.representanteId}>
                {rep.nome}
              </option>
            ))}
          </select>
          <Input
            type="date"
            placeholder="Data início"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-[150px]"
          />
          <Input
            type="date"
            placeholder="Data fim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-[150px]"
          />
        </div>
      </div>

      {/* Lista de comissões */}
      {loading ? (
        <div className="py-12 text-center text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          Carregando comissões...
        </div>
      ) : filteredComissoes.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]" />
          <p className="mt-4 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
            Nenhuma comissão encontrada.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredComissoes.map((comissao) => (
            <GlassCard key={comissao.comissaoId} className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    {getStatusIcon(comissao.status)}
                    <h3 className="font-semibold">{getStatusLabel(comissao.status)}</h3>
                    <span className="text-lg font-bold text-[var(--primary)]">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(comissao.valorComissao)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {getRepresentanteNome(comissao.representanteId)}
                      </span>
                      <Percent className="ml-2 h-4 w-4" />
                      <span>{comissao.percentualAplicado.toFixed(2)}%</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Venda: {new Date(comissao.dataVenda).toLocaleDateString("pt-BR")}
                    </p>
                    {comissao.dataCalculo && (
                      <p className="flex items-center gap-2">
                        <FileSignature className="h-4 w-4" />
                        Assinada em: {new Date(comissao.dataCalculo).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    {comissao.dataPagamento && (
                      <p className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Paga em: {new Date(comissao.dataPagamento).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    {comissao.numeroPagamento && (
                      <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                        Nº Pagamento: {comissao.numeroPagamento}
                      </p>
                    )}
                    {comissao.observacoes && (
                      <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                        {comissao.observacoes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {comissao.status === "pendente" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssinarComissao(comissao.comissaoId)}
                      disabled={pending}
                    >
                      <FileSignature className="h-4 w-4" />
                      Assinar
                    </Button>
                  )}
                  {comissao.status === "calculada" && (
                    <Button
                      size="sm"
                      onClick={() => handlePagarComissao(comissao.comissaoId)}
                      disabled={pending}
                    >
                      <CreditCard className="h-4 w-4" />
                      Marcar como Paga
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
