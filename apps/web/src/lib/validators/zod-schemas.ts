/**
 * Schemas Zod com validações brasileiras
 */

import { z } from "zod";
import { validateCpf, validateCnpj, validateCep, validatePhone, validateEmail } from "./brazilian";
import { validatePasswordStrength } from "./brazilian";

/**
 * Schema para CPF
 */
export const cpfSchema = z
  .string()
  .min(11, "CPF deve ter 11 dígitos")
  .max(14, "CPF inválido")
  .refine((cpf) => validateCpf(cpf), {
    message: "CPF inválido",
  });

/**
 * Schema para CNPJ
 */
export const cnpjSchema = z
  .string()
  .min(14, "CNPJ deve ter 14 dígitos")
  .max(18, "CNPJ inválido")
  .refine((cnpj) => validateCnpj(cnpj), {
    message: "CNPJ inválido",
  });

/**
 * Schema para CEP
 */
export const cepSchema = z
  .string()
  .min(8, "CEP deve ter 8 dígitos")
  .max(9, "CEP inválido")
  .refine((cep) => validateCep(cep), {
    message: "CEP inválido",
  });

/**
 * Schema para telefone brasileiro
 */
export const phoneSchema = z
  .string()
  .min(10, "Telefone inválido")
  .max(15, "Telefone inválido")
  .refine((phone) => validatePhone(phone), {
    message: "Telefone inválido",
  });

/**
 * Schema para email com validação de domínio opcional
 */
export const emailSchema = (checkDomain = false) =>
  z
    .string()
    .email("Email inválido")
    .refine((email) => validateEmail(email, checkDomain), {
      message: checkDomain ? "Domínio de email inválido" : "Email inválido",
    });

/**
 * Schema para senha com validação de força
 */
export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .refine(
    (password) => {
      const validation = validatePasswordStrength(password);
      return validation.valid;
    },
    (password) => {
      const validation = validatePasswordStrength(password);
      return {
        message: validation.errors.join(", "),
      };
    },
  );

/**
 * Schema para data brasileira (DD/MM/YYYY)
 */
export const dateSchema = z
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato DD/MM/YYYY")
  .refine((date) => {
    const [day, month, year] = date.split("/").map(Number);
    const d = new Date(year, month - 1, day);
    return (
      d.getDate() === day &&
      d.getMonth() === month - 1 &&
      d.getFullYear() === year
    );
  }, {
    message: "Data inválida",
  });

/**
 * Schema para URL
 */
export const urlSchema = z.string().url("URL inválida");

/**
 * Schema para documento (CPF ou CNPJ)
 */
export const documentSchema = z
  .string()
  .refine(
    (doc) => {
      const cleaned = doc.replace(/\D/g, "");
      if (cleaned.length === 11) return validateCpf(doc);
      if (cleaned.length === 14) return validateCnpj(doc);
      return false;
    },
    {
      message: "Documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos) válido",
    },
  );


