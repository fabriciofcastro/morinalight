/**
 * UpdateProductDTO
 * 
 * DTO para atualização de produto.
 * Campos opcionais pois variam conforme a necessidade de atualização.
 */
export interface UpdateProductDTO {
  id: string; // Required for identification
  name?: string;
  description?: string;
  categoryId?: string;
  brand?: string;
  unit?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  costPrice?: number;
  sellingPrice?: number;
  minStock?: number;
  maxStock?: number;
  currentStock?: number;
  imageUrl?: string;
}
