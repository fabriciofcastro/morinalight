/**
 * User Response DTO
 * 
 * Data Transfer Object para resposta de usuário.
 * Define a estrutura de dados de saída.
 */

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
