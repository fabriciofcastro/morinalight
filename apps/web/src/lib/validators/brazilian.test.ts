import { describe, it, expect } from "vitest";
import {
  validateCpf,
  formatCpf,
  validateCnpj,
  formatCnpj,
  validateCep,
  formatCep,
  validatePhone,
  formatPhone,
  validateEmail,
  validateDate,
  formatDate,
  validatePasswordStrength,
} from "./brazilian";

describe("Brazilian Validators", () => {
  describe("CPF", () => {
    it("should validate correct CPF", () => {
      expect(validateCpf("12345678909")).toBe(true);
      expect(validateCpf("11144477735")).toBe(true);
    });

    it("should reject invalid CPF", () => {
      expect(validateCpf("12345678900")).toBe(false);
      expect(validateCpf("00000000000")).toBe(false);
      expect(validateCpf("11111111111")).toBe(false);
      expect(validateCpf("123")).toBe(false);
    });

    it("should format CPF correctly", () => {
      expect(formatCpf("12345678909")).toBe("123.456.789-09");
      expect(formatCpf("12345678909")).not.toBe("12345678909");
    });
  });

  describe("CNPJ", () => {
    it("should validate correct CNPJ", () => {
      expect(validateCnpj("11222333000181")).toBe(true);
      expect(validateCnpj("11.222.333/0001-81")).toBe(true);
    });

    it("should reject invalid CNPJ", () => {
      expect(validateCnpj("11222333000180")).toBe(false);
      expect(validateCnpj("00000000000000")).toBe(false);
      expect(validateCnpj("123")).toBe(false);
    });

    it("should format CNPJ correctly", () => {
      expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
    });
  });

  describe("CEP", () => {
    it("should validate correct CEP", () => {
      expect(validateCep("12345678")).toBe(true);
      expect(validateCep("12345-678")).toBe(true);
    });

    it("should reject invalid CEP", () => {
      expect(validateCep("1234567")).toBe(false);
      expect(validateCep("123456789")).toBe(false);
      expect(validateCep("abc")).toBe(false);
    });

    it("should format CEP correctly", () => {
      expect(formatCep("12345678")).toBe("12345-678");
    });
  });

  describe("Phone", () => {
    it("should validate correct phone numbers", () => {
      expect(validatePhone("11987654321")).toBe(true);
      expect(validatePhone("(11) 98765-4321")).toBe(true);
      expect(validatePhone("1133334444")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(validatePhone("123")).toBe(false);
      expect(validatePhone("1198765432")).toBe(false);
    });

    it("should format phone correctly", () => {
      expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
      expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
    });
  });

  describe("Email", () => {
    it("should validate correct emails", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
    });
  });

  describe("Date", () => {
    it("should validate correct dates", () => {
      expect(validateDate("2024-01-15")).toBe(true);
      expect(validateDate("15/01/2024")).toBe(true);
    });

    it("should reject invalid dates", () => {
      expect(validateDate("32/01/2024")).toBe(false);
      expect(validateDate("2024-13-01")).toBe(false);
      expect(validateDate("invalid")).toBe(false);
    });

    it("should format date correctly", () => {
      const date = new Date("2024-01-15");
      expect(formatDate(date)).toMatch(/15\/01\/2024/);
    });
  });

  describe("Password Strength", () => {
    it("should validate strong passwords", () => {
      const result = validatePasswordStrength("StrongP@ss123");
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it("should reject weak passwords", () => {
      const result1 = validatePasswordStrength("123");
      expect(result1.valid).toBe(false);

      const result2 = validatePasswordStrength("password");
      expect(result2.valid).toBe(false);
    });

    it("should provide feedback", () => {
      const result = validatePasswordStrength("weak");
      expect(result.feedback).toBeDefined();
      expect(Array.isArray(result.feedback)).toBe(true);
    });
  });
});


