"use client";

import {
  Button,
  cn,
  DataTable,
  ViewToggle,
  ListPageLayout,
  BulkActionsBar,
  Badge,
  StatsGroup,
  StatCard,
} from "@morina/ui";
import {
  Building2,
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
  Percent,
  Phone,
  User,
  XCircle,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { ColumnDef } from "@tanstack/react-table";

type Representante = {
  representanteId: string;
  orgId: string;
  clienteId: string;
  nome: string;
  documento: string;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  percentualComissao: number;
  status: "ativo" | "inativo" | "suspenso";
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  cliente?: {
    nome: string;
    tipo: "fisica" | "juridica";
  };
};

type RepresentantesResponse = {
  itens: Representante[];
  proximoCursor?: string | null;
};

export function RepresentantesClient() {
  const router = useRouter();
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [selectedRepresentantes, setSelectedRepresentantes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRepresentantes();
  }, []);

  async function loadRepresentantes() {
    setLoading(true);
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
      notificationCenter.add({
        type: "error",
        title: "Erro ao carregar representantes",
        message: "Não foi possível carregar a lista de representantes",
      });
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnDef<Representante>[] = [
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
      accessorKey: "nome",
      header: "Representante",
      cell: ({ row }) => {
        const rep = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{rep.nome}</p>
              <p className="text-xs font-mono text-white/40">{rep.documento}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "cliente.nome",
      header: "Cliente Vinculado",
      cell: ({ row }) => {
        const rep = row.original;
        return (
          <div className="flex items-center gap-2">
            {rep.cliente?.tipo === "juridica" ? (
              <Building2 className="h-4 w-4 text-blue-400" />
            ) : (
              <User className="h-4 w-4 text-purple-400" />
            )}
            <span className="text-sm text-white/60">
              {rep.cliente?.nome || "Não informado"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "percentualComissao",
      header: "Comissão",
      cell: ({ row }) => {
        const rep = row.original;
        return (
          <div className="flex items-center gap-1.5 font-semibold text-blue-400">
            <Percent className="h-4 w-4" />
            <span>{rep.percentualComissao.toFixed(2)}%</span>
          </div>
        );
      },
    },
    {
      id: "contato",
      header: "Contato",
      cell: ({ row }) => {
        const rep = row.original;
        return (
          <div className="space-y-1">
            {rep.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-white/40" />
                <span className="text-white/60">{rep.email}</span>
              </div>
            )}
            {(rep.telefone || rep.celular) && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-white/40" />
                <span className="text-white/60">
                  {rep.celular || rep.telefone}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const rep = row.original;
        const statusConfig = {
          ativo: { variant: "success", label: "Ativo", icon: CheckCircle2 },
          inativo: { variant: "secondary", label: "Inativo", icon: XCircle },
          suspenso: { variant: "warning", label: "Suspenso", icon: XCircle },
        }[rep.status];
        return (
          <Badge
            variant={statusConfig.variant as any}
            icon={<statusConfig.icon className="h-3 w-3" />}
            size="sm"
          >
            {statusConfig.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const rep = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/representantes/${rep.representanteId}/edit`);
              }}
              className="hover:bg-white/10"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredRepresentantes = useMemo(() => {
    return representantes.filter(rep =>
      rep.nome.toLowerCase().includes(search.toLowerCase()) ||
      rep.documento.includes(search)
    );
  }, [representantes, search]);

  function handleToggleSelect(id: string) {
    setSelectedRepresentantes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const stats = useMemo(() => ({
    total: representantes.length,
    ativos: representantes.filter(r => r.status === "ativo").length,
    inativos: representantes.filter(r => r.status !== "ativo").length,
  }), [representantes]);

  return (
    <ListPageLayout
      header={{
        title: "Representantes",
        description: "Gerencie seus representantes e comissões",
        icon: User,
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Representantes" }
        ],
        stats: (
          <StatsGroup layout="horizontal" showSeparators>
            <StatCard
              label="Total"
              value={stats.total}
              icon={User}
              variant="primary"
            />
            <StatCard
              label="Ativos"
              value={stats.ativos}
              icon={CheckCircle2}
              variant="success"
            />
            <StatCard
              label="Inativos/Suspensos"
              value={stats.inativos}
              icon={XCircle}
              variant="secondary"
            />
          </StatsGroup>
        )
      }}
      controls={{
        searchValue: search,
        onSearchChange: setSearch,
        viewToggle: (
          <ViewToggle
            value={viewMode}
            onChange={setViewMode}
          />
        ),
        actions: (
          <Button onClick={() => router.push("/representantes/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Representante
          </Button>
        ),
        bulkActions: (
          <BulkActionsBar
            selectedCount={selectedRepresentantes.size}
            onCancel={() => setSelectedRepresentantes(new Set())}
            actions={[
              {
                label: "Exportar",
                icon: <Download className="h-4 w-4" />,
                onClick: () => alert("Exportando..."),
                variant: "outline",
              },
              {
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => alert("Excluindo..."),
                variant: "destructive",
              },
            ]}
          />
        ),
        hasSelection: selectedRepresentantes.size > 0,
      }}
    >
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/40">
            Carregando...
          </div>
        ) : viewMode === "list" ? (
          <DataTable
            columns={columns}
            data={filteredRepresentantes}
            onRowClick={(row) => router.push(`/representantes/${row.representanteId}`)}
            enableRowSelection
            state={{
              rowSelection: Object.fromEntries(
                Array.from(selectedRepresentantes).map((id) => [
                  filteredRepresentantes.findIndex((r) => r.representanteId === id),
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
                  if (filteredRepresentantes[index]) newSelected.add(filteredRepresentantes[index].representanteId);
                });
                setSelectedRepresentantes(newSelected);
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredRepresentantes.map((rep) => {
              const statusConfig = {
                ativo: { variant: "success", label: "Ativo", icon: CheckCircle2 },
                inativo: { variant: "secondary", label: "Inativo", icon: XCircle },
                suspenso: { variant: "warning", label: "Suspenso", icon: XCircle },
              }[rep.status];

              return (
                <div
                  key={rep.representanteId}
                  onClick={() => handleToggleSelect(rep.representanteId)}
                  className={cn(
                    "group relative p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:border-white/20 cursor-pointer overflow-hidden",
                    selectedRepresentantes.has(rep.representanteId) && "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20"
                  )}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -z-10 transition-opacity opacity-0 group-hover:opacity-100" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-blue-500/10 transition-colors">
                        <User className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                          {rep.nome}
                        </h3>
                        <p className="text-xs font-mono text-white/40 uppercase tracking-tighter">{rep.documento}</p>
                      </div>
                    </div>
                    <Badge variant={statusConfig.variant as any} icon={<statusConfig.icon className="h-3 w-3" />} size="sm">
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-6">
                    {rep.cliente && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Building2 className="w-4 h-4 text-white/30" />
                        <span>{rep.cliente.nome}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Percent className="w-4 h-4 text-blue-400/70" />
                      <span>Comissão: <span className="text-white font-medium">{rep.percentualComissao}%</span></span>
                    </div>
                    {(rep.email || rep.celular) && (
                      <div className="pt-2 space-y-1.5 border-t border-white/5">
                        {rep.email && (
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{rep.email}</span>
                          </div>
                        )}
                        {rep.celular && (
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{rep.celular}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/representantes/${rep.representanteId}/edit`);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/representantes/${rep.representanteId}`);
                      }}
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredRepresentantes.length === 0 && (
          <div className="py-20 text-center text-white/40">
            Nenhum representante encontrado
          </div>
        )}
      </div>
    </ListPageLayout>
  );
}
