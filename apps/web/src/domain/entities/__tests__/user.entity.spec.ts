import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../errors';
import { UserEntity } from '../user.entity';

describe('UserEntity', () => {
  describe('create', () => {
    it('should create user with valid data', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
      });

      expect(user.id).toBe('123');
      expect(user.email.getValue()).toBe('john@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.role.getValue()).toBe('admin');
      expect(user.isActive).toBe(true);
    });

    it('should use default role if not provided', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      expect(user.role.getValue()).toBe('user');
    });

    it('should throw ValidationError for empty ID', () => {
      expect(() =>
        UserEntity.create({
          id: '',
          email: 'john@example.com',
          name: 'John Doe',
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for short name', () => {
      expect(() =>
        UserEntity.create({
          id: '123',
          email: 'john@example.com',
          name: 'Jo',
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for long name', () => {
      const longName = 'a'.repeat(101);
      
      expect(() =>
        UserEntity.create({
          id: '123',
          email: 'john@example.com',
          name: longName,
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid email', () => {
      expect(() =>
        UserEntity.create({
          id: '123',
          email: 'invalid-email',
          name: 'John Doe',
        })
      ).toThrow(ValidationError);
    });
  });

  describe('fromPersistence', () => {
    it('should reconstruct entity from persistence data', () => {
      const data = {
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        isActive: true,
      };

      const user = UserEntity.fromPersistence(data);

      expect(user.id).toBe('123');
      expect(user.email.getValue()).toBe('john@example.com');
      expect(user.createdAt).toEqual(new Date('2024-01-01'));
      expect(user.updatedAt).toEqual(new Date('2024-01-02'));
    });
  });

  describe('canPerformAction', () => {
    it('should return false if user is inactive', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
      });

      const inactiveUser = user.deactivate();

      expect(inactiveUser.canPerformAction('users:write')).toBe(false);
    });

    it('should delegate to role if user is active', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
      });

      expect(user.canPerformAction('users:write')).toBe(true);
    });
  });

  describe('canManageUsers', () => {
    it('should return false if user is inactive', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
      });

      const inactiveUser = user.deactivate();

      expect(inactiveUser.canManageUsers()).toBe(false);
    });

    it('should return true for active admin', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
      });

      expect(user.canManageUsers()).toBe(true);
    });
  });

  describe('updateProfile', () => {
    it('should return new instance with updated name', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      const updated = user.updateProfile('Jane Doe');

      expect(updated.name).toBe('Jane Doe');
      expect(updated.id).toBe(user.id);
      expect(updated).not.toBe(user); // Immutability
    });

    it('should update updatedAt timestamp', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      const updated = user.updateProfile('Jane Doe');

      expect(updated.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
    });
  });

  describe('changeEmail', () => {
    it('should return new instance with updated email', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      const updated = user.changeEmail('jane@example.com');

      expect(updated.email.getValue()).toBe('jane@example.com');
      expect(updated).not.toBe(user);
    });
  });

  describe('changeRole', () => {
    it('should return new instance with updated role', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user',
      });

      const updated = user.changeRole('admin');

      expect(updated.role.getValue()).toBe('admin');
      expect(updated).not.toBe(user);
    });
  });

  describe('activate/deactivate', () => {
    it('should activate inactive user', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      const inactive = user.deactivate();
      const active = inactive.activate();

      expect(active.isActive).toBe(true);
    });

    it('should deactivate active user', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      const inactive = user.deactivate();

      expect(inactive.isActive).toBe(false);
    });

    it('should return same instance if already in desired state', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      const stillActive = user.activate();

      expect(stillActive).toBe(user);
    });
  });

  describe('equals', () => {
    it('should return true for same ID', () => {
      const user1 = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      const user2 = UserEntity.create({
        id: '123',
        email: 'jane@example.com',
        name: 'Jane Doe',
      });

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for different IDs', () => {
      const user1 = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      const user2 = UserEntity.create({
        id: '456',
        email: 'john@example.com',
        name: 'John Doe',
      });

      expect(user1.equals(user2)).toBe(false);
    });
  });

  describe('toPersistence', () => {
    it('should convert to persistence format', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
      });

      const data = user.toPersistence();

      expect(data).toEqual({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        isActive: true,
      });
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      const user = UserEntity.create({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
      });

      const json = user.toJSON();

      expect(json).toEqual({
        id: '123',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        isActive: true,
      });
    });
  });
});
