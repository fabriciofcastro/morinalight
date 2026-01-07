import { describe, expect, it } from 'vitest';
import { ValidationError } from '../errors';
import { Email } from '../email';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create email with valid format', () => {
      const email = Email.create('user@example.com');
      
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = Email.create('USER@EXAMPLE.COM');
      
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  user@example.com  ');
      
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should throw ValidationError for empty email', () => {
      expect(() => Email.create('')).toThrow(ValidationError);
      expect(() => Email.create('   ')).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid format', () => {
      expect(() => Email.create('invalid')).toThrow(ValidationError);
      expect(() => Email.create('invalid@')).toThrow(ValidationError);
      expect(() => Email.create('@example.com')).toThrow(ValidationError);
      expect(() => Email.create('user@')).toThrow(ValidationError);
    });
  });

  describe('getDomain', () => {
    it('should return email domain', () => {
      const email = Email.create('user@example.com');
      
      expect(email.getDomain()).toBe('example.com');
    });
  });

  describe('getUsername', () => {
    it('should return email username', () => {
      const email = Email.create('john.doe@example.com');
      
      expect(email.getUsername()).toBe('john.doe');
    });
  });

  describe('equals', () => {
    it('should return true for same email', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('user@example.com');
      
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for same email with different case', () => {
      const email1 = Email.create('USER@example.com');
      const email2 = Email.create('user@EXAMPLE.com');
      
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('user1@example.com');
      const email2 = Email.create('user2@example.com');
      
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email value', () => {
      const email = Email.create('user@example.com');
      
      expect(email.toString()).toBe('user@example.com');
    });
  });

  describe('toJSON', () => {
    it('should serialize to string', () => {
      const email = Email.create('user@example.com');
      
      expect(email.toJSON()).toBe('user@example.com');
    });
  });
});
