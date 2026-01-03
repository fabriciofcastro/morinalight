"use client";

import { Button, cn, FormField, FormSelect, FormTextarea, GlassCard, Input } from "@morina/ui";
import { CheckCircle2, Clock, Edit, FileText, Plus, Search, Trash2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeaders } from "@/lib/auth-client";
import { offlineApi } from "@/lib/offline-api";

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

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

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

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Barra de ações */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-3))]" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadProducts();
              }
            }}
            className="pl-10 cursor-text"
          />
        </div>

        <div className="flex items-center gap-3">
          <FormSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[200px]"
          >
            <option value="all">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="aguardando_aprovacao">Aguardando Aprovação</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </FormSelect>

          <Button onClick={() => setShowForm(true)} className="cursor-pointer">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

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
              <Button type="button" variant="secondary" onClick={handleCancel}>
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
        <p className="text-sm text-[hsl(var(--text-3))]">Carregando...</p>
      ) : filteredProducts.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-[hsl(var(--text-3))]" />
          <p className="mt-4 text-sm text-[hsl(var(--text-3))]">Nenhum produto encontrado.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <GlassCard key={product.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[hsl(var(--text-1))]">{product.name}</h3>
                  {product.description && (
                    <p className="mt-2 text-sm text-[hsl(var(--text-2))] line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    product.status === "ativo" && "bg-green-500/10 text-green-600",
                    product.status === "aguardando_aprovacao" && "bg-yellow-500/10 text-yellow-600",
                    product.status === "rascunho" && "bg-gray-500/10 text-gray-600",
                    product.status === "inativo" && "bg-red-500/10 text-red-600",
                  )}
                >
                  {product.status === "ativo" && <CheckCircle2 className="h-3 w-3" />}
                  {product.status === "aguardando_aprovacao" && <Clock className="h-3 w-3" />}
                  {product.status === "inativo" && <XCircle className="h-3 w-3" />}
                  {STATUS_LABELS[product.status]}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="cursor-pointer text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
