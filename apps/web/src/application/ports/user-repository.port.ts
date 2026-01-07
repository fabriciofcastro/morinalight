import type { UserEntity } from '@/domain/entities';
import type { Email } from '@/domain/value-objects';
import type { Option } from '@/shared/kernel/types';

/**
 * User Repository Port
 * 
 * Interface que define o contrato para persistência de usuários.
 * Implementação concreta ficará em infrastructure/database.
 * 
 * Segue Dependency Inversion Principle (SOLID):
 * - Application define a interface
 * - Infrastructure implementa
 */

export interface IUserRepository {
  /**
   * Salva ou atualiza usuário
   */
  save(user: UserEntity): Promise<void>;

  /**
   * Busca usuário por ID
   */
  findById(id: string): Promise<Option<UserEntity>>;

  /**
   * Busca usuário por email
   */
  findByEmail(email: Email): Promise<Option<UserEntity>>;

  /**
   * Lista todos os usuários
   */
  findAll(): Promise<UserEntity[]>;

  /**
   * Lista usuários por role
   */
  findByRole(role: string): Promise<UserEntity[]>;

  /**
   * Deleta usuário
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica se email já existe
   */
  existsByEmail(email: Email): Promise<boolean>;
}
