/**
 * Create User DTO
 * 
 * Data Transfer Object para criação de usuário.
 * Define a estrutura de dados de entrada.
 */

export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
  role?: string;
}
