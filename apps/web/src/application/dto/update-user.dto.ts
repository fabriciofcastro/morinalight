/**
 * Update User DTO
 * 
 * Data Transfer Object para atualização de usuário.
 */

export interface UpdateUserDTO {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}
