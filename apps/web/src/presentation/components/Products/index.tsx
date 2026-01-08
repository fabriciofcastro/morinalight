"use client";

import { ProductResponseDTO } from "@/application/dto";
import { ProductStatus } from "@/domain/entities";
import {
    Badge,
    BulkActionsBar,
    Button,
    DataTable,
    GlassCard,
    ListPageLayout,
    StatCard,
    StatsGroup,
    ViewToggle
} from "@morina/ui";
import type { ColumnDef } from "@tanstack/react-table";
import {
    CheckCircle2,
    Clock,
    Download,
    Edit,
    FileText,
    Plus,
    Trash2,
    XCircle
} from "lucide-react";
import { useMemo } from "react";

import { ProductCard } from "./components/ProductCard";
import { ProductForm } from "./components/ProductForm";
import { STATUS_LABELS } from "./Products.types";
import { useProductsClient } from "./use-products-client";

export function Products() {
  const {
    search,
    setSearch,
    statusFilter,
    viewMode,
    setViewMode,
    selectedProducts,
    setSelectedProducts,
    showForm,
    setShowForm,
    editingProduct,
    loading,
    filteredProducts,
    stats,
    handleEdit,
    handleCancel,
    handleSubmit,
    handleDelete,
    handleToggleSelect,
    isPending
  } = useProductsClient();

  const columns = useMemo<ColumnDef<ProductResponseDTO>[]>(
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
          const status = row.original.status as ProductStatus;
          let variant: "success" | "warning" | "danger" | "secondary" = "secondary";
          let Icon = Clock;

          if (status === ProductStatus.ACTIVE) {
            variant = "success";
            Icon = CheckCircle2;
          } else if (status === ProductStatus.INACTIVE) {
            variant = "danger";
            Icon = XCircle;
          }

          return (
            <Badge variant={variant} icon={<Icon className="h-3 w-3" />} size="sm">
              {STATUS_LABELS[status] || status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Criado em",
        cell: ({ row }) => {
          const date = row.original.createdAt ? new Date(row.original.createdAt) : null;
          return date ? date.toLocaleDateString("pt-BR") : "-";
        },
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
    [handleEdit, handleDelete],
  );

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
            onChange={(val: any) => setViewMode(val)}
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
          <ProductForm
            initialData={editingProduct ? { name: editingProduct.name, description: editingProduct.description || "" } : { name: "", description: "" }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isPending={isPending}
            buttonLabel={editingProduct ? "Atualizar" : "Criar"}
          />
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
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProducts.has(product.id)}
                onToggleSelect={handleToggleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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
