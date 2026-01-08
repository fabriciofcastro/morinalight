"use client";

import {
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  Plus,
  Search,
  Trash2,
  XCircle,
  LayoutGrid,
  List,
  Download,
} from "lucide-react";
import {
  Button,
  cn,
  FormField,
  FormSelect,
  FormTextarea,
  GlassCard,
  Input,
  ListPageLayout,
  StatsGroup,
  StatCard,
  DataTable,
  ViewToggle,
  Badge,
  BulkActionsBar,
} from "@morina/ui";
import { useCallback, useEffect, useState, useTransition, useMemo } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeaders } from "@/lib/auth-client";
import { offlineApi } from "@/lib/offline-api";
import type { ColumnDef } from "@tanstack/react-table";

type Product = {
  id: string;
  name: string;
  description: string | null;
  status: "rascunho" | "aguardando_aprovacao" | "ativo" | "inativo";
  createdAt: string;
  updatedAt: string;
};

type ProductsResponse = {
  itens: Product[];
  cursor?: string;
  total?: number;
};

const STATUS_LABELS = {
  rascunho: "Rascunho",
  aguardando_aprovacao: "Aguardando Aprovação",
  ativo: "Ativo",
  inativo: "Inativo",
} as const;

type ViewModeType = "grid" | "list";

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<ViewModeType>("grid");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
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
        header: "Nome do Produto",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-white">{row.original.name}</span>
            {row.original.description && (
              <span className="text-xs text-white/40 line-clamp-1">{row.original.description}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          let variant: "success" | "warning" | "danger" | "secondary" = "secondary";
          let Icon = Clock;

          if (status === "ativo") {
            variant = "success";
            Icon = CheckCircle2;
          } else if (status === "aguardando_aprovacao") {
            variant = "warning";
            Icon = Clock;
          } else if (status === "inativo") {
            variant = "danger";
            Icon = XCircle;
          }

          return (
            <Badge variant={variant} icon={<Icon className="h-3 w-3" />} size="sm">
              {STATUS_LABELS[status]}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Criado em",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row.original)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.original.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (search.length >= 2) {
        params.append("busca", search);
      }

      const response = await fetch(`/api/catalogo/produtos?${params.toString()}`, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: ProductsResponse = await response.json();
        setProducts(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const response = editingProduct
          ? await offlineApi.products.update(editingProduct.id, formData)
          : await offlineApi.products.create(formData);

        const data = await response.json();

        if (response.ok || data.queued) {
          notificationCenter.add({
            type: "success",
            title: editingProduct ? "Produto atualizado" : "Produto criado",
            message: `${formData.name} foi ${editingProduct ? "atualizado" : "criado"} com sucesso`,
          });
          setShowForm(false);
          setEditingProduct(null);
          setFormData({ name: "", description: "" });

          if (data.queued) {
            setTimeout(() => loadProducts(), 2000);
          } else {
            await loadProducts();
          }
        } else {
          const errorMessage = data.message || "Erro ao salvar produto";
          notificationCenter.add({
            type: "error",
            title: "Erro ao salvar produto",
            message: errorMessage,
          });
        }
      } catch (error) {
        console.error("Erro ao salvar produto:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao salvar produto. Tente novamente.",
        });
      }
    });
  }

  async function handleDelete(id: string) {
    const product = products.find((p) => p.id === id);
    const productName = product?.name || "este produto";

    if (
      !confirm(`Tem certeza que deseja excluir ${productName}? Esta ação não pode ser desfeita.`)
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await offlineApi.products.delete(id);
        const data = await response.json();

        if (response.ok || data.queued) {
          notificationCenter.add({
            type: "success",
            title: "Produto excluído",
            message: `${productName} foi excluído com sucesso`,
          });
          if (data.queued) {
            setTimeout(() => loadProducts(), 2000);
          } else {
            await loadProducts();
          }
        } else {
          const errorMessage = data.message || "Erro ao excluir produto";
          notificationCenter.add({
            type: "error",
            title: "Erro ao excluir produto",
            message: errorMessage,
          });
        }
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao excluir produto. Tente novamente.",
        });
      }
    });
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: "", description: "" });
  }

  const filteredProducts = products.filter((product) => {
    if (search && search.length >= 2) {
      return (
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const stats = useMemo(
    () => ({
      total: products.length,
      ativos: products.filter((p) => p.status === "ativo").length,
      pendentes: products.filter((p) => ["rascunho", "aguardando_aprovacao"].includes(p.status))
        .length,
    }),
    [products],
  );

  function handleToggleSelect(id: string) {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <ListPageLayout
      header={{
        icon: FileText,
        title: "Produtos",
        description: "Gestão do Catálogo de Produtos e Serviços",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Catálogo", href: "/products" },
          { label: "Produtos", href: "/products" },
        ],
        stats: (
          <StatsGroup layout="horizontal" showSeparators>
            <StatCard
              icon={FileText}
              label="Total"
              value={stats.total}
              variant="primary"
              subtitle="Produtos cadastrados"
            />
            <StatCard
              icon={CheckCircle2}
              label="Ativos"
              value={stats.ativos}
              variant="success"
              subtitle={`${Math.round((stats.ativos / (stats.total || 1)) * 100)}% do total`}
            />
            <StatCard
              icon={Clock}
              label="Pendentes"
              value={stats.pendentes}
              variant="warning"
              subtitle="Aguardando aprovação"
            />
          </StatsGroup>
        ),
      }}
      controls={{
        searchValue: search,
        onSearchChange: (val) => setSearch(val),
        searchPlaceholder: "Buscar por nome ou descrição...",
        viewToggle: (
          <ViewToggle
            value={viewMode}
            onChange={setViewMode}
          />
        ),
        actions: (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        ),
        bulkActions: (
          <BulkActionsBar
            selectedCount={selectedProducts.size}
            onCancel={() => setSelectedProducts(new Set())}
            actions={[
              {
                label: "Exportar",
                icon: <Download className="h-4 w-4" />,
                onClick: () => { },
                variant: "outline",
              },
              {
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => { },
                variant: "destructive",
              }
            ]}
          />
        ),
        hasSelection: selectedProducts.size > 0,
      }}
    >
      <div className="space-y-6">
        {/* Formulário */}
        {showForm && (
          <GlassCard className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField label="Nome do Produto" required fieldId="name">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormField>

              <FormTextarea
                label="Descrição"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Salvando..." : editingProduct ? "Atualizar" : "Criar"} Produto
                </Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Lista de produtos */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-white/10 border-t-[hsl(var(--primary))] rounded-full animate-spin mb-4" />
            <p className="text-white/40 font-mono animate-pulse">CARREGANDO DADOS...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-white/20 mb-4" />
            <p className="text-white/60">
              {search
                ? "Nenhum produto encontrado com os filtros aplicados."
                : "Nenhum produto cadastrado. Clique em 'Novo Produto' para começar."}
            </p>
          </GlassCard>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <GlassCard
                key={product.id}
                className={cn(
                  "p-6 group relative overflow-hidden transition-all duration-300 hover:border-primary/30 cursor-pointer",
                  selectedProducts.has(product.id) && "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                )}
                onClick={() => handleToggleSelect(product.id)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -z-10 transition-all duration-500 group-hover:bg-primary/10" />

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-white/50 line-clamp-2 min-h-[40px]">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Badge
                    variant={
                      product.status === "ativo" ? "success" :
                        product.status === "inativo" ? "danger" :
                          product.status === "aguardando_aprovacao" ? "warning" : "secondary"
                    }
                    icon={
                      product.status === "ativo" ? <CheckCircle2 className="h-3 w-3" /> :
                        product.status === "inativo" ? <XCircle className="h-3 w-3" /> :
                          <Clock className="h-3 w-3" />
                    }
                    size="sm"
                  >
                    {STATUS_LABELS[product.status]}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredProducts}
            emptyMessage="Nenhum produto encontrado"
            enableRowSelection
            state={{
              rowSelection: Object.fromEntries(
                Array.from(selectedProducts).map((id) => [
                  filteredProducts.findIndex((p) => p.id === id),
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
                  if (filteredProducts[index]) newSelected.add(filteredProducts[index].id);
                });
                setSelectedProducts(newSelected);
              }
            }}
          />
        )}
      </div>
    </ListPageLayout>
  );
}
