import { z } from 'zod';

/**
 * Create User Contract
 * 
 * Schema Zod para validação de entrada na criação de usuário.
 * Garante type-safety em boundaries da aplicação.
 */

export const createUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  
  role: z
    .enum(['admin', 'user', 'manager', 'viewer'])
    .optional()
    .default('user'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
