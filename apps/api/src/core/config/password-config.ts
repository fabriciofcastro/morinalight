/**
 * Configuração centralizada de segurança de senha
 *
 * Define políticas de senha forte e configurações de hashing
 */

import { z } from "zod";

/**
 * Bcrypt rounds (12-14 recomendado para 2026)
 * 12 rounds = ~250ms por hash (bom equilíbrio)
 * 13 rounds = ~500ms por hash (mais seguro)
 * 14 rounds = ~1s por hash (muito seguro, pode impactar UX)
 */
export const BCRYPT_ROUNDS = 12;

/**
 * Lista de senhas comuns mais usadas (top 100)
 * Fonte: https://github.com/danielmiessler/SecLists
 */
export const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "1234567",
  "letmein",
  "trustno1",
  "dragon",
  "baseball",
  "111111",
  "iloveyou",
  "master",
  "sunshine",
  "ashley",
  "bailey",
  "passw0rd",
  "shadow",
  "123123",
  "654321",
  "superman",
  "qazwsx",
  "michael",
  "football",
  "welcome",
  "jesus",
  "ninja",
  "mustang",
  "password1",
  "123456789",
  "adobe123",
  "admin",
  "admin123",
  "root",
  "toor",
  "pass",
  "test",
  "guest",
  "info",
  "adm",
  "mysql",
  "user",
  "administrator",
  "oracle",
  "ftp",
  "pi",
  "puppet",
  "ansible",
  "ec2-user",
  "vagrant",
  "azureuser",
  "changeme",
  "Password1",
  "Password123",
  "qwerty123",
  "Qwerty123",
  "welcome123",
  "Welcome123",
  "password123",
  "Password1234",
  "admin1234",
  "root123",
  "test123",
  "demo",
  "demo123",
  "user123",
  "default",
  "12345",
  "1234",
  "123",
  "a",
  "aa",
  "aaa",
  "aaaa",
  "aaaaa",
  "aaaaaa",
  "aaaaaaa",
  "aaaaaaaa",
  "00000000",
  "11111111",
  "22222222",
  "33333333",
  "44444444",
  "55555555",
  "66666666",
  "77777777",
  "88888888",
  "99999999",
  "abcdefgh",
  "abcd1234",
  "1q2w3e4r",
  "1qaz2wsx",
  "zxcvbnm",
  "asdfghjk",
  "qwertyuiop",
]);

/**
 * Schema de validação de senha com Zod
 *
 * Requisitos:
 * - Mínimo 12 caracteres
 * - Máximo 128 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 * - Não pode ser uma senha comum
 */
export const passwordSchema = z
  .string()
  .min(12, "Senha deve ter no mínimo 12 caracteres")
  .max(128, "Senha deve ter no máximo 128 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial (!@#$%^&*)")
  .refine(
    (password) => !COMMON_PASSWORDS.has(password.toLowerCase()),
    "Senha muito comum. Escolha uma senha mais segura e única",
  );

/**
 * Valida força da senha e retorna erros detalhados
 *
 * @param password - Senha a ser validada
 * @returns Objeto com status de validação e lista de erros
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
  score: number; // 0-100
} {
  const errors: string[] = [];
  let score = 0;

  // Validar com schema Zod
  const result = passwordSchema.safeParse(password);

  if (!result.success) {
    errors.push(...result.error.errors.map((e: { message: string }) => e.message));
  } else {
    score = 100;
  }

  // Calcular score adicional baseado em complexidade
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;

  // Penalizar padrões comuns
  if (/(.)\1{2,}/.test(password)) score -= 20; // Caracteres repetidos
  if (/^[0-9]+$/.test(password)) score -= 30; // Apenas números
  if (/^[a-zA-Z]+$/.test(password)) score -= 20; // Apenas letras
  if (/123|abc|qwe|asd|zxc/i.test(password)) score -= 15; // Sequências

  score = Math.max(0, Math.min(100, score));

  return {
    valid: result.success,
    errors,
    score,
  };
}

/**
 * Gera uma senha forte aleatória
 *
 * @param length - Comprimento da senha (padrão: 16)
 * @returns Senha forte gerada
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = uppercase + lowercase + numbers + special;

  let password = "";

  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Preencher o resto aleatoriamente
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Embaralhar a senha
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Verifica se senha precisa ser atualizada (muito fraca ou antiga)
 *
 * @param passwordHash - Hash da senha atual
 * @param createdAt - Data de criação da senha
 * @returns true se senha precisa ser atualizada
 */
export function shouldUpdatePassword(passwordHash: string, createdAt: Date): boolean {
  // Verificar se hash usa bcrypt com rounds insuficientes
  const roundsMatch = passwordHash.match(/^\$2[aby]\$(\d+)\$/);
  if (roundsMatch && roundsMatch[1]) {
    const rounds = parseInt(roundsMatch[1], 10);
    if (rounds < BCRYPT_ROUNDS) {
      return true; // Hash com rounds insuficientes
    }
  }

  // Verificar se senha tem mais de 90 dias
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  if (createdAt < ninetyDaysAgo) {
    return true; // Senha muito antiga
  }

  return false;
}
