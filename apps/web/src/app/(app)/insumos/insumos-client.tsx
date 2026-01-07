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
    CheckCircle2,
    Clock,
    DollarSign,
    Download,
    Edit,
    Layers,
    Package,
    Plus,
    Tag,
    Trash2,
    XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

type Insumo = {
  id: string;
  name: string;
  reference: string;
  type: string;
  status: "ativo" | "em_falta" | "descontinuado";
  price: number;
  stock: number;
  unit: string;
  createdAt: string;
};

type InsumosResponse = {
  itens: Insumo[];
};

export function InsumosClient() {
  const router = useRouter();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedInsumos, setSelectedInsumos] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const loadInsumos = useCallback(async () => {
    setLoading(true);
    try {
      // Usando mockup por enquanto ou API real se existir
      const response = await fetch(`/api/catalogo/insumos`, {
        headers: {
          ...getAuthHeadersWithTenant(),
        },
      });

      if (response.ok) {
        const data: InsumosResponse = await response.json();
        setInsumos(data.itens || []);
      } else {
        // Fallback mockup para desenvolvimento
        setInsumos([
          {
            id: "1",
            name: "Zíper Invisível 20cm",
            reference: "ZIP-001",
            type: "Aviamento",
            status: "ativo",
            price: 2.5,
            stock: 150,
            unit: "unid",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Botão de Madrepérola",
            reference: "BOT-042",
            type: "Aviamento",
            status: "em_falta",
            price: 0.8,
            stock: 0,
            unit: "unid",
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            name: "Linha de Poliéster Preta",
            reference: "LIN-100",
            type: "Fio",
            status: "ativo",
            price: 15.0,
            stock: 25,
            unit: "cone",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Erro ao carregar insumos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInsumos();
  }, [loadInsumos]);

  const filteredInsumos = useMemo(() => {
    if (!search) return insumos;
    const lowSearch = search.toLowerCase();
    return insumos.filter(
      (i) =>
        i.name.toLowerCase().includes(lowSearch) ||
        i.reference.toLowerCase().includes(lowSearch)
    );
  }, [insumos, search]);

  const columns: ColumnDef<Insumo>[] = [
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
      accessorKey: "name",
      header: "Insumo",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{row.original.name}</span>
          <span className="text-xs text-white/40">{row.original.reference}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variants = {
          ativo: { variant: "success", label: "Ativo", icon: CheckCircle2 },
          em_falta: { variant: "warning", label: "Em falta", icon: Clock },
          descontinuado: { variant: "danger", label: "Descontinuado", icon: XCircle },
        };
        const config = variants[status];
        return (
          <Badge variant={config.variant as any} icon={<config.icon className="h-3 w-3" />} size="sm">
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Preço",
      cell: ({ row }) => (
        <span className="font-medium">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(row.original.price)}
          <span className="text-xs text-white/40 ml-1">/{row.original.unit}</span>
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/insumos/${row.original.id}/edit`)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  function handleToggleSelect(id: string) {
    setSelectedInsumos((prev) => {
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
    total: insumos.length,
    emFalta: insumos.filter(i => i.status === "em_falta").length,
    ativos: insumos.filter(i => i.status === "ativo").length,
  }), [insumos]);

  return (
    <ListPageLayout
      header={{
        title: "Insumos",
        description: "Gerencie seus insumos e aviamentos",
        icon: Package,
        breadcrumbs: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Insumos" }
        ],
        stats: (
          <StatsGroup layout="horizontal" showSeparators>
            <StatCard label="Total Items" value={stats.total} icon={Package} variant="primary" />
            <StatCard label="Ativos" value={stats.ativos} icon={CheckCircle2} variant="success" />
            <StatCard label="Em Falta" value={stats.emFalta} icon={Clock} variant="warning" />
          </StatsGroup>
        )
      }}
      controls={{
        searchValue: search,
        onSearchChange: setSearch,
        viewToggle: <ViewToggle value={viewMode} onChange={setViewMode} />,
        actions: (
          <Button onClick={() => router.push("/insumos/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Insumo
          </Button>
        ),
        bulkActions: (
          <BulkActionsBar
            selectedCount={selectedInsumos.size}
            onCancel={() => setSelectedInsumos(new Set())}
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
              }
            ]}
          />
        ),
        hasSelection: selectedInsumos.size > 0,
      }}
    >
      <AnimatePresence mode="popLayout">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInsumos.map((insumo, index) => {
              const statusConfig = {
                ativo: { variant: "success", label: "Ativo", icon: CheckCircle2 },
                em_falta: { variant: "warning", label: "Em falta", icon: Clock },
                descontinuado: { variant: "danger", label: "Descontinuado", icon: XCircle },
              }[insumo.status];

              return (
                <motion.div
                  key={insumo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  onClick={() => handleToggleSelect(insumo.id)}
                >
                  <GlassCard
                    className={cn(
                      "p-6 h-full flex flex-col group relative overflow-hidden transition-all duration-300 hover:border-primary/30 cursor-pointer",
                      selectedInsumos.has(insumo.id) && "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                          <Layers className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{insumo.name}</h3>
                          <p className="text-xs font-mono text-white/40 uppercase tracking-tighter">{insumo.reference}</p>
                        </div>
                      </div>
                      <Badge variant={statusConfig.variant as any} icon={<statusConfig.icon className="h-3 w-3" />} size="sm">
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">
                          <DollarSign className="h-3 w-3" />
                          Preço
                        </div>
                        <p className="text-sm font-bold text-white">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(insumo.price)}
                          <span className="text-[10px] opacity-40 ml-1">/{insumo.unit}</span>
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">
                          <Tag className="h-3 w-3" />
                          Estoque
                        </div>
                        <p className={cn("text-sm font-bold", insumo.stock === 0 ? "text-red-400" : "text-white")}>
                          {insumo.stock} {insumo.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/insumos/${insumo.id}/edit`);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
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
            data={filteredInsumos}
            loading={loading}
            enableRowSelection
            state={{
              rowSelection: Object.fromEntries(
                Array.from(selectedInsumos).map((id) => [
                  filteredInsumos.findIndex((i) => i.id === id),
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
                  if (filteredInsumos[index]) newSelected.add(filteredInsumos[index].id);
                });
                setSelectedInsumos(newSelected);
              }
            }}
          />
        )}
      </AnimatePresence>
    </ListPageLayout>
  );
}





