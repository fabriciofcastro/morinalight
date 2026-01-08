import { ProductResponseDTO } from "@/application/dto";
import { notificationCenter } from "@/shared/ui/notification-center";
import { ProductStatus } from "@/domain/entities";
import { useCreateProduct } from "@/presentation/hooks/use-create-product";
import { useDeleteProduct } from "@/presentation/hooks/use-delete-product";
import { useProducts } from "@/presentation/hooks/use-products";
import { useUpdateProduct } from "@/presentation/hooks/use-update-product";
import { useCallback, useMemo, useState } from "react";

export function useProductsClient() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponseDTO | null>(null);

  const { data: products = [], isLoading: loading } = useProducts({ search, status: statusFilter });
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleEdit = useCallback((product: ProductResponseDTO) => {
    setEditingProduct(product);
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingProduct(null);
  }, []);

  const handleSubmit = useCallback(async (formData: { name: string; description: string }) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          name: formData.name,
          description: formData.description,
        });
        notificationCenter.add({
          type: "success",
          title: "Produto atualizado",
          message: `${formData.name} foi atualizado com sucesso`,
        });
      } else {
        await createProduct.mutateAsync({
          name: formData.name,
          description: formData.description,
          status: ProductStatus.ACTIVE,
          sku: `SKU-${Date.now()}`,
          costPrice: 0,
          sellingPrice: 0,
          minStock: 0,
          currentStock: 0,
          categoryId: 'general',
          unit: 'un'
        });
        notificationCenter.add({
          type: "success",
          title: "Produto criado",
          message: `${formData.name} foi criado com sucesso`,
        });
      }
      handleCancel();
    } catch (error: any) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao salvar produto",
        message: error.message || "Erro desconhecido",
      });
    }
  }, [editingProduct, updateProduct, createProduct, handleCancel]);

  const handleDelete = useCallback(async (id: string) => {
    const product = products.find((p) => p.id === id);
    const productName = product?.name || "este produto";

    if (!confirm(`Tem certeza que deseja excluir ${productName}? Estação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(id);
      notificationCenter.add({
        type: "success",
        title: "Produto excluído",
        message: `${productName} foi excluído com sucesso`,
      });
      if (selectedProducts.has(id)) {
          setSelectedProducts(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
          });
      }
    } catch (error: any) {
       notificationCenter.add({
        type: "error",
        title: "Erro ao excluir produto",
        message: error.message || "Erro desconhecido",
      });
    }
  }, [products, deleteProduct, selectedProducts]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
        if (statusFilter !== "all" && product.status !== statusFilter) return false;
        if (search && search.length >= 2) {
          return (
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.description?.toLowerCase().includes(search.toLowerCase())
          );
        }
        return true;
      });
  }, [products, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: products.length,
      ativos: products.filter((p) => p.status === ProductStatus.ACTIVE).length,
      pendentes: 0,
    }),
    [products],
  );

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    selectedProducts,
    setSelectedProducts,
    showForm,
    setShowForm,
    editingProduct,
    loading,
    products,
    filteredProducts,
    stats,
    handleEdit,
    handleCancel,
    handleSubmit,
    handleDelete,
    handleToggleSelect,
    isPending: createProduct.isPending || updateProduct.isPending
  };
}
