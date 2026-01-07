import { describe, expect, it } from 'vitest';
import { ValidationError } from '../errors';
import { UserRole, UserRoleType } from '../user-role';

describe('UserRole Value Object', () => {
  describe('create', () => {
    it('should create role with valid type', () => {
      const role = UserRole.create('admin');
      
      expect(role.getValue()).toBe(UserRoleType.ADMIN);
    });

    it('should normalize role to lowercase', () => {
      const role = UserRole.create('ADMIN');
      
      expect(role.getValue()).toBe(UserRoleType.ADMIN);
    });

    it('should throw ValidationError for invalid role', () => {
      expect(() => UserRole.create('invalid')).toThrow(ValidationError);
      expect(() => UserRole.create('superadmin')).toThrow(ValidationError);
    });
  });

  describe('factory methods', () => {
    it('should create admin role', () => {
      const role = UserRole.admin();
      
      expect(role.getValue()).toBe(UserRoleType.ADMIN);
      expect(role.isAdmin()).toBe(true);
    });

    it('should create user role', () => {
      const role = UserRole.user();
      
      expect(role.getValue()).toBe(UserRoleType.USER);
      expect(role.isAdmin()).toBe(false);
    });

    it('should create manager role', () => {
      const role = UserRole.manager();
      
      expect(role.getValue()).toBe(UserRoleType.MANAGER);
      expect(role.isManager()).toBe(true);
    });

    it('should create viewer role', () => {
      const role = UserRole.viewer();
      
      expect(role.getValue()).toBe(UserRoleType.VIEWER);
    });
  });

  describe('canManageUsers', () => {
    it('should return true for admin', () => {
      const role = UserRole.admin();
      
      expect(role.canManageUsers()).toBe(true);
    });

    it('should return true for manager', () => {
      const role = UserRole.manager();
      
      expect(role.canManageUsers()).toBe(true);
    });

    it('should return false for user', () => {
      const role = UserRole.user();
      
      expect(role.canManageUsers()).toBe(false);
    });

    it('should return false for viewer', () => {
      const role = UserRole.viewer();
      
      expect(role.canManageUsers()).toBe(false);
    });
  });

  describe('canEditContent', () => {
    it('should return true for admin', () => {
      const role = UserRole.admin();
      
      expect(role.canEditContent()).toBe(true);
    });

    it('should return true for user', () => {
      const role = UserRole.user();
      
      expect(role.canEditContent()).toBe(true);
    });

    it('should return false for viewer', () => {
      const role = UserRole.viewer();
      
      expect(role.canEditContent()).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      const role = UserRole.admin();
      
      expect(role.hasPermission('users:write')).toBe(true);
      expect(role.hasPermission('content:delete')).toBe(true);
      expect(role.hasPermission('anything')).toBe(true);
    });

    it('should return true for manager with user permissions', () => {
      const role = UserRole.manager();
      
      expect(role.hasPermission('users:read')).toBe(true);
      expect(role.hasPermission('users:write')).toBe(true);
    });

    it('should return false for user with admin permissions', () => {
      const role = UserRole.user();
      
      expect(role.hasPermission('users:write')).toBe(false);
    });

    it('should return true for user with content permissions', () => {
      const role = UserRole.user();
      
      expect(role.hasPermission('content:read')).toBe(true);
      expect(role.hasPermission('content:write')).toBe(true);
    });

    it('should return false for viewer with write permissions', () => {
      const role = UserRole.viewer();
      
      expect(role.hasPermission('content:write')).toBe(false);
      expect(role.hasPermission('users:write')).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same role', () => {
      const role1 = UserRole.admin();
      const role2 = UserRole.create('admin');
      
      expect(role1.equals(role2)).toBe(true);
    });

    it('should return false for different roles', () => {
      const role1 = UserRole.admin();
      const role2 = UserRole.user();
      
      expect(role1.equals(role2)).toBe(false);
    });
  });
});
