import { z } from 'zod';

/**
 * Update User Contract
 * 
 * Schema Zod para validação de entrada na atualização de usuário.
 */

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  
  email: z
    .string()
    .email('Invalid email format')
    .optional(),
  
  role: z
    .enum(['admin', 'user', 'manager', 'viewer'])
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
