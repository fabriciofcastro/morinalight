import { ValidationError } from '../errors';

/**
 * User Role Value Object
 * 
 * Representa o papel/função de um usuário no sistema.
 * Imutável e type-safe.
 */

export enum UserRoleType {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

export class UserRole {
  private constructor(private readonly role: UserRoleType) {}

  static create(role: string): UserRole {
    const normalizedRole = role.toLowerCase();
    
    if (!Object.values(UserRoleType).includes(normalizedRole as UserRoleType)) {
      throw new ValidationError(
        `Invalid user role: ${role}. Must be one of: ${Object.values(UserRoleType).join(', ')}`,
        'role',
        role
      );
    }

    return new UserRole(normalizedRole as UserRoleType);
  }

  static admin(): UserRole {
    return new UserRole(UserRoleType.ADMIN);
  }

  static user(): UserRole {
    return new UserRole(UserRoleType.USER);
  }

  static manager(): UserRole {
    return new UserRole(UserRoleType.MANAGER);
  }

  static viewer(): UserRole {
    return new UserRole(UserRoleType.VIEWER);
  }

  getValue(): UserRoleType {
    return this.role;
  }

  isAdmin(): boolean {
    return this.role === UserRoleType.ADMIN;
  }

  isManager(): boolean {
    return this.role === UserRoleType.MANAGER;
  }

  canManageUsers(): boolean {
    return this.role === UserRoleType.ADMIN || this.role === UserRoleType.MANAGER;
  }

  canEditContent(): boolean {
    return this.role !== UserRoleType.VIEWER;
  }

  hasPermission(permission: string): boolean {
    // Implementar lógica de permissões baseada em role
    const permissions: Record<UserRoleType, string[]> = {
      [UserRoleType.ADMIN]: ['*'], // Admin tem todas as permissões
      [UserRoleType.MANAGER]: ['users:read', 'users:write', 'content:read', 'content:write'],
      [UserRoleType.USER]: ['content:read', 'content:write'],
      [UserRoleType.VIEWER]: ['content:read'],
    };

    const rolePermissions = permissions[this.role];
    return rolePermissions.includes('*') || rolePermissions.includes(permission);
  }

  equals(other: UserRole): boolean {
    return this.role === other.role;
  }

  toString(): string {
    return this.role;
  }

  toJSON(): string {
    return this.role;
  }
}
