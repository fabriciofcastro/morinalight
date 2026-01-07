import { z } from 'zod';

/**
 * Zod Schema para validação de criação de produto
 */
export const createProductSchema = z.object({
  sku: z.string()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU cannot exceed 50 characters')
    .regex(/^[A-Z0-9\-_]+$/, 'SKU can only contain letters, numbers, hyphens and underscores'),
  
  name: z.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Product name cannot exceed 200 characters'),
  
  description: z.string().optional(),
  
  categoryId: z.string()
    .min(1, 'Category is required'),
  
  brand: z.string().optional(),
  
  unit: z.string()
    .min(1, 'Unit is required'),
  
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  
  costPrice: z.number()
    .min(0, 'Cost price cannot be negative'),
  
  sellingPrice: z.number()
    .min(0, 'Selling price cannot be negative'),
  
  minStock: z.number()
    .min(0, 'Min stock cannot be negative')
    .optional(),
  
  maxStock: z.number()
    .min(0, 'Max stock cannot be negative')
    .optional(),
  
  currentStock: z.number()
    .min(0, 'Current stock cannot be negative')
    .optional(),
  
  imageUrl: z.string().url('Invalid image URL').optional(),
}).refine(
  (data) => data.sellingPrice >= data.costPrice,
  {
    message: 'Selling price must be greater than or equal to cost price',
    path: ['sellingPrice'],
  }
).refine(
  (data) => !data.maxStock || !data.minStock || data.maxStock >= data.minStock,
  {
    message: 'Max stock must be greater than or equal to min stock',
    path: ['maxStock'],
  }
);

export type CreateProductInput = z.infer<typeof createProductSchema>;
