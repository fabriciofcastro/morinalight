import { ProductResponseDTO } from "@/application/dto";
import { ProductStatus } from "@/domain/entities";

export interface ProductsState {
  search: string;
  statusFilter: string;
  viewMode: "grid" | "list";
  selectedProducts: Set<string>;
  showForm: boolean;
  editingProduct: ProductResponseDTO | null;
  formData: {
    name: string;
    description: string;
  };
}

export const STATUS_LABELS = {
  [ProductStatus.ACTIVE]: "Ativo",
  [ProductStatus.INACTIVE]: "Inativo",
  [ProductStatus.ARCHIVED]: "Arquivado",
} as const;
