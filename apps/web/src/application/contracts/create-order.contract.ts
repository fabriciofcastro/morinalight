import { z } from 'zod';

/**
 * Address Schema
 */
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  number: z.string().min(1, 'Number is required'),
  neighborhood: z.string().min(1, 'Neighborhood is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters (UF)'),
  zipCode: z.string().min(8, 'Invalid zip code'),
  country: z.string().min(1, 'Country is required'),
  complement: z.string().optional(),
});

/**
 * Order Item Schema
 */
const orderItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  discount: z.number().nonnegative().optional(),
});

/**
 * Create Order Schema
 */
export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  paymentMethod: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  shipping: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
