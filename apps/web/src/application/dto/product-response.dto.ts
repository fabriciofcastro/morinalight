/**
 * ProductResponseDTO
 * 
 * DTO para resposta de produto.
 */
export interface ProductResponseDTO {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  brand?: string;
  unit: string;
  status: string;
  costPrice: number;
  sellingPrice: number;
  margin: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
