import { ValidationError } from '../errors';
import { Email, UserRole } from '../value-objects';

/**
 * User Entity
 * 
 * Entidade de domínio que representa um usuário do sistema.
 * Contém regras de negócio relacionadas a usuários.
 * 
 * Princípios:
 * - Imutável (métodos retornam novas instâncias)
 * - Auto-validada
 * - Rica em comportamento (não anêmica)
 */

export interface UserProps {
  id: string;
  email: Email;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export class UserEntity {
  private constructor(private readonly props: UserProps) {
    this.validate();
  }

  /**
   * Factory method para criar novo usuário
   */
  static create(params: {
    id: string;
    email: string;
    name: string;
    role?: string;
  }): UserEntity {
    return new UserEntity({
      id: params.id,
      email: Email.create(params.email),
      name: params.name,
      role: params.role ? UserRole.create(params.role) : UserRole.user(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });
  }

  /**
   * Reconstrói entidade a partir de dados persistidos
   */
  static fromPersistence(data: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  }): UserEntity {
    return new UserEntity({
      id: data.id,
      email: Email.create(data.email),
      name: data.name,
      role: UserRole.create(data.role),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isActive: data.isActive,
    });
  }

  /**
   * Validações de domínio
   */
  private validate(): void {
    if (!this.props.id || this.props.id.trim().length === 0) {
      throw new ValidationError('User ID cannot be empty', 'id');
    }

    if (!this.props.name || this.props.name.trim().length < 3) {
      throw new ValidationError('User name must be at least 3 characters', 'name', this.props.name);
    }

    if (this.props.name.length > 100) {
      throw new ValidationError('User name cannot exceed 100 characters', 'name', this.props.name);
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  /**
   * Regras de negócio
   */

  canPerformAction(action: string): boolean {
    if (!this.isActive) {
      return false;
    }
    return this.role.hasPermission(action);
  }

  canManageUsers(): boolean {
    return this.isActive && this.role.canManageUsers();
  }

  isAdmin(): boolean {
    return this.role.isAdmin();
  }

  /**
   * Métodos de mutação (retornam novas instâncias)
   */

  updateProfile(name: string): UserEntity {
    return new UserEntity({
      ...this.props,
      name,
      updatedAt: new Date(),
    });
  }

  changeEmail(newEmail: string): UserEntity {
    return new UserEntity({
      ...this.props,
      email: Email.create(newEmail),
      updatedAt: new Date(),
    });
  }

  changeRole(newRole: string): UserEntity {
    return new UserEntity({
      ...this.props,
      role: UserRole.create(newRole),
      updatedAt: new Date(),
    });
  }

  activate(): UserEntity {
    if (this.isActive) {
      return this;
    }

    return new UserEntity({
      ...this.props,
      isActive: true,
      updatedAt: new Date(),
    });
  }

  deactivate(): UserEntity {
    if (!this.isActive) {
      return this;
    }

    return new UserEntity({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  /**
   * Comparação
   */
  equals(other: UserEntity): boolean {
    return this.id === other.id;
  }

  /**
   * Serialização para persistência
   */
  toPersistence(): {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  } {
    return {
      id: this.id,
      email: this.email.getValue(),
      name: this.name,
      role: this.role.getValue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }

  /**
   * Serialização JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      email: this.email.getValue(),
      name: this.name,
      role: this.role.getValue(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isActive: this.isActive,
    };
  }
}
