import { ValidationError } from '@/domain/errors';
import { describe, expect, it } from 'vitest';
import { CPF } from '../cpf';

describe('CPF Value Object', () => {
  describe('create', () => {
    it('should create CPF with valid number', () => {
      const cpf = CPF.create('12345678909');
      
      expect(cpf.getValue()).toBe('12345678909');
    });

    it('should create CPF from formatted string', () => {
      const cpf = CPF.create('123.456.789-09');
      
      expect(cpf.getValue()).toBe('12345678909');
    });

    it('should throw ValidationError for invalid length', () => {
      expect(() => CPF.create('123')).toThrow(ValidationError);
      expect(() => CPF.create('123456789012')).toThrow(ValidationError);
    });

    it('should throw ValidationError for known invalid CPFs', () => {
      expect(() => CPF.create('00000000000')).toThrow(ValidationError);
      expect(() => CPF.create('11111111111')).toThrow(ValidationError);
      expect(() => CPF.create('22222222222')).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid check digits', () => {
      expect(() => CPF.create('12345678900')).toThrow(ValidationError);
    });
  });

  describe('getFormatted', () => {
    it('should return formatted CPF', () => {
      const cpf = CPF.create('12345678909');
      
      expect(cpf.getFormatted()).toBe('123.456.789-09');
    });
  });

  describe('equals', () => {
    it('should return true for same CPF', () => {
      const cpf1 = CPF.create('12345678909');
      const cpf2 = CPF.create('123.456.789-09');
      
      expect(cpf1.equals(cpf2)).toBe(true);
    });

    it('should return false for different CPFs', () => {
      const cpf1 = CPF.create('12345678909');
      const cpf2 = CPF.create('98765432100');
      
      expect(cpf1.equals(cpf2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted CPF', () => {
      const cpf = CPF.create('12345678909');
      
      expect(cpf.toString()).toBe('123.456.789-09');
    });
  });

  describe('toJSON', () => {
    it('should serialize to unformatted string', () => {
      const cpf = CPF.create('123.456.789-09');
      
      expect(cpf.toJSON()).toBe('12345678909');
    });
  });
});
