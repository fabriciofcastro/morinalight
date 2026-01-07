/**
 * CreateProductDTO
 * 
 * DTO para criação de produto.
 */
export interface CreateProductDTO {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  brand?: string;
  unit: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  costPrice: number;
  sellingPrice: number;
  minStock?: number;
  maxStock?: number;
  currentStock?: number;
  imageUrl?: string;
}
